"use client";

import { useNewGameStore } from "../create-game/store";
import { useGameStore } from "../state/gameStore";
// import TheirTurn from '@components/TheirTurn';
import { useInitGame } from "@/hooks/initGame";
import YourTurn from "@components/YourTurn";

interface IYourGames {}

const YourGames: React.FC<IYourGames> = ({}) => {
  useInitGame();

  const [yourTurn, theirTurn, totalBalance] = useGameStore((state) => [
    state.yourTurn,
    state.theirTurn,
    state.totalBalance,
  ]);
  console.log("🚀 ~ yourTurn:", yourTurn);
  console.log("🚀 ~ theirTurn:", theirTurn);
  console.log("🚀 ~ totalBalance:", totalBalance);

  const [initialize] = useNewGameStore((state) => [state.initialize]);

  return (
    <div className="p-4">
      {/* {yourTurn.length > 0 && <YourTurn games={yourTurn} />} */}
      <div className="grid grid-cols-3">
        {yourTurn.length > 0 &&
          yourTurn.map((game, index) => <YourTurn key={index} game={game} />)}
      </div>
      {/* {theirTurn.length > 0 && <TheirTurn games={theirTurn} />} */}
      {yourTurn.length === 0 && theirTurn.length === 0 && (
        <p className="self-center font-semibold">
          No ongoing games, start one with a friend!
        </p>
      )}
      {/* {allEvents?.map((event, index) => {
        if (
          event.functionId == "propose_game" ||
          event.functionId == "accept_game"
        ) {
          return (
            <Card className="w-full  rounded-sm px-2 py-2 " key={index}>
              <CardTitle className="text-sm flex justify-between">
                Status:{" "}
                <Badge
                  variant={
                    (event.status == "Pending" && "destructive") || "default"
                  }
                >
                  {event.status}
                </Badge>
              </CardTitle>
              <CardContent className="mt-2 p-0">
                <div className="flex flex-col gap-2">
                  <p className="text-sm">
                    <span className="font-bold">Bet Amount: </span>{" "}
                    <span className="text-red-300">
                      {parseInt(event.inputs[0]!)}
                    </span>{" "}
                    Fortune Credits
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">
                    <span className="font-bold">Bet: </span>{" "}
                    <span className="text-red-300">
                      {parseInt(event.inputs[1]!)}
                    </span>{" "}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">
                    <span className="font-bold">Game ID: </span>{" "}
                    <span className="text-red-300">{event._id!}</span>{" "}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }
      })} */}
    </div>
  );
};
export default YourGames;
