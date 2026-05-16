// JEDEC DIP package dimensions (unitless, proportional — scale to desired px width)
// Reference: 300-mil row spacing (7.62 mm), 100-mil pin pitch (2.54 mm)

export const DIP = {
  // Body width in mm (300-mil row spacing)
  BODY_WIDTH_MM: 7.62,
  // Pin pitch in mm (100 mil)
  PIN_PITCH_MM: 2.54,
  // Extra space above first pin and below last pin (mm)
  BODY_MARGIN_MM: 2.54,
  // Pin stub length extending from body edge (mm)
  PIN_STUB_MM: 3.81,

  /** Compute total body height in mm for a DIP-N package */
  bodyHeightMm(pinCount: number): number {
    const pinsPerSide = pinCount / 2;
    return (pinsPerSide - 1) * DIP.PIN_PITCH_MM + DIP.BODY_MARGIN_MM * 2;
  },

  /** Scale factor: px per mm given a target body-width in px */
  scale(bodyWidthPx: number): number {
    return bodyWidthPx / DIP.BODY_WIDTH_MM;
  },
} as const;

/** All pixel-space coordinates for a DIP-N diagram at the given body width */
export interface DipLayout {
  bodyX: number;
  bodyY: number;
  bodyWidth: number;
  bodyHeight: number;
  viewWidth: number;
  viewHeight: number;
  pinsPerSide: number;
  pinPitch: number;
  stubLength: number;
  /** Y coordinate of the nth left-side pin (1-based index among left pins) */
  leftPinY(index: number): number;
  /** Y coordinate of the nth right-side pin (1-based index among right pins) */
  rightPinY(index: number): number;
}

export function computeDipLayout(pinCount: number, bodyWidthPx: number = 120): DipLayout {
  const s = DIP.scale(bodyWidthPx);
  const bodyHeight = DIP.bodyHeightMm(pinCount) * s;
  const stubLength = DIP.PIN_STUB_MM * s;
  const pinPitch = DIP.PIN_PITCH_MM * s;
  const marginY = DIP.BODY_MARGIN_MM * s;
  const pinsPerSide = pinCount / 2;

  // horizontal padding: stubs + label space
  const labelPad = 60;
  const viewWidth = bodyWidthPx + stubLength * 2 + labelPad * 2;
  const viewHeight = bodyHeight + 40; // extra vertical margin

  const bodyX = labelPad + stubLength;
  const bodyY = 20;

  return {
    bodyX,
    bodyY,
    bodyWidth: bodyWidthPx,
    bodyHeight,
    viewWidth,
    viewHeight,
    pinsPerSide,
    pinPitch,
    stubLength,
    leftPinY: (i: number) => bodyY + marginY + (i - 1) * pinPitch,
    rightPinY: (i: number) => bodyY + marginY + (i - 1) * pinPitch,
  };
}
