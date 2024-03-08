import { useAccount } from "@puzzlehq/sdk";
import { useGameStore } from "@state/gameStore";
import { useEffect } from "react";
import { useGameRecords } from "./records";

export const useInitGame = () => {
  const { account } = useAccount();

  const [setRecords] = useGameStore((state) => [state.setRecords]);

  const { gameNotifications, puzzleRecords, utilRecords } = useGameRecords();

  useEffect(() => {
    if (
      gameNotifications !== undefined &&
      puzzleRecords !== undefined &&
      utilRecords !== undefined &&
      account
    ) {
      setRecords(account.address, {
        gameNotifications,
        puzzleRecords,
        utilRecords,
      });
    }
  }, [
    [gameNotifications, puzzleRecords, utilRecords].toString(),
    account?.address,
  ]);
};
