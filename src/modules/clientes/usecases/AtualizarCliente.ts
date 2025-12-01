import { ClienteRepository } from '../infra/ClienteRepository';
import { UpdateClienteDto } from '../dtos/update-cliente.dto';
import { HttpError } from '../../../core/http/http-error';

export class AtualizarClienteUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async execute(id: number, data: UpdateClienteDto) {
    const cliente = await this.repo.findById(id);
    if (!cliente) {
      throw HttpError.notFound('Cliente não encontrado');
    }

    if (data.nome !== undefined) cliente.nome = data.nome;
    if (data.email !== undefined) cliente.email = data.email;

    await this.repo.update(cliente);
    return cliente;
  }
}
