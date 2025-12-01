import { z } from 'zod';

export const createClienteSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email()
});

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
