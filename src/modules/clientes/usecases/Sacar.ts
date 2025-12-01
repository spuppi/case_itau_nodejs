import { prisma } from '../../../infra/database/prisma-client';
import { HttpError } from '../../../core/http/http-error';
import { Cliente } from '../domain/Cliente';
import { logger } from '../../../core/logging/logger';
import { BusinessLogContext } from '../../../core/logging/log-schema';
import { metrics } from '../../../core/metrics/metrics';

export class SacarUseCase {
  async execute(
    clienteId: number,
    valor: number,
    correlationId: string,
    idempotencyKey: string
  ) {
    if (valor <= 0) {
      metrics.increment('api.clientes.saque.failure.count', {
        operation: 'saque',
        status: 'failure',
        motivo: 'valor_invalido'
      });
      throw HttpError.badRequest('Valor de saque deve ser positivo');
    }

    const endpoint = `/clientes/${clienteId}/sacar`;
    const metodo = 'POST';

    const result = await prisma.$transaction(async (trx) => {
      const baseContext: BusinessLogContext = {
        logType: 'business',
        domain: 'clientes',
        entity: 'cliente',
        entityId: clienteId,
        operation: 'saque',
        correlationId,
        amount: valor,
        idempotencyKey
      };

      logger.info(
        {
          ...baseContext,
          outcome: 'SUCCESS'
        },
        'Iniciando saque'
      );

      const jaExiste = await trx.idempotenciaOperacao.findUnique({
        where: { chave: idempotencyKey }
      });

      if (jaExiste) {
        logger.info(
          {
            ...baseContext,
            outcome: 'IDEMPOTENT_REPLAY'
          },
          'Saque idempotente: chave já utilizada'
        );

        const clienteAtual = await trx.cliente.findUnique({
          where: { id: clienteId }
        });

        if (!clienteAtual) {
          throw HttpError.notFound('Cliente não encontrado');
        }

        return clienteAtual;
      }

      const cliente = await trx.cliente.findUnique({
        where: { id: clienteId }
      });

      if (!cliente) {
        logger.warn(
          {
            ...baseContext,
            outcome: 'FAILED',
            errorCode: 'CLIENTE_NAO_ENCONTRADO',
            errorMessage: 'Cliente não encontrado para saque'
          },
          'Saque falhou: cliente não encontrado'
        );

        metrics.increment('api.clientes.saque.failure.count', {
          operation: 'saque',
          status: 'failure',
          motivo: 'cliente_nao_encontrado'
        });

        throw HttpError.notFound('Cliente não encontrado');
      }

      const saldoAntes = cliente.saldo;

      if (saldoAntes < valor) {
        logger.warn(
          {
            ...baseContext,
            outcome: 'FAILED',
            errorCode: 'SALDO_INSUFICIENTE',
            errorMessage: 'Saldo insuficiente para saque',
            balanceBefore: saldoAntes
          },
          'Saque falhou: saldo insuficiente'
        );

        metrics.increment('api.clientes.saque.failure.count', {
          operation: 'saque',
          status: 'failure',
          motivo: 'saldo_insuficiente'
        });

        throw new HttpError(422, 'Saldo insuficiente');
      }

      const saldoDepois = saldoAntes - valor;

      const clienteAtualizado = await trx.cliente.update({
        where: { id: clienteId },
        data: { saldo: saldoDepois }
      });

      await trx.movimentacao.create({
        data: {
          clienteId,
          tipo: 'SAQUE',
          valor,
          saldoAntes,
          saldoDepois,
          correlationId
        }
      });

      await trx.idempotenciaOperacao.create({
        data: {
          chave: idempotencyKey,
          clienteId,
          endpoint,
          metodo,
          correlationId
        }
      });

      logger.info(
        {
          ...baseContext,
          outcome: 'SUCCESS',
          balanceBefore: saldoAntes,
          balanceAfter: saldoDepois
        },
        'Saque efetuado com sucesso'
      );

      metrics.increment('api.clientes.saque.success.count', {
        operation: 'saque',
        status: 'success',
        clienteId
      });
      metrics.histogram('api.clientes.saque.valor.histogram', valor, {
        operation: 'saque',
        status: 'success'
      });

      return clienteAtualizado;
    });

    return new Cliente(result.id, result.nome, result.email, result.saldo);
  }
}
