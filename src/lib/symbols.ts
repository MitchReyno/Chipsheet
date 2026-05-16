import type { GateType } from '@/types/component';
import React from 'react';

export interface SymbolProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STROKE = { stroke: 'black', strokeWidth: 1, fill: 'none' } as const;

function notSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const cx = x + width / 2;
  const top = y;
  const bot = y + height;
  const bubbleR = height * 0.08;
  const triBot = bot - bubbleR * 2;
  return React.createElement(
    'g',
    null,
    // triangle body
    React.createElement('polygon', {
      points: `${x},${top} ${x + width * 0.85},${(top + triBot) / 2} ${x},${triBot}`,
      ...STROKE,
    }),
    // inversion bubble
    React.createElement('circle', {
      cx: x + width * 0.85 + bubbleR,
      cy: (top + triBot) / 2,
      r: bubbleR,
      ...STROKE,
    }),
    // input line
    React.createElement('line', {
      x1: cx - width * 0.5,
      y1: (top + triBot) / 2,
      x2: x,
      y2: (top + triBot) / 2,
      ...STROKE,
    }),
  );
}

function bufferSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const top = y;
  const bot = y + height;
  return React.createElement(
    'g',
    null,
    React.createElement('polygon', {
      points: `${x},${top} ${x + width},${(top + bot) / 2} ${x},${bot}`,
      ...STROKE,
    }),
  );
}

function andBody(x: number, y: number, w: number, h: number): string {
  const mid = y + h / 2;
  const right = x + w;
  return `M ${x} ${y} L ${x + w * 0.55} ${y} Q ${right} ${y} ${right} ${mid} Q ${right} ${y + h} ${x + w * 0.55} ${y + h} L ${x} ${y + h} Z`;
}

function andSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  return React.createElement(
    'g',
    null,
    React.createElement('path', { d: andBody(x, y, width, height), ...STROKE }),
  );
}

function nandSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const bubbleR = height * 0.08;
  const bodyW = width - bubbleR * 2;
  const mid = y + height / 2;
  return React.createElement(
    'g',
    null,
    React.createElement('path', { d: andBody(x, y, bodyW, height), ...STROKE }),
    React.createElement('circle', { cx: x + bodyW + bubbleR, cy: mid, r: bubbleR, ...STROKE }),
  );
}

function orBody(x: number, y: number, w: number, h: number): string {
  const mid = y + h / 2;
  const right = x + w;
  return (
    `M ${x} ${y} Q ${x + w * 0.4} ${y} ${right} ${mid} Q ${x + w * 0.4} ${y + h} ${x} ${y + h} ` +
    `Q ${x + w * 0.25} ${mid} ${x} ${y} Z`
  );
}

function orSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  return React.createElement(
    'g',
    null,
    React.createElement('path', { d: orBody(x, y, width, height), ...STROKE }),
  );
}

function norSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const bubbleR = height * 0.08;
  const bodyW = width - bubbleR * 2;
  const mid = y + height / 2;
  return React.createElement(
    'g',
    null,
    React.createElement('path', { d: orBody(x, y, bodyW, height), ...STROKE }),
    React.createElement('circle', { cx: x + bodyW + bubbleR, cy: mid, r: bubbleR, ...STROKE }),
  );
}

function xorSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const bodyX = x + width * 0.1;
  const bodyW = width - width * 0.1;
  return React.createElement(
    'g',
    null,
    // extra curved input line
    React.createElement('path', {
      d: `M ${x} ${y} Q ${x + width * 0.15} ${y + height / 2} ${x} ${y + height}`,
      ...STROKE,
      fill: 'none',
    }),
    React.createElement('path', { d: orBody(bodyX, y, bodyW, height), ...STROKE }),
  );
}

function xnorSymbol({ x, y, width, height }: SymbolProps): React.ReactElement {
  const bubbleR = height * 0.08;
  const bodyX = x + width * 0.1;
  const bodyW = width - width * 0.1 - bubbleR * 2;
  const mid = y + height / 2;
  return React.createElement(
    'g',
    null,
    React.createElement('path', {
      d: `M ${x} ${y} Q ${x + width * 0.15} ${mid} ${x} ${y + height}`,
      ...STROKE,
      fill: 'none',
    }),
    React.createElement('path', { d: orBody(bodyX, y, bodyW, height), ...STROKE }),
    React.createElement('circle', { cx: bodyX + bodyW + bubbleR, cy: mid, r: bubbleR, ...STROKE }),
  );
}

type SymbolFn = (props: SymbolProps) => React.ReactElement;

export const SymbolRegistry: Record<GateType, SymbolFn | null> = {
  not: notSymbol,
  buffer: bufferSymbol,
  and: andSymbol,
  nand: nandSymbol,
  or: orSymbol,
  nor: norSymbol,
  xor: xorSymbol,
  xnor: xnorSymbol,
  flipflop: null,
  mux: null,
  custom: null,
};
