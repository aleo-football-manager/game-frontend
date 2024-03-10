"use client";

import { useNewGameStore } from "../create-game/store";
import { useGameStore } from "../state/gameStore";
// import TheirTurn from '@components/TheirTurn';
import { useInitGame } from "@/hooks/initGame";
import YourTurn from "@components/YourTurn";
import { Separator } from "@components/ui/separator";

interface IYourGames {}

const YourGames: React.FC<IYourGames> = ({}) => {
  useInitGame();
  const [yourTurn, theirTurn, finished] = useGameStore((state) => [
    state.yourTurn,
    state.theirTurn,
    state.finished,
  ]);
  console.log("🚀 ~ yourTurn:", yourTurn);
  console.log("🚀 ~ theirTurn:", theirTurn);
  console.log("🚀 ~ finished:", finished);

  const [initialize] = useNewGameStore((state) => [state.initialize]);

  return (
    <div className="flex flex-col justify-center gap-4 items-center">
      {/* {yourTurn.length > 0 && <YourTurn games={yourTurn} />} */}
      <div className="p-4 flex gap-2 h-[80vh] w-full mt-6 justify-center">
        {yourTurn.length > 0 && (
          <div className="flex flex-col gap-6 items-center w-1/2 justify-start">
            <h2 className="tracking-tighter text-2xl font-bold">
              Your Turn to Play
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {yourTurn.map((game, index) => (
                <YourTurn key={index} game={game} isFinished={false} />
              ))}
            </div>
          </div>
        )}
        {theirTurn.length > 0 && (
          <>
            <Separator orientation="vertical" className="" />
            <div className="flex flex-col gap-6 items-center w-1/2 justify-start">
              <h2 className="tracking-tighter text-2xl font-bold">
                Their Turn to Play
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {theirTurn.map((game, index) => (
                  <YourTurn key={index} game={game} isFinished={false} />
                ))}
              </div>
            </div>
          </>
        )}
        {yourTurn.length === 0 && theirTurn.length === 0 && (
          <p className="self-center font-semibold">
            No ongoing games, start one with a friend!
          </p>
        )}
      </div>

      {finished.length > 0 && (
        <div className="flex flex-col gap-3 justify-center items-center w-full py-6">
          <Separator orientation="horizontal" className="" />

          <div className="flex flex-col gap-6 items-center w-1/2 justify-start">
            <h2 className="tracking-tighter text-2xl font-bold">
              Finished Games
            </h2>

            <div className="grid grid-cols-3 justify-center items-center gap-4">
              {finished.map((game, index) => (
                <YourTurn key={index} game={game} isFinished={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* {theirTurn.length > 0 && <TheirTurn games={theirTurn} />} */}

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
