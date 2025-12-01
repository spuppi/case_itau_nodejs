export class Cliente {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public email: string,
    private saldo: number
  ) {}

  get _saldo(): number {
    return this.saldo;
  }

  depositar(valor: number) {
    if (valor <= 0) {
      throw new Error('Valor de depósito deve ser positivo');
    }
    this.saldo += valor;
  }

  sacar(valor: number) {
    if (valor <= 0) {
      throw new Error('Valor de saque deve ser positivo');
    }
    if (this._saldo < valor) {
      throw new Error('Saldo insuficiente');
    }
    this.saldo -= valor;
  }
}
