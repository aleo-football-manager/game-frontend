import { useRecords } from "@puzzlehq/sdk";

export const useGameRecords = () => {
  const { records } = useRecords({
    filter: {
      programIds: [
        "football_game_v012.aleo",
        "puzzle_pieces_v016.aleo",
        "multiparty_pvp_utils_v015_avh.aleo",
      ],
      type: "unspent",
    },
    multisig: false,
  });
  console.log("🚀 ~ useGameRecords ~ records:", records);
  const gameNotifications = records?.filter(
    (record) => record.programId === "football_game_v012.aleo"
  );
  const puzzleRecords = records?.filter(
    (record) => record.programId === "puzzle_pieces_v016.aleo"
  );
  const utilRecords = records?.filter(
    (record) => record.programId === "multiparty_pvp_utils_v015_avh.aleo"
  );
  console.log("🚀 ~ useGameRecords ~ records grouped:", [gameNotifications, puzzleRecords, utilRecords]);


  return { puzzleRecords, gameNotifications, utilRecords };
};
