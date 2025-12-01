import { ClienteRepository } from '../infra/ClienteRepository';
import { CreateClienteDto } from '../dtos/create-cliente.dto';
import { Cliente } from '../domain/Cliente';
import { HttpError } from '../../../core/http/http-error';

export class CriarClienteUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async execute(data: CreateClienteDto) {
    const clientes = await this.repo.findAll();
    if (clientes.some((c) => c.email === data.email)) {
      throw HttpError.conflict('E-mail já cadastrado');
    }

    const cliente = new Cliente(null, data.nome, data.email, 0);
    const salvo = await this.repo.save(cliente);
    return salvo;
  }
}
