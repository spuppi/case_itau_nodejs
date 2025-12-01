import { prisma } from '../../../infra/database/prisma-client';
import { HttpError } from '../../../core/http/http-error';
import { Cliente } from '../domain/Cliente';
import { logger } from '../../../core/logging/logger';
import { BusinessLogContext } from '../../../core/logging/log-schema';
import { metrics } from '../../../core/metrics/metrics';

export class DepositarUseCase {
  async execute(
    clienteId: number,
    valor: number,
    correlationId: string,
    idempotencyKey: string
  ) {
    if (valor <= 0) {
      metrics.increment('api.clientes.deposito.failure.count', {
        operation: 'deposito',
        status: 'failure',
        motivo: 'valor_invalido'
      });
      throw HttpError.badRequest('Valor de depósito deve ser positivo');
    }

    const endpoint = `/clientes/${clienteId}/depositar`;
    const metodo = 'POST';

    const result = await prisma.$transaction(async (trx) => {
      const baseContext: BusinessLogContext = {
        logType: 'business',
        domain: 'clientes',
        entity: 'cliente',
        entityId: clienteId,
        operation: 'deposito',
        correlationId,
        amount: valor,
        idempotencyKey
      };

      logger.info(
        {
          ...baseContext,
          outcome: 'SUCCESS'
        },
        'Iniciando depósito'
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
          'Depósito idempotente: chave já utilizada'
        );

        metrics.increment('api.clientes.deposito.idempotent.count', {
          operation: 'deposito',
          status: 'idempotent_replay',
          clienteId
        });

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
            errorMessage: 'Cliente não encontrado para depósito'
          },
          'Depósito falhou: cliente não encontrado'
        );

        metrics.increment('api.clientes.deposito.failure.count', {
          operation: 'deposito',
          status: 'failure',
          motivo: 'cliente_nao_encontrado'
        });

        throw HttpError.notFound('Cliente não encontrado');
      }

      const saldoAntes = cliente.saldo;
      const saldoDepois = saldoAntes + valor;

      const clienteAtualizado = await trx.cliente.update({
        where: { id: clienteId },
        data: { saldo: saldoDepois }
      });

      await trx.movimentacao.create({
        data: {
          clienteId,
          tipo: 'DEPOSITO',
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
        'Depósito efetuado com sucesso'
      );

      metrics.increment('api.clientes.deposito.success.count', {
        operation: 'deposito',
        status: 'success',
        clienteId
      });
      metrics.histogram('api.clientes.deposito.valor.histogram', valor, {
        operation: 'deposito',
        status: 'success'
      });

      return clienteAtualizado;
    });

    return new Cliente(result.id, result.nome, result.email, result.saldo);
  }
}
