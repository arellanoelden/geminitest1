// src/App.tsx

import React from "react";
import SpinningWheel from "./SpinningWheel";
import "./App.css";
import { PrizeOption } from "./types"; // Import the PrizeOption type

function App(): React.ReactElement {
  // Specify return type for functional component
  const prizeOptions: PrizeOption[] = [
    // Type the array
    { name: "Big Win (3x)", weight: 3 },
    { name: "Try Again (0.5x)", weight: 0.5 },
    { name: "Small Prize (1x)", weight: 1 },
    { name: "Bonus Spins (2x)", weight: 2 },
    { name: "No Luck (0.5x)", weight: 0.5 },
    { name: "$10 Gift (1x)", weight: 1 },
    { name: "Jackpot! (4x)", weight: 4 },
    { name: "Coupon (1x)", weight: 1 },
  ];

  return (
    <div className="App">
      <h1>Spin the Weighted Prize Wheel!</h1>
      <SpinningWheel options={prizeOptions} />
    </div>
  );
}

export default App;
