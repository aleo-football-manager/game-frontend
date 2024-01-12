"use client";

import { calculateAttribute, getPositionRole } from "@/utils";
import { teams } from "@/utils/team-data";
import { csv } from "d3";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "sonner";
import Player from "./Player";
import PlayerDetails from "./PlayerDetails";
import SelectFormation from "./SelectFormation";
import { calculateStarRating, renderStars } from "./TeamCard";
import Grid from "./grid-ui/Grid";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
interface IGame {
  selectedTeam: number;
  setIsGameStarted: (val: boolean) => void;
}

export type PlayerType = {
  id: number;
  name: string;
  team: string;
  image: string;
  position: string;
  speed: number;
  power: number;
  stamina: number;
  technique: number;
  goalkeeping: number;
  attackScore: number;
  defenseScore: number;
};

const Game: React.FC<IGame> = ({ selectedTeam, setIsGameStarted }) => {
  const [benchPlayers, setBenchPlayers] = useState<PlayerType[]>([]);
  const [activePlayers, setActivePlayers] = useState<PlayerType[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [movingPlayer, setMovingPlayer] = useState<PlayerType>();
  const [playerData, setPlayerData] = useState<PlayerType>();
  const [totalAttack, setTotalAttack] = useState(0);
  const [totalDefense, setTotalDefense] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);

  // const [opponentTotalDefense, setOpponentTotalDefense] = useState(0);
  // const [opponentTotalAttack, setOpponentTotalAttack] = useState(0);
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [formationSplitted, setFormationSplitted] = useState(
    selectedFormation.split("-")
  );
  const [grid, setGrid] = useState<(PlayerType | null)[]>(
    Array.from({ length: 11 }, () => null)
  );
  // const [grid, setGrid] = useState<any>([
  //   Array.from({ length: 1 }, () => null),
  //   Array.from({ length: Number(formationSplitted[0]) ?? 4 }, () => null),
  //   Array.from({ length: Number(formationSplitted[1]) ?? 4 }, () => null),
  //   Array.from({ length: Number(formationSplitted[2]) ?? 2 }, () => null),
  // ]);

  const activePlayersCount = activePlayers.filter(Boolean).length;
  console.log("formationSplitted", formationSplitted[2]);

  const movePlayer = (playerId: number, gridIndex: number, slot: number) => {
    console.log("Moving player with ID:", playerId);
    console.log("To grid index:", gridIndex);
    console.log("To slot:", slot);

    setGrid((prevGrid: any) => {
      let newGrid = [...prevGrid];
      console.log("Previous Grid:", prevGrid);

      const playerIndexOnBench = benchPlayers.findIndex(
        (p) => p?.id === playerId
      );
      console.log("Player Index on Bench:", playerIndexOnBench);

      // Remove the player from the bench
      setBenchPlayers((prevPlayers) =>
        prevPlayers.filter((p) => p.id !== playerId)
      );
      setActivePlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers];
        const existingPlayerIndex = updatedPlayers.findIndex(
          (p) => p?.id === benchPlayers[playerIndexOnBench]?.id
        );

        if (existingPlayerIndex === -1) {
          updatedPlayers.push(benchPlayers[playerIndexOnBench]);
        }

        return updatedPlayers;
      });
      let otherPlayers;
      if (gridIndex === 3) {
        const subSection = newGrid.slice(
          Number(formationSplitted[0]) + Number(formationSplitted[1]),
          Number(formationSplitted[0]) +
            Number(formationSplitted[1]) +
            Number(formationSplitted[2])
        );
        console.log("🚀 ~ setGrid ~ subSection:", subSection);
        subSection[slot] = benchPlayers[playerIndexOnBench];
        console.log("🚀 ~ setGrid ~ subSection[slot]:", subSection[slot]);
        otherPlayers = newGrid.slice(
          0,
          Number(formationSplitted[0]) +
            Number(formationSplitted[1]) +
            Number(formationSplitted[2]) -
            1
        );
        console.log("🚀 ~ setGrid ~ otherPlayers:", otherPlayers);
        console.log("🚀 ~ setGrid ~ newGrid:", newGrid);
        newGrid = otherPlayers.concat(subSection);

        return newGrid;
      } else if (gridIndex === 2) {
        const subSection = newGrid.slice(
          Number(formationSplitted[0]),
          Number(formationSplitted[0]) + Number(formationSplitted[1])
        );
        subSection[slot] = benchPlayers[playerIndexOnBench];
        otherPlayers = newGrid.slice(
          0,
          Number(formationSplitted[0]) + Number(formationSplitted[1])
        );
        newGrid = otherPlayers.concat(subSection);
        return newGrid;
      } else if (gridIndex === 1) {
        const subSection = newGrid.slice(0, Number(formationSplitted[0]));
        subSection[slot] = benchPlayers[playerIndexOnBench];
        otherPlayers = newGrid.slice(0, Number(formationSplitted[0]));
        newGrid = otherPlayers.concat(subSection);
        return newGrid;
      } else {
        newGrid[0] = benchPlayers[playerIndexOnBench];
        return newGrid;
      }
    });
    setIsSelecting(false);
  };

  useEffect(() => {
    console.log("format", selectedFormation.split("-"));

    setFormationSplitted(selectedFormation.split("-"));
  }, [selectedFormation]);

  // const handleGridSlotClick = (gridIndex: number, slot: number) => {
  //   if (movingPlayer) {
  //     setGrid((prevGrid) => {
  //       const newGrid = [...prevGrid];
  //       const playerIndexOnBench = benchPlayers.findIndex(
  //         (p) => p?.id === movingPlayer.id
  //       );

  //       // Remove the player from the bench
  //       setBenchPlayers((prevPlayers) =>
  //         prevPlayers.filter((p) => p.id !== movingPlayer.id)
  //       );

  //       // Add the player to the field
  //       setActivePlayers((prevPlayers) => {
  //         const updatedPlayers = [...prevPlayers];
  //         const formationColumns = formationSplitted[gridIndex]
  //           .split("-")
  //           .map(Number)[0];

  //         // Calculate row and column indices dynamically based on the grid index
  //         const rowIndex = Math.floor(slot / formationColumns);
  //         const colIndex = slot % formationColumns;

  //         updatedPlayers[gridIndex] = movingPlayer;
  //         return updatedPlayers;
  //       });

  //       // Update the newGrid with the correct player object
  //       newGrid[slot + gridIndex] = movingPlayer;

  //       setSelectedPlayer(null); // Clear the selected player after placing it

  //       return newGrid;
  //     });
  //   }
  // };

  const startGame = async () => {
    console.log("active", activePlayers);

    if (activePlayers.length !== 11) {
      toast.info("Please select 11 players");
    } else {
      toast.info("You have selected 11 ");
    }
  };

  const removePlayer = (playerId: number) => {
    setGrid((prevGrid: any) => {
      const newGrid = [...prevGrid];
      const playerIndexOnField = activePlayers.findIndex(
        (p) => p?.id === playerId
      );

      // Check if the player is on the field
      if (playerIndexOnField !== -1) {
        // Remove the player from the field
        setActivePlayers((prevPlayers: any) =>
          prevPlayers.map((p: PlayerType, index: number) => {
            if (index === playerIndexOnField) {
              return p;
            }
          })
        );

        // Check if the player is not already on the bench
        const isPlayerOnBench = benchPlayers.some((p) => p.id === playerId);
        if (!isPlayerOnBench) {
          // Add the player back to the bench with sorted order
          setBenchPlayers((prevPlayers) =>
            [...prevPlayers, activePlayers[playerIndexOnField]].sort(
              (a, b) => a.id - b.id
            )
          );
        }
      }

      return newGrid;
    });
  };

  useEffect(() => {
    // Fetch and parse the CSV data on component mount
    csv("/players.csv").then((data) => {
      console.log("data 95", data, selectedTeam);
      // Filter the data for the selected team and set the players state
      const teamPlayers = data
        .filter((player) => player.team_id === teams[selectedTeam].id) // Filter by selectedTeam
        .map((player) => ({
          id: parseInt(player.player_uid),
          name: player.player_name,
          team: player.team,
          position: getPositionRole(Number(player.position)),
          goalkeeper: player.goalkeeper,
          image: `/player_a.svg`,
          speed: calculateAttribute(player.speed),
          power: calculateAttribute(player.power),
          stamina: calculateAttribute(player.stamina),
          technique: calculateAttribute(player.technique),
          goalkeeping: calculateAttribute(player.goalkeeping),
          attackScore: calculateAttribute(player.attack),
          defenseScore: calculateAttribute(player.defense),
        }))
        .sort((a, b) => a.id - b.id);
      console.log("player0", teamPlayers[0]);

      setBenchPlayers(teamPlayers);
      setSelectedPlayer(teamPlayers[0].id);
      setPlayerData(teamPlayers[0]);
    });
  }, []);

  useEffect(() => {
    csv("/players.csv").then((data) => {
      console.log("123", data, selectedPlayer);
      // Filter the data for the selected team and set the players state
      const player = data
        .filter((player) => Number(player.player_uid) === selectedPlayer) // Filter by selectedTeam
        .map((player) => ({
          id: parseInt(player.player_uid),
          name: player.player_name,
          team: player.team,
          position: getPositionRole(Number(player.position)),
          goalkeeper: player.goalkeeper,
          image: `/player_a.svg`,
          speed: calculateAttribute(player.speed),
          power: calculateAttribute(player.power),
          stamina: calculateAttribute(player.stamina),
          technique: calculateAttribute(player.technique),
          goalkeeping: calculateAttribute(player.goalkeeping),
          attackScore: calculateAttribute(player.attack),
          defenseScore: calculateAttribute(player.defense),
        }));
      console.log("player", player[0]);

      setPlayerData(player[0]);
    });
  }, [selectedPlayer]);

  console.log("selected", selectedPlayer);

  useEffect(() => {
    // Calculate total attack and defense whenever activePlayers changes
    console.log("346", activePlayers);
    const newTotalAttack = activePlayers.reduce(
      (sum, player) => (player ? sum + player.attackScore : sum),
      0
    );
    const newTotalDefense = activePlayers.reduce(
      (sum, player) => (player ? sum + player.defenseScore : sum),
      0
    );

    // Update the state with the new totals
    setTotalAttack(newTotalAttack);
    setTotalDefense(newTotalDefense);
  }, [activePlayers]);
  console.log("selected", selectedFormation);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-rows-2 px-20 py-8 bg-white h-[90vh] overflow-hidden w-full ">
        <div className=" relative  grid grid-cols-4  gap-y-8  bg-center max-h-[85vh]  bg-no-repeat w-full   ">
          <div className="col-span-4  h-80 relative">
            <Image className="absolute z-0" src="/field.svg" fill alt="field" />
            <div className="grid grid-rows-4  items-start justify-center h-[100%] z-10">
              {/* Separate columns for each position group */}

              <div className="row-span-1">
                <Grid
                  selectedPlayer={selectedPlayer!}
                  rowIndex={3}
                  isGoalkeeper={false}
                  isSelecting={isSelecting}
                  formation={formationSplitted[2]}
                  grid={grid.slice(
                    Number(formationSplitted[0]) + Number(formationSplitted[1]),
                    Number(formationSplitted[0]) +
                      Number(formationSplitted[1]) +
                      Number(formationSplitted[2])
                  )}
                  movePlayer={movePlayer}
                  removePlayer={removePlayer}
                />
              </div>
              <div className="row-span-1">
                <Grid
                  selectedPlayer={selectedPlayer!}
                  rowIndex={2}
                  isGoalkeeper={false}
                  isSelecting={isSelecting}
                  formation={formationSplitted[1]}
                  grid={grid.slice(
                    Number(formationSplitted[0]),
                    Number(formationSplitted[0]) + Number(formationSplitted[1])
                  )}
                  movePlayer={movePlayer}
                  removePlayer={removePlayer}
                />
              </div>
              <div className="row-span-1">
                <Grid
                  selectedPlayer={selectedPlayer!}
                  rowIndex={1}
                  isGoalkeeper={false}
                  isSelecting={isSelecting}
                  formation={formationSplitted[0]}
                  grid={grid.slice(0, Number(formationSplitted[0]))}
                  movePlayer={movePlayer}
                  removePlayer={removePlayer}
                />
              </div>
              <div className="row-span-1 ">
                <Grid
                  selectedPlayer={selectedPlayer!}
                  rowIndex={0}
                  isGoalkeeper={true}
                  formation={"1"}
                  isSelecting={isSelecting}
                  grid={grid.slice(0, 1)}
                  movePlayer={movePlayer}
                  removePlayer={removePlayer}
                />
              </div>
            </div>
          </div>

          {/* <div className="mt-4 "> */}
          {/* {grid.map((player, index) => {
            const isDisabled = index === 0 || index === 8; // Disables the top left and bottom left slots in a 3x4 grid
            return (
              <GridSlot
                key={index}
                slot={index}
                player={player}
                movePlayer={movePlayer}
                isDisabled={isDisabled}
                removePlayer={removePlayer}
              />
            );
          })} */}

          {/* </div> */}
        </div>
        <div className="col-start-3 col-span-1 row-start-1 row-span-2 flex flex-col gap-6">
          <Card className="border-gray-200 bg-[#f5f5f5] border-2">
            <CardContent className="py-2">
              <div className="absolute left-4">
                <Button variant={"outline"} size={"icon"} className="">
                  <IoIosArrowBack
                    onClick={() => setIsGameStarted(false)}
                    className="w-6 h-6"
                  />
                </Button>
              </div>
              <div className="flex items-center justify-center flex-col">
                <h1 className="text-2xl font-bold">
                  {teams[selectedTeam].name}
                </h1>
                <Image
                  width={64}
                  height={64}
                  src={`/${teams[selectedTeam].image}.svg`}
                  alt={teams[selectedTeam].name}
                  className=""
                />

                {/* <div className="-ml-4">
                  {renderStars(
                    calculateStarRating(
                      teams[selectedTeam].attack,
                      teams[selectedTeam].defense
                    )
                  )}
                </div> */}
                <div className="flex w-full justify-between">
                  <SelectFormation
                    selectedFormation={selectedFormation}
                    setSelectedFormation={setSelectedFormation}
                  />
                  <div className="mr-10">
                    {renderStars(
                      calculateStarRating(
                        teams[selectedTeam].attack,
                        teams[selectedTeam].defense
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {playerData && (
            <div className="">
              <PlayerDetails playerDetails={playerData!} />
            </div>
          )}
          <div className="w-full -mt-2 flex justify-center">
            <Button onClick={startGame} className="w-1/2" variant={"outline"}>
              Start Game
            </Button>
          </div>
        </div>
        <div className="row-start-2 flex flex-col w-full h-auto mt-12 border-gray-200 bg-[#f5f5f5] border-2 px-4 rounded-md">
          {/* {activePlayersCount === 11 && (
            <div className="absolute right-24 top-36">
              <Button
                variant="outline"
                className="text-black"
                // onClick={
                //   location.pathname === "create-game" ? startGame : joinGame
                // }
              >
                Start Game
              </Button>
            </div>
          )} */}
          {/* <div className="flex flex-col px-4 whitespace-nowrap">
            <h1 className="text-xl tracking-tighter">
              Current Attack : {totalAttack}
            </h1>
            <h1 className="text-xl tracking-tighter">
              Current Defence : {totalDefense}
            </h1>
          </div> */}
          {/* <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
              Make changes to your account here.
              </TabsContent>
              <TabsContent value="password">
              Change your password here.
              </TabsContent>
            </Tabs> */}
          <ScrollArea className=" overflow-y-auto h-[calc(80vh_-_40px)] p-5">
            <div className="w-full grid grid-cols-5 gap-2  h-[calc(80vh_-_40px)] p-2 ">
              {benchPlayers!.map((player) => {
                return (
                  <Player
                    key={player.name}
                    onPlayerClick={() => {
                      setMovingPlayer(player);
                      setSelectedPlayer(player.id);
                      setIsSelecting(true);
                    }}
                    player={player}
                    movePlayer={(playerId, slot) =>
                      movePlayer(playerId, 1, slot)
                    }
                    isActive={false}
                  />
                );
              })}
            </div>
            {/* {activePlayersCount !== 11 && (
              <div className="w-full flex justify-center">
                <Button className="w-1/2" variant={"outline"}>
                  Start Game
                </Button>
              </div>
            )} */}
          </ScrollArea>
        </div>
      </div>
    </DndProvider>
  );
};
export default Game;
