import { ICComponentSchema } from './schema';
import { ZodError } from 'zod';

const validIC = {
  partNumber: 'CD4069',
  series: '4000',
  name: 'Hex Inverter',
  description: 'Six independent inverter gates.',
  package: { type: 'DIP-14', pinCount: 14 },
  pins: [
    { number: 1, name: 'A1', function: 'Input 1', direction: 'input', side: 'left' },
    { number: 2, name: 'Y1', function: 'Output 1', direction: 'output', side: 'left' },
    { number: 7, name: 'VSS', function: 'Ground', direction: 'ground', side: 'left' },
    { number: 14, name: 'VDD', function: 'Power', direction: 'power', side: 'right' },
  ],
  subcircuits: [{ id: 'inv1', type: 'not', inputs: [1], output: 2 }],
};

describe('ICComponentSchema', () => {
  it('parses a valid IC definition', () => {
    const result = ICComponentSchema.parse(validIC);
    expect(result.partNumber).toBe('CD4069');
    expect(result.pins).toHaveLength(4);
    expect(result.subcircuits).toHaveLength(1);
  });

  it('fails with ZodError when required field is missing', () => {
    const missingName = Object.fromEntries(Object.entries(validIC).filter(([k]) => k !== 'name'));
    expect(() => ICComponentSchema.parse(missingName)).toThrow(ZodError);
  });

  it('fails with ZodError for an invalid pin direction enum', () => {
    const badIC = {
      ...validIC,
      pins: [{ ...validIC.pins[0], direction: 'unknown' }],
    };
    expect(() => ICComponentSchema.parse(badIC)).toThrow(ZodError);
  });

  it('fails with ZodError when subcircuit references a non-existent pin', () => {
    const badIC = {
      ...validIC,
      subcircuits: [{ id: 'bad', type: 'not', inputs: [99], output: 2 }],
    };
    expect(() => ICComponentSchema.parse(badIC)).toThrow(ZodError);
  });
});
