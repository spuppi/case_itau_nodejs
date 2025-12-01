import { Cliente } from '../domain/Cliente';

export interface ClienteRepository {
  findAll(): Promise<Cliente[]>;
  findById(id: number): Promise<Cliente | null>;
  save(cliente: Cliente): Promise<Cliente>;
  update(cliente: Cliente): Promise<void>;
  delete(id: number): Promise<void>;
}
