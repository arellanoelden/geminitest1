// src/types.ts

// Defines the shape of an option passed into the SpinningWheel
export interface PrizeOption {
  name: string;
  weight: number;
}

// Defines the shape of an option after it has been processed with angles and path data for SVG
export interface WeightedWheelSegment extends PrizeOption {
  angle: number;
  startAngle: number;
  endAngle: number;
  path: string;
  textX: number;
  textY: number;
  textRotation: number;
}

// Defines the shape of an option used for the weighted random selection logic
export interface CumulativeWeightedOption extends PrizeOption {
  cumulativeWeight: number;
}
