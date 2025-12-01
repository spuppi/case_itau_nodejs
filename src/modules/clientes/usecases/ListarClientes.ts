import { ClienteRepository } from '../infra/ClienteRepository';

export class ListarClientesUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async execute() {
    return this.repo.findAll();
  }
}
