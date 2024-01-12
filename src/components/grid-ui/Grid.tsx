"use client";

import { PlayerType } from "../Game";
import GridSlot from "./GridSlot";

interface IGrid {
  formation: string;
  rowIndex: number;
  selectedPlayer: number;
  isGoalkeeper: boolean;
  grid: (PlayerType | null)[];
  isSelecting: boolean;
  movePlayer: (val0: number, val1: number, val2: number) => void;
  removePlayer: (playerId: number) => void;
}

const Grid: React.FC<IGrid> = ({
  formation,
  grid,
  movePlayer,
  removePlayer,
  selectedPlayer,
  isGoalkeeper,
  rowIndex,
  isSelecting,
}) => {
  const handleGridSlotClick = (slot: number) => {
    // Handle the click event
    if (grid[slot] === null) {
      movePlayer(selectedPlayer, rowIndex, slot);
    } else {
      removePlayer(selectedPlayer || 0);
    }
  };
  console.log("grid33", grid, rowIndex);

  return (
    <div
      className={`w-[90vh] justify-items-center items-center content-center grid grid-cols-${formation}`}
    >
      {grid.map((player, index) => (
        <GridSlot
          isDisabled={false}
          formationPart={formation}
          key={index}
          isSelecting={isSelecting}
          rowIndex={rowIndex}
          selectedPlayer={selectedPlayer}
          slot={index}
          player={player}
          isGoalkeeper={isGoalkeeper}
          movePlayer={movePlayer}
          removePlayer={() => removePlayer(player?.id || 0)}
        />
      ))}
    </div>
  );
};
// const getGridClass = (formation: string): string => {
//   // Implement the logic to determine the grid class based on the formation
//   // You can use a switch statement or any other logic here
//   // Example:
//   switch (formation) {
//     case "4-4-2":
//       return "grid-cols-4 grid-rows-4"; // Customize as needed
//     case "3-5-2":
//       return "grid-cols-3 grid-rows-5"; // Customize as needed
//     default:
//       return "grid-cols-4 grid-rows-4"; // Default grid class
//   }
// };

export default Grid;
