import React from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { PlayerType } from "../Game";
import JerseySVG from "../Jersey";
import Player from "../Player";
interface IGridSlot {
  player: PlayerType | null;
  formationPart: string;
  slot: number;
  isDisabled: boolean;
  rowIndex: number;
  selectedPlayer: number;
  isGoalkeeper: boolean;
  isSelecting: boolean;
  movePlayer: (val0: number, val1: number, val2: number) => void;
  removePlayer: (val0: number) => void;
  setIsSelecting: (val: boolean) => void;
  replacePlayer: (val: PlayerType) => void;
}

const GridSlot: React.FC<IGridSlot> = ({
  slot,
  player,
  movePlayer,
  isDisabled,
  isGoalkeeper,
  formationPart,
  selectedPlayer,
  removePlayer,
  rowIndex,
  isSelecting,
  setIsSelecting,
  replacePlayer,
}) => {
  const jerseyColor = isGoalkeeper ? "rgba(255,0,0,1)" : "#164f6b";
  console.log("player30", player);

  return (
    <div
      onClick={() => {
        setIsSelecting(true);
        if (!player) {
          console.log("clicked", slot, rowIndex);

          movePlayer(selectedPlayer, rowIndex, slot);
        }
      }}
      className={`w-20 h-20 relative flex hover:scale-105 transition duration-300 ease-in flex-col ${
        isDisabled ? "cursor-not-allowed" : ""
      } ${isSelecting ? " p-2 " : ""}`}
    >
      {isSelecting && (
        <div className="absolute flex justify-between mx-auto w-[90%] top-0 left-2">
          <FaExchangeAlt
            onClick={() => {
              if (player) {
                replacePlayer(player as PlayerType);
              }
            }}
            className="hover:text-white stroke-current"
          />
          <GiCancel
            onClick={() => removePlayer(player?.id as number)}
            className="hover:scale-105 transition duration-300 ease-in"
          />
        </div>
      )}
      <div>
        <span className="w-20 absolute h-20">
          <JerseySVG fillColor={jerseyColor} />
        </span>

        {player && !isDisabled && (
          <Player
            removePlayer={removePlayer}
            player={player}
            movePlayer={movePlayer}
            isActive={true}
          />
        )}
      </div>
    </div>
  );
};

export default GridSlot;
