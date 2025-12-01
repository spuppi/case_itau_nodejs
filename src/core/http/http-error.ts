export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static notFound(message = 'Recurso não encontrado') {
    return new HttpError(404, message);
  }

  static badRequest(message = 'Requisição inválida') {
    return new HttpError(400, message);
  }

  static conflict(message = 'Conflito') {
    return new HttpError(409, message);
  }
}
