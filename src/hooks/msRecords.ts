import { useRecords } from "@puzzlehq/sdk";
import {
  GAME_PROGRAM_ID,
  COIN_PROGRAM_ID,
  PVP_UTILS_PROGRAM_ID,
} from "@/app/state/manager";

export const useMsRecords = (address?: string) => {
  const { records } = useRecords({
    filter: {
      programIds: [
        GAME_PROGRAM_ID,
        COIN_PROGRAM_ID,
        PVP_UTILS_PROGRAM_ID,
      ],
      type: "unspent",
    },
    address,
    multisig: true,
  });
  const msGameRecords = records?.filter(
    (record) => record.programId === GAME_PROGRAM_ID
  );
  const msPuzzleRecords = records?.filter(
    (record) => record.programId === COIN_PROGRAM_ID
  );
  const msUtilRecords = records?.filter(
    (record) => record.programId === PVP_UTILS_PROGRAM_ID
  );
  return { msPuzzleRecords, msGameRecords, msUtilRecords };
};
