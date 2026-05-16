export type PinDirection = 'input' | 'output' | 'bidirectional' | 'power' | 'ground' | 'nc';
export type PinSide = 'left' | 'right';
export type GateType =
  | 'not'
  | 'buffer'
  | 'nand'
  | 'nor'
  | 'and'
  | 'or'
  | 'xor'
  | 'xnor'
  | 'flipflop'
  | 'mux'
  | 'custom';

export interface ICPin {
  number: number;
  name: string;
  function: string;
  direction: PinDirection;
  side: PinSide;
}

export interface ICSubcircuit {
  id: string;
  type: GateType;
  inputs: number[];
  output: number;
  label?: string;
}

export interface ICPackage {
  type: string;
  pinCount: number;
}

export interface ICComponent {
  partNumber: string;
  series: string;
  name: string;
  description: string;
  datasheetUrl?: string;
  package: ICPackage;
  pins: ICPin[];
  subcircuits?: ICSubcircuit[];
}

export interface ICComponentSummary {
  partNumber: string;
  name: string;
  series: string;
  pinCount: number;
}
