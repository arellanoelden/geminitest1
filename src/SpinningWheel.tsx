// src/SpinningWheel.tsx

import React, { useState, useRef } from "react";
import "./SpinningWheel.css";
import {
  PrizeOption,
  WeightedWheelSegment,
  CumulativeWeightedOption,
} from "./types"; // Import types

// Define props interface for the component
interface SpinningWheelProps {
  options: PrizeOption[];
}

// Helper function to convert degrees to radians
const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

// Helper function to get arc path data for SVG
const getArcPath = (
  x: number,
  y: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = degToRad(startAngle);
  const end = degToRad(endAngle);

  const x1 = x + r * Math.cos(start);
  const y1 = y + r * Math.sin(start);
  const x2 = x + r * Math.cos(end);
  const y2 = y + r * Math.sin(end);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${x} ${y}`, // Move to center
    `L ${x1} ${y1}`, // Line to start of arc
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc
    `Z`, // Close path back to center
  ].join(" ");
};

const SpinningWheel: React.FC<SpinningWheelProps> = ({ options }) => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [winningOption, setWinningOption] = useState<string | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null); // Type the ref to an SVG element

  const wheelRadius = 200; // Radius of the wheel
  const wheelCenter = { x: wheelRadius, y: wheelRadius }; // SVG coordinates for the center

  // Pre-calculate total weight
  const totalWeight: number = options.reduce(
    (sum, option) => sum + (option.weight || 1),
    0
  );

  let currentAngle: number = 0; // Tracks the current angle for drawing segments

  // Prepare options with calculated angles and text positions
  const weightedOptions: WeightedWheelSegment[] = options.map(
    (option, index) => {
      const angle: number = ((option.weight || 1) / totalWeight) * 360; // Angle for this segment
      const startAngle: number = currentAngle;
      const endAngle: number = currentAngle + angle;

      const textMidAngle: number = degToRad(startAngle + angle / 2);
      const textRadius: number = wheelRadius * 0.7; // Position text slightly inward from the edge
      const textX: number = wheelCenter.x + textRadius * Math.cos(textMidAngle);
      const textY: number = wheelCenter.y + textRadius * Math.sin(textMidAngle);

      let textRotation: number = startAngle + angle / 2;
      if (textRotation > 90 && textRotation < 270) {
        textRotation += 180; // Flip text upside down if it's on the left side
      }

      currentAngle += angle;

      return {
        ...option,
        angle,
        startAngle,
        endAngle,
        path: getArcPath(
          wheelCenter.x,
          wheelCenter.y,
          wheelRadius,
          startAngle,
          endAngle
        ),
        textX,
        textY,
        textRotation,
      };
    }
  );

  // Re-calculate cumulative weights for the spinning logic
  const cumulativeWeights: CumulativeWeightedOption[] = options.map(
    (option, index) => {
      return {
        ...option,
        cumulativeWeight: options
          .slice(0, index + 1)
          .reduce((sum, o) => sum + (o.weight || 1), 0),
      };
    }
  );

  const spinWheel = (): void => {
    if (spinning) return;

    setSpinning(true);
    setWinningOption(null);

    // --- 1. Determine the winning segment index based on weights ---
    const randomNumber: number = Math.random() * totalWeight;
    let winningSegmentIndex: number = 0;
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (randomNumber < cumulativeWeights[i].cumulativeWeight) {
        winningSegmentIndex = i;
        break;
      }
    }

    const winningSegment: WeightedWheelSegment =
      weightedOptions[winningSegmentIndex];

    // --- 2. Pick a random landing angle *within* the winning segment ---
    // We want the pointer to land *within* the segment's angular range.
    // Add a small buffer (e.g., 2.5 degrees from each edge) to prevent landing exactly on the line.
    const minLandingAngle = winningSegment.startAngle + 2.5;
    const maxLandingAngle = winningSegment.endAngle - 2.5;
    const randomLandingAngle: number =
      Math.random() * (maxLandingAngle - minLandingAngle) + minLandingAngle;

    // --- 3. Calculate the total rotation needed ---
    // The pointer is at 0 degrees (straight up).
    // To make `randomLandingAngle` point to 0 degrees, the wheel needs to rotate by `(-randomLandingAngle)` degrees.
    // Example: If randomLandingAngle is 45 degrees, we need to rotate by -45 degrees (or 315 degrees).

    // Calculate the target effective rotation (0-359 degrees) for the wheel to stop at.
    // This is the rotation that brings `randomLandingAngle` to the 0-degree pointer.
    const targetWheelStopRotation: number = (360 - randomLandingAngle) % 360;

    // Get the current effective rotation of the wheel
    const currentEffectiveRotation: number = rotation % 360;

    // Calculate how much more rotation is needed from the current position to hit the target stop rotation
    let additionalRotationNeeded: number =
      targetWheelStopRotation - currentEffectiveRotation;

    // Ensure we always rotate forward. If the calculated `additionalRotationNeeded` is negative,
    // it means the target `targetWheelStopRotation` is "behind" the `currentEffectiveRotation`.
    // Adding 360 makes it a forward spin to reach that point.
    if (additionalRotationNeeded < 0) {
      additionalRotationNeeded += 360;
    }

    // Add a minimum number of full spins (e.g., 10) to make the animation visually appealing
    const minFullSpins = 10;
    const totalRotation: number =
      rotation + minFullSpins * 360 + additionalRotationNeeded;

    setRotation(totalRotation);

    const spinDuration: number = 5000;
    setTimeout(() => {
      // The winning option was already determined by the weighted random selection logic
      setWinningOption(options[winningSegmentIndex].name);
      setSpinning(false);
    }, spinDuration);
  };

  return (
    <div className="wheel-container">
      <div className="wheel-pointer"></div>
      <div
        className="wheel-svg-wrapper"
        style={{ width: wheelRadius * 2, height: wheelRadius * 2 }}
      >
        <svg
          className="wheel-svg"
          width={wheelRadius * 2}
          height={wheelRadius * 2}
          viewBox={`0 0 ${wheelRadius * 2} ${wheelRadius * 2}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          ref={wheelRef}
        >
          {weightedOptions.map((option, index) => (
            <g key={index}>
              <path
                d={option.path}
                fill={`hsl(${option.startAngle}, 70%, 60%)`}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={option.textX}
                y={option.textY}
                transform={`rotate(${option.textRotation} ${option.textX} ${option.textY})`}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {option.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <button onClick={spinWheel} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
      {winningOption && (
        <div className="winning-message">
          Congratulations! You won: **{winningOption}**
        </div>
      )}
    </div>
  );
};

export default SpinningWheel;
