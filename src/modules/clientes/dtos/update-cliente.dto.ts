import { z } from 'zod';

export const updateClienteSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional()
});

export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
