import { z } from 'zod';

export const movimentacaoSchema = z.object({
  valor: z.number().positive()
});

export type MovimentacaoDto = z.infer<typeof movimentacaoSchema>;
