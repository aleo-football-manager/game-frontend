import { useRecords } from "@puzzlehq/sdk";
import {
  GAME_PROGRAM_ID,
  COIN_PROGRAM_ID,
  PVP_UTILS_PROGRAM_ID,
} from "@/app/state/manager";


export const useGameRecords = () => {
  const { records } = useRecords({
    filter: {
      programIds: [
        GAME_PROGRAM_ID,
        COIN_PROGRAM_ID,
        PVP_UTILS_PROGRAM_ID,
      ],
      type: "unspent",
    },
    multisig: false,
  });

  const gameNotifications = records?.filter(
    (record) => record.programId === GAME_PROGRAM_ID
  );
  const puzzleRecords = records?.filter(
    (record) => record.programId === COIN_PROGRAM_ID
  );
  const utilRecords = records?.filter(
    (record) => record.programId === PVP_UTILS_PROGRAM_ID
  );


  return { puzzleRecords, gameNotifications, utilRecords };
};
