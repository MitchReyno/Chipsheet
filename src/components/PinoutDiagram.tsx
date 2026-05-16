import React from 'react';
import type { ICComponent, ICPin, ICSubcircuit } from '@/types/component';
import { computeDipLayout } from '@/lib/dip';
import { SymbolRegistry } from '@/lib/symbols';

interface Props {
  component: ICComponent;
  bodyWidthPx?: number;
}

const STROKE = 'black';
const STROKE_W = 1.5;
const FONT_FAMILY = 'sans-serif';

function pinLabel(pin: ICPin): string {
  return pin.name;
}

function isPower(pin: ICPin): boolean {
  return pin.direction === 'power' || pin.direction === 'ground';
}

export default function PinoutDiagram({ component, bodyWidthPx = 120 }: Props) {
  const { pins, subcircuits, package: pkg } = component;
  const layout = computeDipLayout(pkg.pinCount, bodyWidthPx);
  const { bodyX, bodyY, bodyWidth, bodyHeight, viewWidth, viewHeight, stubLength } = layout;

  const leftPins = pins.filter((p) => p.side === 'left').sort((a, b) => a.number - b.number);
  const rightPins = pins.filter((p) => p.side === 'right').sort((a, b) => a.number - b.number);

  // Build a map from pin number to its Y coordinate
  const pinY = new Map<number, number>();
  const pinX = new Map<number, number>();

  leftPins.forEach((pin, i) => {
    const y = layout.leftPinY(i + 1);
    pinY.set(pin.number, y);
    pinX.set(pin.number, bodyX); // left edge of body
  });
  rightPins.forEach((pin, i) => {
    const y = layout.rightPinY(i + 1);
    pinY.set(pin.number, y);
    pinX.set(pin.number, bodyX + bodyWidth); // right edge of body
  });

  // Notch: semicircle at top-centre of IC body
  const notchR = bodyWidth * 0.08;
  const notchCx = bodyX + bodyWidth / 2;
  const notchCy = bodyY;

  // Gate symbol layout inside the body
  // For simple gate ICs, divide the interior into rows of symbols
  const gateSymbols: React.ReactNode[] = [];
  const connLines: React.ReactNode[] = [];

  if (subcircuits && subcircuits.length > 0) {
    const cols = subcircuits.length <= 3 ? 1 : 2;
    const rows = Math.ceil(subcircuits.length / cols);
    const gateW = (bodyWidth * 0.55) / cols;
    const gateH = Math.min((bodyHeight * 0.7) / rows, gateW * 0.8);
    const colGap = (bodyWidth - cols * gateW) / (cols + 1);
    const rowGap = (bodyHeight - rows * gateH) / (rows + 1);

    subcircuits.forEach((sub: ICSubcircuit, idx: number) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const gx = bodyX + colGap + col * (gateW + colGap);
      const gy = bodyY + rowGap + row * (gateH + rowGap);
      const gateMidY = gy + gateH / 2;

      const symbolFn = SymbolRegistry[sub.type];
      if (symbolFn) {
        gateSymbols.push(
          React.createElement(
            'g',
            { key: `sym-${sub.id}` },
            symbolFn({ x: gx, y: gy, width: gateW, height: gateH }),
          ),
        );
      }

      // Connection lines: input pins → gate left edge, output pin → gate right edge
      const outputPinY = pinY.get(sub.output);
      const outputPinX = pinX.get(sub.output);
      if (outputPinY !== undefined && outputPinX !== undefined) {
        const gateRightX = gx + gateW;
        if (outputPinX > bodyX) {
          // right-side pin
          connLines.push(
            React.createElement('line', {
              key: `conn-out-${sub.id}`,
              x1: gateRightX,
              y1: gateMidY,
              x2: outputPinX,
              y2: outputPinY,
              stroke: STROKE,
              strokeWidth: 0.8,
              fill: 'none',
            }),
          );
        } else {
          // left-side pin — line from gate left to pin
          connLines.push(
            React.createElement('line', {
              key: `conn-out-${sub.id}`,
              x1: gx,
              y1: gateMidY,
              x2: outputPinX,
              y2: outputPinY,
              stroke: STROKE,
              strokeWidth: 0.8,
              fill: 'none',
            }),
          );
        }
      }

      sub.inputs.forEach((inputPinNum, ii) => {
        const inputPinY = pinY.get(inputPinNum);
        const inputPinX = pinX.get(inputPinNum);
        if (inputPinY !== undefined && inputPinX !== undefined) {
          const inputY =
            sub.inputs.length === 1 ? gateMidY : gy + (gateH / (sub.inputs.length + 1)) * (ii + 1);
          if (inputPinX < bodyX + bodyWidth) {
            // left-side pin
            connLines.push(
              React.createElement('line', {
                key: `conn-in-${sub.id}-${ii}`,
                x1: inputPinX,
                y1: inputPinY,
                x2: gx,
                y2: inputY,
                stroke: STROKE,
                strokeWidth: 0.8,
                fill: 'none',
              }),
            );
          } else {
            // right-side pin
            connLines.push(
              React.createElement('line', {
                key: `conn-in-${sub.id}-${ii}`,
                x1: inputPinX,
                y1: inputPinY,
                x2: gx + gateW,
                y2: inputY,
                stroke: STROKE,
                strokeWidth: 0.8,
                fill: 'none',
              }),
            );
          }
        }
      });
    });
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width={viewWidth}
      height={viewHeight}
      style={{ background: 'white' }}
      data-testid="pinout-diagram"
    >
      {/* IC body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill="white"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        data-testid="ic-body"
      />

      {/* Pin 1 notch */}
      <path
        d={`M ${notchCx - notchR} ${notchCy} A ${notchR} ${notchR} 0 0 1 ${notchCx + notchR} ${notchCy}`}
        fill="white"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        data-testid="notch-marker"
      />

      {/* Left-side pins */}
      {leftPins.map((pin, i) => {
        const y = layout.leftPinY(i + 1);
        const stubEndX = bodyX - stubLength;
        const bold = isPower(pin);
        return (
          <g key={`lpin-${pin.number}`}>
            <line x1={stubEndX} y1={y} x2={bodyX} y2={y} stroke={STROKE} strokeWidth={STROKE_W} />
            {/* Pin number inside body */}
            <text
              x={bodyX + 6}
              y={y + 3}
              fontSize={8}
              fontFamily={FONT_FAMILY}
              fill={STROKE}
              textAnchor="start"
              data-testid={`pin-number-${pin.number}`}
            >
              {pin.number}
            </text>
            {/* Pin name outside body */}
            <text
              x={stubEndX - 3}
              y={y + 3}
              fontSize={10}
              fontFamily={FONT_FAMILY}
              fill={STROKE}
              fontWeight={bold ? 'bold' : 'normal'}
              textAnchor="end"
              data-testid={`pin-name-${pin.number}`}
            >
              {pinLabel(pin)}
            </text>
          </g>
        );
      })}

      {/* Right-side pins */}
      {rightPins.map((pin, i) => {
        const y = layout.rightPinY(i + 1);
        const stubEndX = bodyX + bodyWidth + stubLength;
        const bold = isPower(pin);
        return (
          <g key={`rpin-${pin.number}`}>
            <line
              x1={bodyX + bodyWidth}
              y1={y}
              x2={stubEndX}
              y2={y}
              stroke={STROKE}
              strokeWidth={STROKE_W}
            />
            {/* Pin number inside body */}
            <text
              x={bodyX + bodyWidth - 6}
              y={y + 3}
              fontSize={8}
              fontFamily={FONT_FAMILY}
              fill={STROKE}
              textAnchor="end"
              data-testid={`pin-number-${pin.number}`}
            >
              {pin.number}
            </text>
            {/* Pin name outside body */}
            <text
              x={stubEndX + 3}
              y={y + 3}
              fontSize={10}
              fontFamily={FONT_FAMILY}
              fill={STROKE}
              fontWeight={bold ? 'bold' : 'normal'}
              textAnchor="start"
              data-testid={`pin-name-${pin.number}`}
            >
              {pinLabel(pin)}
            </text>
          </g>
        );
      })}

      {/* Connection lines from gates to pins */}
      {connLines}

      {/* Gate symbols */}
      {gateSymbols}
    </svg>
  );
}
