"use client";

import { useNewGameStore } from "../create-game/store";
import { useGameStore } from "../state/gameStore";
// import TheirTurn from '@components/TheirTurn';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInitGame } from "@/hooks/initGame";
import YourTurn from "@components/YourTurn";
import { useAccount } from "@puzzlehq/sdk";
import { motion } from "framer-motion";
import { useState } from "react";
interface IYourGames {}

const tabs = [
  { id: "your", label: "Your Turn" },
  { id: "their", label: "Their Turn" },
  { id: "finished", label: "Finished" },
];

const YourGames: React.FC<IYourGames> = ({}) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  useInitGame();
  const [yourTurn, theirTurn, finished, availableBalance] = useGameStore(
    (state) => [
      state.yourTurn,
      state.theirTurn,
      state.finished,
      state.availableBalance,
    ]
  );
  const { account } = useAccount();
  const [loading, setLoading] = useState(false);
  console.log("🚀 ~ yourTurn:", yourTurn);
  console.log("🚀 ~ theirTurn:", theirTurn);
  console.log("🚀 ~ finished:", finished);

  const [initialize] = useNewGameStore((state) => [state.initialize]);

  return (
    <div className="flex flex-col justify-center gap-4 items-center">
      {/* {yourTurn.length > 0 && <YourTurn games={yourTurn} />} */}
      <div className="p-4 flex relative gap-2 h-[85vh] w-full mt-6 justify-center">
        <Tabs
          // value={tab}
          // onValueChange={onTabChange}
          defaultValue="your"
          className="max-w-4xl "
        >
          <div className="flex w-[100vh] items-center justify-center">
            <TabsList className="flex border font-technor  w-fit h-fit absolute bottom-0 shadow-lg bg-transparent gap-4  items-center justify-center">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  className={`${
                    activeTab === tab.id ? "text-white" : "text-black"
                  } relative rounded-full px-3 py-3 text-base tracking-tighter font-semibold dark:text-white outline-sky-400 transition focus-visible:outline-2 `}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  value={tab.id}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-white mix-blend-difference"
                      style={{ borderRadius: 8 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollArea className=" overflow-y-auto font-supreme w-full h-[75vh] p-5">
            <TabsContent value={"your"} className="w-full">
              {yourTurn.length !== 0 ? (
                <div className="flex flex-col   gap-6 -mt-2  items-center w-full justify-center">
                  <h2 className="tracking-tighter text-2xl font-bold font-technor">
                    Your Turn to Play
                  </h2>

                  <div className="grid  max-md:justify-items-center w-full max-sm:grid-cols-1 max-md:grid-cols-2   md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]  gap-4 p-2">
                    {yourTurn.map((game, index) => (
                      <YourTurn key={index} game={game} isFinished={false} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center text-center justify-center h-[40vh]">
                  <p className=" text-2xl font-semibold">
                    No ongoing games, start one with a friend!
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value={"their"} className="w-full">
              {theirTurn.length !== 0 ? (
                <div className="flex flex-col  gap-6 -mt-2  items-center w-full justify-center">
                  <h2 className="tracking-tighter text-2xl font-bold font-technor">
                    Their Turn to Play
                  </h2>

                  <div className="grid  max-md:justify-items-center w-full max-sm:grid-cols-1 max-md:grid-cols-2   md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]  gap-4 p-2">
                    {theirTurn.map((game, index) => (
                      <YourTurn key={index} game={game} isFinished={false} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center text-center justify-center h-[40vh]">
                  <p className=" text-2xl font-semibold">
                    No ongoing games, start one with a friend!
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value={"finished"} className="w-full">
              {finished.length !== 0 ? (
                <div className="flex flex-col  gap-6 -mt-2  items-center w-full justify-center">
                  <h2 className="tracking-tighter text-2xl font-bold font-technor">
                    Finished Games
                  </h2>

                  <div className="grid  max-md:justify-items-center w-full max-sm:grid-cols-1 max-md:grid-cols-2   md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]  gap-4 p-2">
                    {finished.map((game, index) => (
                      <YourTurn key={index} game={game} isFinished={true} />
                    ))}
                    {finished.map((game, index) => (
                      <YourTurn key={index} game={game} isFinished={true} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center text-center justify-center h-[40vh]">
                  <p className=" text-2xl font-semibold">
                    No finished games, start one with a friend!
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        {/* {activePlayersCount !== 11 && (
              <div className="w-full flex justify-center">
                <Button className="w-1/2" variant={"outline"}>
                  Start Game
                </Button>
              </div>
            )} */}
      </div>

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
