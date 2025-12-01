import { ClienteRepository } from './ClienteRepository';
import { prisma } from '../../../infra/database/prisma-client';
import { Cliente } from '../domain/Cliente';
import { Cliente as ClienteRow } from '@prisma/client';

export class ClientePrismaRepository implements ClienteRepository {
  async findAll(): Promise<Cliente[]> {
    const rows = await prisma.cliente.findMany({
      where: { ativo: true }, // só ativos
    });
    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Cliente | null> {
    const row = await prisma.cliente.findFirst({
      where: {
        id,
        ativo: true, // só se estiver ativo
      },
    });
    if (!row) return null;
    return row ? this.toDomain(row) : null;
  }

  async save(cliente: Cliente): Promise<Cliente> {
    const created = await prisma.cliente.create({
      data: {
        nome: cliente.nome,
        email: cliente.email,
        saldo: cliente.saldo,
        ativo: true
      }
    });
    return this.toDomain(created);
  }

  async update(cliente: Cliente): Promise<void> {
    if (cliente.id == null) {
      throw new Error('Cliente precisa ter id para ser atualizado');
    }

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        nome: cliente.nome,
        email: cliente.email,
        saldo: cliente.saldo
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.cliente.update({
      where: { id },
      data: {
        ativo: false,
      },
    });
  }

  private toDomain(row: ClienteRow): Cliente {
    return new Cliente(row.id, row.nome, row.email, row.saldo);
  }
}
