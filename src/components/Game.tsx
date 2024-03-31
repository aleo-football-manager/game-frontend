"use client";

import { Step, useAcceptGameStore } from "@/app/accept-game/store";
import { useGameStore } from "@/app/state/gameStore";
import { useEventHandling } from "@/hooks/eventHandling";
import { useMsRecords } from "@/hooks/msRecords";
import {
  calculateAttribute,
  getPositionRole,
  getTeamName,
  isValidPlacement,
} from "@/utils";
import { teams } from "@/utils/team-data";

import {
  EventType,
  RecordWithPlaintext,
  RecordsFilter,
  createSharedState,
  getRecords,
  requestCreateEvent,
  requestSignature,
  useAccount,
  useBalance,
} from "@puzzlehq/sdk";
import { csv } from "d3";
import { motion } from "framer-motion";
import jsyaml from "js-yaml";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useKeyPressEvent, useWindowSize } from "react-use";
import { toast } from "sonner";
import { useNewGameStore } from "../app/create-game/store";
import {
  AcceptGameInputs,
  GAME_FUNCTIONS,
  GAME_PROGRAM_ID,
  ProposeGameInputs,
  transitionFees,
} from "../app/state/manager";
import Player from "./Player";
import PlayerDetails from "./PlayerDetails";
import SelectFormation from "./SelectFormation";
import { calculateStarRating, renderStars } from "./TeamCard";
import Grid from "./grid-ui/Grid";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
interface IGame {
  selectedTeam: number;
  isChallenged: boolean;
  // setIsGameStarted: (val: boolean) => void;
}
type Position = "GK" | "DEF" | "MID" | "ATT";
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

export type SelectedPlayer = {
  id: number;
  position: string;
};

export const initializeGrid = (
  formation: string,
  existingGrid: any[]
): any[] => {
  const [defenders, midfielders, forwards] = formation.split("-").map(Number);
  const initialGrid = [
    Array.from({ length: 1 }, () => null), // Goalkeeper
    Array.from({ length: defenders || 4 }, () => null), // Defenders
    Array.from({ length: midfielders || 4 }, () => null), // Midfielders
    Array.from({ length: forwards || 2 }, () => null), // Forwards
  ];

  // Copy existing players to the new grid
  for (let rowIndex = 0; rowIndex < existingGrid.length; rowIndex++) {
    for (
      let slotIndex = 0;
      slotIndex < existingGrid[rowIndex].length;
      slotIndex++
    ) {
      if (existingGrid[rowIndex][slotIndex] !== null) {
        initialGrid[rowIndex][slotIndex] = {
          ...existingGrid[rowIndex][slotIndex],
        };
      }
    }
  }

  return initialGrid;
};

const tabs = [
  { id: "GK", label: "GK" },
  { id: "DEF", label: "DEF" },
  { id: "MID", label: "MID" },
  { id: "ATT", label: "ATT" },
];

const messageToSign = "Let's play Super Leo Lig";
const nonce = "1234567field"; // todo make this random?

const Game: React.FC<IGame> = ({ selectedTeam, isChallenged }) => {
  const { width } = useWindowSize();
  const ALEO_NETWORK_URL = "https://node.puzzle.online/testnet3";
  const { account } = useAccount();
  const { balances } = useBalance({});
  const balance = balances?.[0]?.public ?? 0;
  const [tab, setTab] = useState<Position>("GK");
  const [benchPlayers, setBenchPlayers] = useState<PlayerType[]>([]);
  const [activePlayers, setActivePlayers] = useState<PlayerType[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
    null
  );
  const router = useRouter();

  // const [selectedCheckboxes, setSelectedCheckboxes] = useState<
  //   Record<Position, boolean>
  // >({
  //   GK: true,
  //   DEF: true,
  //   MID: true,
  //   ATT: true,
  // });
  const [movingPlayer, setMovingPlayer] = useState<PlayerType>();
  const [playerData, setPlayerData] = useState<PlayerType>();
  const [totalAttack, setTotalAttack] = useState(0);
  const [totalDefense, setTotalDefense] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const pathname = usePathname();
  const { setInputs, inputs, setEventId } = useNewGameStore();
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedReplacementPlayer, setSelectedReplacementPlayer] =
    useState<PlayerType | null>(null);
  // const [opponentTotalDefense, setOpponentTotalDefense] = useState(0);
  // const [opponentTotalAttack, setOpponentTotalAttack] = useState(0);
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [formationSplitted, setFormationSplitted] = useState(
    selectedFormation.split("-")
  );
  const [grid, setGrid] = useState<any>(initializeGrid(selectedFormation, []));
  useKeyPressEvent("Escape", () => setIsSelecting(false));

  const [
    inputsAcceptGame,
    eventIdAccept,
    setAcceptGameInputs,
    setEventIdAccept,
    initializeAcceptGame,
    setStep,
  ] = useAcceptGameStore((state) => [
    state.inputsAcceptGame,
    state.eventIdAccept,
    state.setAcceptGameInputs,
    state.setEventIdAccept,
    state.initializeAcceptGame,
    state.setStep,
  ]);
  const [currentGame] = useGameStore((state) => [state.currentGame]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerType[]>([]);
  const msAddress = currentGame?.gameNotification.recordData.game_multisig;
  const { msPuzzleRecords: recordsPuzzle, msGameRecords: recordsGame } =
    useMsRecords(msAddress);
  const [msPuzzleRecords, setMsPuzzleRecords] = useState<
    RecordWithPlaintext[] | undefined
  >();
  const [msGameRecords, setMsGameRecords] = useState<
    RecordWithPlaintext[] | undefined
  >();

  const { loading, error, event, setLoading, setError } = useEventHandling({
    id: eventIdAccept,
    address: msAddress,
    multisig: true,
    stepName: "Accept Game",
    onSettled: () => setStep(Step._03_Confirmed),
  });

  // const { balances: msBalances } = useBalance({
  //   address: msAddress,
  //   multisig: true,
  // });
  // const msPublicBalance =
  //   msBalances && msBalances?.length > 0 ? msBalances[0].public : 0;

  // const handleCheckboxChange = (position: Position) => {
  //   if (
  //     Object.values(selectedCheckboxes).filter(Boolean).length > 1 ||
  //     !selectedCheckboxes[position]
  //   ) {
  //     setSelectedCheckboxes((prev) => ({
  //       ...prev,
  //       [position]: !prev[position],
  //     }));
  //   }
  // };

  useEffect(() => {
    const filteredPlayers = benchPlayers.filter(
      (player) => player.position === tab
    );
    setFilteredPlayers(filteredPlayers);
  }, [tab, benchPlayers]);

  useEffect(() => {
    if (!currentGame || !msPuzzleRecords || !msGameRecords) return;
    const piece_stake_challenger = msPuzzleRecords?.find(
      (r: any) =>
        r.data.ix === "3u32.private" &&
        r.data.challenger.replace(".private", "") ===
          currentGame.gameNotification.recordData.challenger_address &&
        r.data.staker.replace(".private", "") ===
          currentGame.gameNotification.recordData.challenger_address
    );
    const piece_claim_challenger = msPuzzleRecords.find(
      (r: any) =>
        r.data.ix === "6u32.private" &&
        r.data.challenger.replace(".private", "") ===
          currentGame.gameNotification.recordData.challenger_address &&
        r.data.claimer.replace(".private", "") ===
          currentGame.gameNotification.recordData.challenger_address
    );
    const piece_stake_opponent = msPuzzleRecords.find(
      (r) =>
        r.data.ix === "3u32.private" &&
        r.data.opponent.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address &&
        r.data.staker.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address
    );
    const piece_claim_opponent = msPuzzleRecords.find(
      (r) =>
        r.data.ix === "6u32.private" &&
        r.data.opponent.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address &&
        r.data.claimer.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address
    );

    if (
      piece_claim_challenger === undefined ||
      piece_claim_opponent === undefined ||
      piece_stake_challenger === undefined ||
      piece_stake_opponent === undefined ||
      msGameRecords[0] === undefined
    )
      return;
    initializeAcceptGame(
      msGameRecords[0],
      piece_stake_challenger,
      piece_claim_challenger,
      piece_stake_opponent,
      piece_claim_opponent
    );
  }, [
    currentGame?.gameNotification.recordData.game_multisig,
    [msPuzzleRecords, msGameRecords].toString(),
  ]);

  const filter: RecordsFilter = {
    programIds: [
      "football_game_v014.aleo",
      "puzzle_pieces_v016.aleo",
      "multiparty_pvp_utils_v015_avh.aleo",
    ],
    type: "unspent",
  };
  useEffect(() => {
    const response = async () => {
      const records = await getRecords({
        filter,
        address: msAddress,

        // multisig: true,
      });
      const msGameRecordsData = records?.records?.filter(
        (record) => record.programId === "football_game_v014.aleo"
      );

      const msPuzzleRecordsData = records?.records?.filter(
        (record) => record.programId === "puzzle_pieces_v016.aleo"
      );

      const msUtilRecords = records?.records?.filter(
        (record) => record.programId === "multiparty_pvp_utils_v015_avh.aleo"
      );
      setMsPuzzleRecords(msPuzzleRecordsData!);
      setMsGameRecords(msGameRecordsData!);
    };
    response();
  }, []);

  const createAcceptGameEvent = async () => {
    if (
      !inputsAcceptGame?.game_record ||
      !inputsAcceptGame.piece_stake_challenger ||
      !inputsAcceptGame.piece_claim_challenger ||
      !inputsAcceptGame.piece_stake_opponent ||
      !inputsAcceptGame.piece_claim_opponent
    )
      return;
    setLoading(true);
    setError(undefined);
    try {
      const response_block_ht = await fetch(
        `${ALEO_NETWORK_URL}/latest/height`
      );
      const activePlayerIds = activePlayers.map((player) => {
        return `${player.id}u8`;
      });
      const block_ht = Number(await response_block_ht.json());
      // TODO: Error handling for missing input
      const acceptGameInputs: Omit<
        AcceptGameInputs,
        "opponent_answer_readable"
      > = {
        game_record: inputsAcceptGame.game_record,
        opponent_answer: "[" + activePlayerIds.toString() + "]",
        piece_stake_challenger: inputsAcceptGame.piece_stake_challenger,
        piece_claim_challenger: inputsAcceptGame.piece_claim_challenger,
        piece_stake_opponent: inputsAcceptGame.piece_stake_opponent,
        piece_claim_opponent: inputsAcceptGame.piece_claim_opponent,
        block_ht: block_ht.toString() + "u32",
      };
      const response = await requestCreateEvent({
        type: EventType.Execute,
        programId: GAME_PROGRAM_ID,
        functionId: GAME_FUNCTIONS.accept_game,
        fee: transitionFees.accept_game,
        inputs: Object.values(acceptGameInputs),
        address: inputsAcceptGame.game_record.owner,
      });
      setLoadingMessage("Joining game...");

      if (response.error) {
        setError(response.error);
        setLoading(false);
      } else if (!response.eventId) {
        setError("No eventId found!");
        setLoading(false);
      } else {
        setEventIdAccept(response.eventId);
        router.push(`/create-game/${response.eventId}`);
      }
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  // const [grid, setGrid] = useState<any>([
  //   Array.from({ length: 1 }, () => null),
  //   Array.from({ length: Number(formationSplitted[0]) ?? 4 }, () => null),
  //   Array.from({ length: Number(formationSplitted[1]) ?? 4 }, () => null),
  //   Array.from({ length: Number(formationSplitted[2]) ?? 2 }, () => null),
  // ]);

  const createProposeGameEvent = async () => {
    setIsLoading(true);
    // setConfirmStep(ConfirmStep.Signing);
    // setError(undefined);

    toast.info("Please sign the message");
    setLoadingMessage("Signing...");
    const signature = await requestSignature({ message: messageToSign });

    if (signature.error || !signature.messageFields || !signature.signature) {
      setIsLoading(false);
      return;
    }
    setLoadingMessage("Creating Multisig...");
    const sharedStateResponse = await createSharedState();

    if (sharedStateResponse.error) {
      setIsLoading(false);
      return;
    } else if (sharedStateResponse.data) {
      const game_multisig_seed = sharedStateResponse.data.seed;
      const game_multisig = sharedStateResponse.data.address;

      setInputs({ ...inputs, game_multisig_seed, game_multisig });

      if (
        inputs?.opponent &&
        inputs?.wager_record &&
        inputs?.challenger_wager_amount &&
        // inputs?.challenger_answer &&
        // inputs?.challenger &&
        signature &&
        signature.messageFields &&
        signature.signature &&
        account
      ) {
        const fields = Object(jsyaml.load(signature.messageFields));
        const activePlayerIds = activePlayers.map((player) => {
          return `${player.id}u8`;
        });

        const proposalInputs: ProposeGameInputs = {
          wager_record: inputs.wager_record,
          challenger_wager_amount: inputs.challenger_wager_amount + "u64",
          sender: account?.address,
          challenger: account?.address,
          opponent: inputs.opponent,
          game_multisig: game_multisig,
          challenger_message_1: fields.field_1,
          challenger_message_2: fields.field_2,
          challenger_message_3: fields.field_3,
          challenger_message_4: fields.field_4,
          challenger_message_5: fields.field_5,
          challenger_sig: signature.signature,
          challenger_nonce: nonce, /// todo - make this random
          challenger_answer: "[" + activePlayerIds.toString() + "]",
          game_multisig_seed,
        };
        toast.info("Approve the transaction to create the game");

        const response = await requestCreateEvent({
          type: EventType.Execute,
          programId: GAME_PROGRAM_ID,
          functionId: GAME_FUNCTIONS.propose_game,
          fee: transitionFees.propose_game,
          inputs: Object.values(proposalInputs),
        });
        setLoadingMessage("Starting Game...");

        if (response.error) {
          setIsLoading(false);
          setLoadingMessage("");
        } else if (!response.eventId) {
          setIsLoading(false);
          setLoadingMessage("");
        } else {
          setIsLoading(false);
          setEventId(response.eventId);
          router.push(`/create-game/${response.eventId}`);
          //   setSearchParams({ eventId: response.eventId });
        }
      }
    }
  };

  // // TODO AVH DELETE THIS LATER. ONLY FOR TESTING PURPOSES
  // const createDefaultProposeGameEvent = async () => {
  //   setIsLoading(true);
  //   // setConfirmStep(ConfirmStep.Signing);
  //   // setError(undefined);

  //   const signature = await requestSignature({ message: messageToSign });

  //   if (signature.error || !signature.messageFields || !signature.signature) {
  //     setIsLoading(false);
  //     return;
  //   }
  //   const sharedStateResponse = await createSharedState();
  //   if (sharedStateResponse.error) {
  //     setIsLoading(false);
  //     return;
  //   } else if (sharedStateResponse.data) {
  //     const game_multisig_seed = sharedStateResponse.data.seed;
  //     const game_multisig = sharedStateResponse.data.address;

  //     setInputs({ ...inputs, game_multisig_seed, game_multisig });

  //     if (
  //       inputs?.opponent &&
  //       inputs?.wager_record &&
  //       inputs?.challenger_wager_amount &&
  //       // inputs?.challenger_answer &&
  //       // inputs?.challenger &&
  //       signature &&
  //       signature.messageFields &&
  //       signature.signature &&
  //       account
  //     ) {
  //       const fields = Object(jsyaml.load(signature.messageFields));

  //       const proposalInputs: ProposeGameInputs = {
  //         wager_record: inputs.wager_record,
  //         challenger_wager_amount: inputs.challenger_wager_amount + "u64",
  //         sender: account?.address,
  //         challenger: account?.address,
  //         opponent: inputs.opponent,
  //         game_multisig: game_multisig,
  //         challenger_message_1: fields.field_1,
  //         challenger_message_2: fields.field_2,
  //         challenger_message_3: fields.field_3,
  //         challenger_message_4: fields.field_4,
  //         challenger_message_5: fields.field_5,
  //         challenger_sig: signature.signature,
  //         challenger_nonce: nonce, /// todo - make this random
  //         challenger_answer:
  //           "[1u8, 4u8, 5u8, 6u8, 7u8, 8u8, 9u8, 10u8, 11u8, 12u8, 13u8]",
  //         game_multisig_seed,
  //       };
  //       const response = await requestCreateEvent({
  //         type: EventType.Execute,
  //         programId: GAME_PROGRAM_ID,
  //         functionId: GAME_FUNCTIONS.propose_game,
  //         fee: transitionFees.propose_game,
  //         inputs: Object.values(proposalInputs),
  //       });
  //       if (response.error) {
  //         // todo AVH
  //       } else if (!response.eventId) {
  //         // todo AVH
  //       } else {
  //         router.push(`/create-game/${response.eventId}`);

  //         setEventId(response.eventId);
  //         //   setSearchParams({ eventId: response.eventId });
  //       }
  //     }
  //   }
  // };

  // const createDefaultAcceptGameEvent = async () => {
  //   if (
  //     !inputsAcceptGame?.game_record ||
  //     !inputsAcceptGame.piece_stake_challenger ||
  //     !inputsAcceptGame.piece_claim_challenger ||
  //     !inputsAcceptGame.piece_stake_opponent ||
  //     !inputsAcceptGame.piece_claim_opponent
  //   )
  //     return;
  //   setLoading(true);
  //   setError(undefined);
  //   try {
  //     const response_block_ht = await fetch(
  //       `${ALEO_NETWORK_URL}/latest/height`
  //     );

  //     const block_ht = Number(await response_block_ht.json());
  //     const acceptGameInputs: Omit<
  //       AcceptGameInputs,
  //       "opponent_answer_readable"
  //     > = {
  //       game_record: inputsAcceptGame.game_record,
  //       opponent_answer:
  //         "[1u8, 4u8, 5u8, 6u8, 7u8, 8u8, 9u8, 10u8, 11u8, 12u8, 13u8]",
  //       piece_stake_challenger: inputsAcceptGame.piece_stake_challenger,
  //       piece_claim_challenger: inputsAcceptGame.piece_claim_challenger,
  //       piece_stake_opponent: inputsAcceptGame.piece_stake_opponent,
  //       piece_claim_opponent: inputsAcceptGame.piece_claim_opponent,
  //       block_ht: block_ht.toString() + "u32",
  //     };

  //     const response = await requestCreateEvent({
  //       type: EventType.Execute,
  //       programId: GAME_PROGRAM_ID,
  //       functionId: GAME_FUNCTIONS.accept_game,
  //       fee: transitionFees.accept_game,
  //       inputs: Object.values(acceptGameInputs),
  //       address: inputsAcceptGame.game_record.owner,
  //     });
  //     setLoadingMessage("Joining game...");

  //     if (response.error) {
  //       setError(response.error);
  //       setLoading(false);
  //     } else if (!response.eventId) {
  //       setError("No eventId found!");
  //       setLoading(false);
  //     } else {
  //       setEventIdAccept(response.eventId);
  //       router.push(`/create-game/${response.eventId}`);
  //     }
  //   } catch (e) {
  //     setError((e as Error).message);
  //     setLoading(false);
  //   }
  // };
  const activePlayersCount = activePlayers.filter(Boolean).length;

  const movePlayer = (playerId: number, gridIndex: number, slot: number) => {
    const playerIndexOnBench = benchPlayers.findIndex(
      (p) => p?.id === playerId
    );

    // Validate if the player can be placed in the specified grid position
    if (
      !isValidPlacement(benchPlayers[playerIndexOnBench]?.position, gridIndex)
    ) {
      toast.error("Invalid placement for the player.");
      setIsSelecting(false);
      return;
    }

    setGrid((prevGrid: any) => {
      const newGrid = [...prevGrid];

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

      newGrid[gridIndex][slot] = benchPlayers[playerIndexOnBench];

      return newGrid;
    });

    setIsSelecting(false);
  };

  const replacePlayer = (playerId: number) => {
    const playerToReplace = activePlayers.find(
      (player) => player?.id === playerId
    );
    if (playerToReplace) {
      // Set the player to be replaced in the state
      setSelectedReplacementPlayer(playerToReplace);
    }
  };

  useEffect(() => {
    setFormationSplitted(selectedFormation.split("-"));

    setGrid((prevGrid: any) => initializeGrid(selectedFormation, prevGrid));
  }, [selectedFormation]);

  const startGame = async () => {
    if (activePlayers.length !== 11) {
      toast.info("Please select 11 players");
    } else {
      if (isChallenged) {
        const acceptGame = await createAcceptGameEvent();
      } else {
        const createGame = await createProposeGameEvent();
      }

      // toast.info("You have selected 11 ");
    }
  };

  // // TODO AVH DELETE THIS LATER. ONLY FOR TESTING PURPOSES
  // const startDefaultGame = async () => {
  //   if (isChallenged) {
  //     const acceptGame = await createDefaultAcceptGameEvent();
  //   } else {
  //     const createGame = await createDefaultProposeGameEvent();
  //   }
  // };
  const removePlayer = (playerId: number) => {
    setGrid((prevGrid: any) => {
      const newGrid = [...prevGrid];
      const playerIndexOnField = activePlayers.findIndex(
        (p) => p?.id === playerId
      );

      // Check if the player is on the field
      if (playerIndexOnField !== -1) {
        // Clear the slot in the grid
        const [rowIndex, slotIndex] = findPlayerLocation(newGrid, playerId);
        if (rowIndex !== -1 && slotIndex !== -1) {
          newGrid[rowIndex][slotIndex] = null;
        }

        // Remove the player from the field
        setActivePlayers((prevPlayers: any) =>
          prevPlayers.filter(
            (_: any, index: number) => index !== playerIndexOnField
          )
        );

        // Check if the player is not already on the bench
        const isPlayerOnBench = benchPlayers.some((p) => p.id === playerId);
        if (!isPlayerOnBench) {
          // Add the player back to the bench with sorted order
          setBenchPlayers((prevPlayers) => {
            const updatedBenchPlayers = [...prevPlayers];

            // Ensure the player is not already on the bench
            const isPlayerOnBench = updatedBenchPlayers.some(
              (p) => p.id === playerId
            );
            if (!isPlayerOnBench) {
              updatedBenchPlayers.push(activePlayers[playerIndexOnField]);
            }

            return updatedBenchPlayers.sort((a, b) => a.id - b.id);
          });
        }
      }

      return newGrid;
    });
  };
  const onTabChange = (value: any) => {
    setTab(value);
  };
  const findPlayerLocation = (
    grid: any[],
    playerId: number
  ): [number, number] => {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      const slotIndex = grid[rowIndex].findIndex(
        (player: PlayerType) => player?.id === playerId
      );
      if (slotIndex !== -1) {
        return [rowIndex, slotIndex];
      }
    }
    return [-1, -1]; // Player not found on the grid
  };

  useEffect(() => {
    // Fetch and parse the CSV data on component mount
    csv("/players.csv").then((data) => {
      // Filter the data for the selected team and set the players state
      const teamPlayers = data
        .filter((player) => player.team_id === teams[selectedTeam].id) // Filter by selectedTeam
        .map((player) => {
          const teamName = getTeamName(player.team_id);
          console.log(`/players/player_${teamName}.png`, player);
          return {
            id: parseInt(player.player_uid),
            name: player.player_name,
            team: player.team,
            position: getPositionRole(Number(player.position)),
            goalkeeper: player.goalkeeper,
            image: `/players/player_${teamName}.png`,
            speed: calculateAttribute(player.speed),
            power: calculateAttribute(player.power),
            stamina: calculateAttribute(player.stamina),
            technique: calculateAttribute(player.technique),
            goalkeeping: calculateAttribute(player.goalkeeping),
            attackScore: calculateAttribute(player.attack),
            defenseScore: calculateAttribute(player.defense),
          };
        })
        .sort((a, b) => a.id - b.id);

      setBenchPlayers(teamPlayers);
      setSelectedPlayer({
        id: teamPlayers[0].id,
        position: teamPlayers[0].position,
      });

      setPlayerData(teamPlayers[0]);
    });
  }, []);

  useEffect(() => {
    csv("/players.csv").then((data) => {
      // Filter the data for the selected team and set the players state
      const player = data
        .filter((player) => Number(player.player_uid) === selectedPlayer!.id) // Filter by selectedTeam
        .map((player) => {
          const teamName = getTeamName(player.team_id);

          return {
            id: parseInt(player.player_uid),
            name: player.player_name,
            team: player.team,
            position: getPositionRole(Number(player.position)),
            goalkeeper: player.goalkeeper,
            image: `/players/player_${teamName}.png`,
            speed: calculateAttribute(player.speed),
            power: calculateAttribute(player.power),
            stamina: calculateAttribute(player.stamina),
            technique: calculateAttribute(player.technique),
            goalkeeping: calculateAttribute(player.goalkeeping),
            attackScore: calculateAttribute(player.attack),
            defenseScore: calculateAttribute(player.defense),
          };
        });

      setPlayerData(player[0]);
    });
  }, [selectedPlayer]);

  useEffect(() => {
    // Calculate total attack and defense whenever activePlayers changes
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

  return (
    // <DndProvider backend={HTML5Backend}>
    <div className="flex flex-col gap-6 xl:gap-0 xl:grid xl:grid-rows-2  px-20 py-8  h-[90vh] xl:overflow-hidden w-full ">
      <div className=" relative  grid grid-cols-1  xl:grid-cols-2 gap-y-8  bg-center max-h-[85vh]  bg-no-repeat w-full   ">
        <div className=" col-span-1 xl:col-span-4  h-80 relative">
          <Image className="absolute z-0" src="/field.svg" fill alt="field" />
          <div className="grid grid-rows-4  items-start justify-center h-[100%] z-10">
            <div className="row-span-1">
              <Grid
                selectedPlayer={selectedPlayer!}
                rowIndex={3}
                isGoalkeeper={false}
                formation={formationSplitted[2]}
                grid={grid[3]}
                jersey={teams[selectedTeam].jersey}
                setIsSelecting={setIsSelecting}
                isSelecting={isSelecting}
                movePlayer={movePlayer}
                removePlayer={removePlayer}
                replacePlayer={replacePlayer}
              />
            </div>
            <div className="row-span-1">
              <Grid
                selectedPlayer={selectedPlayer!}
                rowIndex={2}
                isGoalkeeper={false}
                formation={formationSplitted[1]}
                grid={grid[2]}
                jersey={teams[selectedTeam].jersey}
                setIsSelecting={setIsSelecting}
                isSelecting={isSelecting}
                movePlayer={movePlayer}
                removePlayer={removePlayer}
                replacePlayer={replacePlayer}
              />
            </div>
            <div className="row-span-1">
              <Grid
                selectedPlayer={selectedPlayer!}
                rowIndex={1}
                isGoalkeeper={false}
                isSelecting={isSelecting}
                jersey={teams[selectedTeam].jersey}
                formation={formationSplitted[0]}
                setIsSelecting={setIsSelecting}
                grid={grid[1]}
                movePlayer={movePlayer}
                removePlayer={removePlayer}
                replacePlayer={replacePlayer}
              />
            </div>
            <div className="row-span-1 ">
              <Grid
                selectedPlayer={selectedPlayer!}
                rowIndex={0}
                isGoalkeeper={true}
                formation={"1"}
                isSelecting={isSelecting}
                jersey={teams[selectedTeam].jersey}
                setIsSelecting={setIsSelecting}
                grid={grid[0]} // Adjust the range based on your data
                movePlayer={movePlayer}
                replacePlayer={replacePlayer}
                removePlayer={removePlayer}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="xl:row-start-2 flex flex-col w-full h-[270px] mt-12   border-2 max-sm:px-0.5 px-4 rounded-md">
        {/* <div className="flex flex-col px-4 whitespace-nowrap">
            <h1 className="text-xl tracking-tighter">
              Current Attack : {totalAttack}
            </h1>
            <h1 className="text-xl tracking-tighter">
              Current Defence : {totalDefense}
            </h1>
          </div> */}

        <ScrollArea className=" overflow-y-auto h-64 max-sm:px-0.5 max-sm:py-2 p-5">
          <Tabs
            value={tab}
            onValueChange={onTabChange}
            defaultValue="all"
            className="max-w-5xl   "
          >
            <div className="flex w-full items-center justify-center">
              <TabsList className="flex w-fit  bg-transparent border gap-1 md:gap-4  items-center justify-center">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    className={`${
                      activeTab === tab.id ? "text-white" : "text-black"
                    } relative rounded-full  max-sm:px-1 px-3 py-1.5 text-xs md:text-sm font-medium  dark:text-white transition focus-visible:outline-2 `}
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

            {["GK", "DEF", "MID", "ATT"].map((position) => (
              <TabsContent key={position} value={position}>
                <div className=" grid items-center justify-center justify-items-center max-sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2  h-64 p-6 ">
                  {filteredPlayers!.map((player) => {
                    return (
                      <Player
                        key={player.name}
                        selectedPlayer={selectedPlayer!}
                        onPlayerClick={() => {
                          setMovingPlayer(player);
                          setSelectedPlayer({
                            id: player.id,
                            position: player.position,
                          });
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
              </TabsContent>
            ))}
          </Tabs>
          {/* {activePlayersCount !== 11 && (
              <div className="w-full flex justify-center">
                <Button className="w-1/2" variant={"outline"}>
                  Start Game
                </Button>
              </div>
            )} */}
        </ScrollArea>
      </div>
      <div className="col-start-1 justify-center  py-4 items-center xl:col-start-3 col-span-1 row-start-1  row-span-2 flex flex-col gap-6">
        <Card className="shadow max-w-lg xl:w-full">
          <CardContent className="py-2">
            <div className="flex items-center justify-center flex-col">
              <h1 className="text-2xl font-bold">{teams[selectedTeam].name}</h1>
              <Image
                width={64}
                height={64}
                src={`/${teams[selectedTeam].image}.svg`}
                alt={teams[selectedTeam].name}
                className=""
              />

              <div className="flex flex-col md:flex-row justify-center max-md:gap-4 max-md:mt-2 items-center w-full md:justify-between">
                <SelectFormation
                  selectedFormation={selectedFormation}
                  setSelectedFormation={setSelectedFormation}
                />
                <div className="">
                  {renderStars(
                    calculateStarRating(
                      teams[selectedTeam].attack,
                      teams[selectedTeam].midfield,
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
          <Button
            disabled={isLoading}
            onClick={startGame}
            className="w-1/2"
            variant={"outline"}
          >
            {loadingMessage ? loadingMessage : "Start Game"}
          </Button>
        </div>

        {/* <div className="w-full -mt-2 flex justify-center">
          <Button
            onClick={startDefaultGame}
            className="w-1/2"
            variant={"outline"}
          >
            TEST
          </Button>
        </div>
        GAME ID : {currentGame?.gameNotification.recordData.game_multisig} */}

        {/* Idea: Allow only to click start when multisig = path
        Also check if signed in wallet = opponent from game */}
      </div>

      <Dialog defaultOpen>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex gap-1 w-full flex-col justify-center items-center">
            <DialogTitle>How to play?</DialogTitle>
            <DialogDescription>
              <h1 className="font-semibold tracking-tighter text-[#868989] ">
                Welcome to Super Leo Lig. To create your starting squad; click
                on the player you want, then click on the spot in the field to
                place him. When you have all 11 players, go ahead and start the
                game. Good luck!
              </h1>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
    // </DndProvider>
  );
};
export default Game;
