import { ClienteRepository } from '../infra/ClienteRepository';
import { HttpError } from '../../../core/http/http-error';

export class BuscarClientePorIdUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async execute(id: number) {
    const cliente = await this.repo.findById(id);
    if (!cliente) {
      throw HttpError.notFound('Cliente não encontrado');
    }
    return cliente;
  }
}
