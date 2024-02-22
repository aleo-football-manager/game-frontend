import { useRecords } from "@puzzlehq/sdk";

export const useMsRecords = (address?: string) => {
  const { records } = useRecords({
    filter: {
      programIds: [
        "football_game_v013.aleo",
        "puzzle_pieces_v016.aleo",
        "multiparty_pvp_utils_v015_avh.aleo",
      ],
      type: "unspent",
    },
    address,
    multisig: true,
  });
  const msGameRecords = records?.filter(
    (record) => record.programId === "football_game_v12.aleo"
  );
  const msPuzzleRecords = records?.filter(
    (record) => record.programId === "puzzle_pieces_v016.aleo"
  );
  const msUtilRecords = records?.filter(
    (record) => record.programId === "multiparty_pvp_utils_v015_avh.aleo"
  );

  console.log([msGameRecords, msPuzzleRecords, msUtilRecords]);

  return { msPuzzleRecords, msGameRecords, msUtilRecords };
};
