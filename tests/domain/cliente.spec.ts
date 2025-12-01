import { Cliente } from '../../src/modules/clientes/domain/Cliente';

describe('Cliente (Domínio)', () => {
  test('deve depositar valor corretamente', () => {
    const cliente = new Cliente(1, 'Fulano', 'fulano@test.com', 0);

    cliente.depositar(100);

    expect(cliente.saldo).toBe(100);
  });

  test('não deve permitir depósito com valor inválido', () => {
    const cliente = new Cliente(1, 'Fulano', 'fulano@test.com', 0);

    expect(() => cliente.depositar(0)).toThrow();
    expect(() => cliente.depositar(-10)).toThrow();
  });

  test('deve sacar corretamente', () => {
    const cliente = new Cliente(1, 'Fulano', 'fulano@test.com', 200);

    cliente.sacar(50);

    expect(cliente.saldo).toBe(150);
  });

  test('não deve permitir sacar valor maior que o saldo', () => {
    const cliente = new Cliente(1, 'Fulano', 'fulano@test.com', 20);

    expect(() => cliente.sacar(50)).toThrow('Saldo insuficiente');
  });
});
