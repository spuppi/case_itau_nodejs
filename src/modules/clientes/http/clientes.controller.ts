import { NextFunction, Request, Response } from 'express';
import { ClientePrismaRepository } from '../infra/ClientePrismaRepository';
import { ListarClientesUseCase } from '../usecases/ListarClientes';
import { BuscarClientePorIdUseCase } from '../usecases/BuscarClientePorId';
import { CriarClienteUseCase } from '../usecases/CriarCliente';
import { AtualizarClienteUseCase } from '../usecases/AtualizarCliente';
import { ExcluirClienteUseCase } from '../usecases/ExcluirCliente';
import { DepositarUseCase } from '../usecases/Depositar';
import { SacarUseCase } from '../usecases/Sacar';
import { createClienteSchema } from '../dtos/create-cliente.dto';
import { updateClienteSchema } from '../dtos/update-cliente.dto';
import { movimentacaoSchema } from '../dtos/movimentacao.dto';
import { HttpError } from '../../../core/http/http-error';

const repo = new ClientePrismaRepository();

export class ClientesController {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const usecase = new ListarClientesUseCase(repo);
      const clientes = await usecase.execute();
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw HttpError.badRequest('ID inválido');
      }

      const usecase = new BuscarClientePorIdUseCase(repo);
      const cliente = await usecase.execute(id);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createClienteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw HttpError.badRequest('Payload inválido');
      }

      const usecase = new CriarClienteUseCase(repo);
      const cliente = await usecase.execute(parsed.data);
      res.status(201).json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw HttpError.badRequest('ID inválido');
      }

      const parsed = updateClienteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw HttpError.badRequest('Payload inválido');
      }

      const usecase = new AtualizarClienteUseCase(repo);
      const cliente = await usecase.execute(id, parsed.data);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async excluir(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw HttpError.badRequest('ID inválido');
      }

      const usecase = new ExcluirClienteUseCase(repo);
      await usecase.execute(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async depositar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw HttpError.badRequest('ID inválido');
      }

      const parsed = movimentacaoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw HttpError.badRequest('Payload inválido');
      }

      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
      if (!idempotencyKey) {
        throw HttpError.badRequest('Header Idempotency-Key é obrigatório');
      }

      const correlationId = req.correlationId!;

      const usecase = new DepositarUseCase();
      const cliente = await usecase.execute(
        id,
        parsed.data.valor,
        correlationId,
        idempotencyKey
      );

      res.json(cliente);
    } catch (err) {
      next(err);
    }
  }

  async sacar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw HttpError.badRequest('ID inválido');
      }

      const parsed = movimentacaoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw HttpError.badRequest('Payload inválido');
      }

      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
      if (!idempotencyKey) {
        throw HttpError.badRequest('Header Idempotency-Key é obrigatório');
      }

      const correlationId = req.correlationId!;

      const usecase = new SacarUseCase();
      const cliente = await usecase.execute(
        id,
        parsed.data.valor,
        correlationId,
        idempotencyKey
      );

      res.json(cliente);
    } catch (err) {
      next(err);
    }
  }
}
