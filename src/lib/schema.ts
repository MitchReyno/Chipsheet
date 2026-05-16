import { z } from 'zod';

export const PinDirectionSchema = z.enum([
  'input',
  'output',
  'bidirectional',
  'power',
  'ground',
  'nc',
]);

export const PinSideSchema = z.enum(['left', 'right']);

export const GateTypeSchema = z.enum([
  'not',
  'buffer',
  'nand',
  'nor',
  'and',
  'or',
  'xor',
  'xnor',
  'flipflop',
  'mux',
  'custom',
]);

export const ICPinSchema = z.object({
  number: z.number().int().positive(),
  name: z.string().min(1),
  function: z.string().min(1),
  direction: PinDirectionSchema,
  side: PinSideSchema,
});

export const ICSubcircuitSchema = z.object({
  id: z.string().min(1),
  type: GateTypeSchema,
  inputs: z.array(z.number().int().positive()),
  output: z.number().int().positive(),
  label: z.string().optional(),
});

export const ICPackageSchema = z.object({
  type: z.string().min(1),
  pinCount: z.number().int().positive(),
});

export const ICComponentSchema = z
  .object({
    partNumber: z.string().min(1),
    series: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    datasheetUrl: z.string().url().optional(),
    package: ICPackageSchema,
    pins: z.array(ICPinSchema).min(1),
    subcircuits: z.array(ICSubcircuitSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const pinNumbers = new Set(data.pins.map((p) => p.number));
    if (data.subcircuits) {
      for (const sub of data.subcircuits) {
        for (const inputPin of sub.inputs) {
          if (!pinNumbers.has(inputPin)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Subcircuit "${sub.id}" references unknown input pin ${inputPin}`,
            });
          }
        }
        if (!pinNumbers.has(sub.output)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Subcircuit "${sub.id}" references unknown output pin ${sub.output}`,
          });
        }
      }
    }
  });

export type ICComponentInput = z.input<typeof ICComponentSchema>;
