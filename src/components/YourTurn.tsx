import { useAcceptGameStore } from "@/app/accept-game/store";
import {
  CalculateOutcomeInputs,
  FinishGameInputs,
  GAME_FUNCTIONS,
  GAME_PROGRAM_ID,
  RevealAnswerInputs,
  SubmitWagerInputs,
  transitionFees,
} from "@/app/state/manager";
import { useEventHandling } from "@/hooks/eventHandling";
import { useMsRecords } from "@/hooks/msRecords";
import {
  EventType,
  RecordWithPlaintext,
  RecordsFilter,
  getRecords,
  importSharedState,
  requestCreateEvent,
  requestSignature,
  useAccount,
} from "@puzzlehq/sdk";
import { useGameStore, type Game } from "@state/gameStore";
import jsyaml from "js-yaml";
//@ts-ignore
import * as parseJson from "json-parse-even-better-errors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { truncateAddress } from "./ConnectWallet";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
//@ts-ignore
import Identicon from "react-identicons";

interface IYourTurn {
  game: Game;
  isFinished: boolean;
}

const filter: RecordsFilter = {
  programIds: [
    "football_game_v014.aleo",
    "puzzle_pieces_v016.aleo",
    "multiparty_pvp_utils_v015_avh.aleo",
  ],
  type: "unspent",
};

type MatchOutcome = {
  address_home: string;
  address_away: string;
  team_id_home: string;
  team_id_away: string;
  goals_home: number;
  goals_away: number;
};

const messageToSign = "Accept Game Challenge"; // TODO replace this by appropriate msg

const YourTurn: React.FC<IYourTurn> = ({ game, isFinished }) => {
  const router = useRouter();
  const { account } = useAccount();

  const user = game.gameNotification.recordData.owner;
  const opponent_address = game.gameNotification.recordData.opponent_address;
  const challenger_address =
    game.gameNotification.recordData.challenger_address;
  const vs = user === opponent_address ? challenger_address : opponent_address;
  const game_id = game.gameNotification.recordData.game_multisig;
  const [matchOutcome, setMatchOutcome] = useState<MatchOutcome>();
  const [setCurrentGame] = useGameStore((state) => [state.setCurrentGame]);

  const wager = game.gameNotification.recordData.total_pot / 2;
  const [
    inputsSubmitWager,
    eventIdSubmit,
    acceptGameInputs,
    setSubmitWagerInputs,
    setEventIdSubmit,
    setStep,
    setAcceptedSelectedTeam,
    initializeAcceptGame,
  ] = useAcceptGameStore((state: any) => [
    state.inputsSubmitWager,
    state.eventIdSubmit,
    state.setAcceptGameInputs,
    state.setSubmitWagerInputs,
    state.setEventIdSubmit,
    state.setStep,
    state.setAcceptedSelectedTeam,
    state.initializeAcceptGame,
  ]);

  const [largestPiece, availableBalance, currentGame] = useGameStore(
    (state) => [state.largestPiece, state.availableBalance, state.currentGame]
  );
  const msAddress = currentGame?.gameNotification.recordData.game_multisig;
  console.log("msAddress", msAddress);
  const { msPuzzleRecords: recordsPuzzle, msGameRecords: recordsGame } =
    useMsRecords(msAddress);
  const [msPuzzleRecords, setMsPuzzleRecords] = useState<
    RecordWithPlaintext[] | undefined
  >();
  const [msGameRecords, setMsGameRecords] = useState<
    RecordWithPlaintext[] | undefined
  >();

  const puzzleRecord =
    availableBalance >= game.gameNotification.recordData.total_pot / 2
      ? largestPiece
      : undefined;

  const [isModal, setIsModal] = useState(false);
  const { loading, error, event, setLoading, setError } = useEventHandling({
    id: eventIdSubmit,
    stepName: "Submit Wager",
  });

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
    if (isFinished) {
      fetchGameOutcomeObject();
    }
  }, []);

  function determineGameOutcome() {
    // Extract the numeric values of goals
    const goalsHome = matchOutcome?.goals_home ?? 0;
    const goalsAway = matchOutcome?.goals_away ?? 0;

    // Determine if the user's team is home or away
    const userIsHome = matchOutcome?.address_home === account?.address;

    // Check if the user's team won, lost, or it was a draw
    if (userIsHome) {
      if (goalsHome > goalsAway) {
        return "You won!";
      } else if (goalsHome < goalsAway) {
        return "You lost.";
      } else {
        return "It's a draw.";
      }
    } else {
      if (goalsAway > goalsHome) {
        return "You won!";
      } else if (goalsAway < goalsHome) {
        return "You lost.";
      } else {
        return "It's a draw.";
      }
    }
  }

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
      (r: any) =>
        r.data.ix === "3u32.private" &&
        r.data.opponent.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address &&
        r.data.staker.replace(".private", "") ===
          currentGame.gameNotification.recordData.opponent_address
    );
    const piece_claim_opponent = msPuzzleRecords.find(
      (r: any) =>
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

  const createSubmitWagerEvent = async () => {
    const key_record = game.utilRecords[0];
    const game_req_notification = game.gameNotification.recordWithPlaintext;
    if (!puzzleRecord || !key_record || !game_req_notification) {
      return;
    }

    setLoading(true);
    setError(undefined);
    const signature = await requestSignature({ message: messageToSign });
    // setConfirmStep(ConfirmStep.Signing);
    if (!signature.messageFields || !signature.signature) {
      setError("Signature or signature message fields not found");
      setLoading(false);
      return;
    }
    // setConfirmStep(ConfirmStep.RequestingEvent);
    const messageFields = Object(jsyaml.load(signature.messageFields));

    const newInputs: Partial<SubmitWagerInputs> = {
      opponent_wager_record: puzzleRecord,
      key_record: key_record,
      game_req_notification: game_req_notification,
      opponent_message_1: messageFields.field_1,
      opponent_message_2: messageFields.field_2,
      opponent_message_3: messageFields.field_3,
      opponent_message_4: messageFields.field_4,
      opponent_message_5: messageFields.field_5,
      opponent_sig: signature.signature,
    };
    const game_multisig_seed = currentGame?.utilRecords?.[0].data.seed ?? "";
    const { data } = await importSharedState(game_multisig_seed);

    setSubmitWagerInputs(newInputs);
    const response = await requestCreateEvent({
      type: EventType.Execute,
      programId: GAME_PROGRAM_ID,
      functionId: GAME_FUNCTIONS.submit_wager,
      fee: transitionFees.submit_wager,
      inputs: Object.values(newInputs),
      address: game_req_notification.owner, // opponent address
    });
    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else if (response.eventId) {
      /// todo - other things here?
      setEventIdSubmit(response.eventId);
      setCurrentGame(game);
      // setSubmitWagerInputs({ ...newInputs }); // TODO  why do we set submit wager inputs after we create the event?
      router.push(
        `/accept-game/${game.gameNotification.recordData.game_multisig}`
      );
    }
  };

  const fetchGameOutcome = async () => {
    try {
      console.log("Fetching game outcome for game_id:", game_id);
      const response = await fetch(
        `https://node.puzzle.online/testnet3/program/football_game_v014.aleo/mapping/game_outcomes/${game_id}`
      );
      const dataText = await response.json(); // Change this to text(), as JSON parsing fails

      console.log("Fetched data:", dataText); // Log the fetched data
      return dataText;
    } catch (error) {
      console.error("There was an error fetching the game outcome:", error);
    }
  };

  // TODO: Use results from fetchGameOutcome as input
  const fetchGameOutcomeObject = async () => {
    try {
      const response = await fetch(
        `https://node.puzzle.online/testnet3/program/football_game_v014.aleo/mapping/game_outcomes/${game_id}`
      );

      const dataText = await response.text(); // Change this to text(), as JSON parsing fails

      console.log("Fetched data:", dataText); // Log the fetched data

      // Convert the dataText string into valid JSON format
      const cleanedDataString = dataText
        .replace(/(\\n|\\)/g, "") // Remove escaped characters and line breaks
        .replace(/'/g, '"') // Replace single quotes with double quotes to make it valid JSON
        .replace(/(\w+)\s*:/g, '"$1":') // Add double quotes around keys
        .replace(/:\s*([\w"]+)/g, ':"$1"'); // Add double quotes around values
      console.log("Cleaned data:", cleanedDataString); // Log the cleaned data
      const cleanedDataStringWithoutQuotes = cleanedDataString.slice(1, -1);
      console.log(
        "🚀 ~ fetchGameOutcome ~ cleanedDataStringWithoutQuotes:",
        cleanedDataStringWithoutQuotes
      );

      const cleanedDataStringTrimmed = cleanedDataStringWithoutQuotes.trim();

      console.log("Cleaned data trimmed:", cleanedDataStringTrimmed);

      // Parse the JSON data into an object
      // const data = JSON.parse(cleanedDataString.toString());
      const data = parseJson(cleanedDataStringTrimmed);
      console.log("Parsed data:", data);

      const matchOutcome = {
        address_home: data.address_home,
        address_away: data.address_away,
        team_id_home: data.team_id_home,
        team_id_away: data.team_id_away,
        goals_home: parseInt(data.goals_home.replace("u64", "")),
        goals_away: parseInt(data.goals_away.replace("u64", "")),
      };

      console.log("goals", matchOutcome.goals_home, matchOutcome.goals_away);
      setMatchOutcome(matchOutcome);

      return data;
      // If you need to access game_outcome later, you can do it after this line
    } catch (error) {
      console.error("There was an error fetching the game outcome:", error);
    }
  };

  // TODO: Complete this
  const createCalculateOutcomeEvent = async () => {
    const reveal_answer_notification_record =
      game.gameNotification.recordWithPlaintext;
    const challenger_answer_record = game.utilRecords.find(
      (r) =>
        r.data.owner.replace(".private", "") ===
        game.gameNotification.recordData.challenger_address
    );
    if (!reveal_answer_notification_record || !challenger_answer_record) {
      return;
    }

    const newInputs: Partial<CalculateOutcomeInputs> = {
      reveal_answer_notification_record: reveal_answer_notification_record, //todo
      challenger_answer_record: challenger_answer_record, // todo
    };

    // setCalculateOutcomeInputs(newInputs);
    const response = await requestCreateEvent({
      type: EventType.Execute,
      programId: GAME_PROGRAM_ID,
      functionId: GAME_FUNCTIONS.calculate_outcome,
      fee: transitionFees.calculate_outcome,
      inputs: Object.values(newInputs),
    });
    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else if (response.eventId) {
      /// todo - other things here?
      setEventIdSubmit(response.eventId);
      setCurrentGame(game);
      // setCalculateOutcomeInputs({ ...newInputs });
      // router.push(`/accept-game/${response.eventId}`);
    }
  };

  const createRevealAnswerEvent = async () => {
    const calculated_outcome_notification_record =
      game.gameNotification.recordWithPlaintext;

    const challenger_claim_signature = game.puzzleRecords.find(
      (r) => r.data.ix.replace(".private", "") === "7u32"
    );

    const challenger_answer_record = game.utilRecords.find(
      (r) =>
        r.data.owner.replace(".private", "") ===
        game.gameNotification.recordData.challenger_address
    );

    const joint_piece_stake = game.puzzleRecords.find(
      (r) => r.data.ix.replace(".private", "") === "10u32"
    );

    const multisig = game.gameNotification.recordData.game_multisig;

    const game_outcome = await fetchGameOutcome();

    if (
      !calculated_outcome_notification_record ||
      !challenger_answer_record ||
      !joint_piece_stake ||
      !challenger_claim_signature ||
      !game_outcome
    ) {
      return;
    }

    const newInputs: Partial<RevealAnswerInputs> = {
      challenger_claim_signature: challenger_claim_signature,
      calculated_outcome_notification_record:
        calculated_outcome_notification_record,
      joint_piece_state: joint_piece_stake,
      challenger_answer_record: challenger_answer_record,
      game_outcome: game_outcome,
    };

    // setCalculateOutcomeInputs(newInputs);
    const response = await requestCreateEvent({
      type: EventType.Execute,
      programId: GAME_PROGRAM_ID,
      functionId: GAME_FUNCTIONS.reveal_answer,
      fee: transitionFees.reveal_answer,
      inputs: Object.values(newInputs),
    });
    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else if (response.eventId) {
      /// todo - other things here?
      setEventIdSubmit(response.eventId);
      setCurrentGame(game);
      // setCalculateOutcomeInputs({ ...newInputs });
      // router.push(`/accept-game/${response.eventId}`);
    }
  };

  const createFinishGameEvent = async () => {
    console.log("createFinishGameEvent");
    console.log("game", game);
    console.log("msPuzzleRecords", msPuzzleRecords);
    console.log("msGameRecords", msGameRecords);

    if (!game || !msPuzzleRecords || !msGameRecords) return;

    const game_record = msGameRecords[0];

    const joint_piece_winner = msPuzzleRecords.find(
      (r) => r.data.ix === "12u32.private"
    );
    const piece_joint_stake = msPuzzleRecords.find(
      (r) => r.data.ix === "9u32.private"
    );
    const joint_piece_time_claim = msPuzzleRecords.find(
      (r) => r.data.ix === "8u32.private"
    );

    console.log("game_record", game_record);
    console.log("joint_piece_winner", joint_piece_winner);
    console.log("piece_joint_stake", piece_joint_stake);
    console.log("joint_piece_time_claim", joint_piece_time_claim);

    if (
      !game_record ||
      !joint_piece_winner ||
      !piece_joint_stake ||
      !joint_piece_time_claim
    ) {
      return;
    }

    const newInputs: Partial<FinishGameInputs> = {
      game_record: game_record,
      joint_piece_winner: joint_piece_winner,
      piece_joint_stake: piece_joint_stake,
      joint_piece_time_claim: joint_piece_time_claim,
    };

    // setCalculateOutcomeInputs(newInputs);
    const response = await requestCreateEvent({
      type: EventType.Execute,
      programId: GAME_PROGRAM_ID,
      functionId: GAME_FUNCTIONS.finish_game,
      fee: transitionFees.finish_game,
      inputs: Object.values(newInputs),
      address: game_record.owner, // opponent address
    });
    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else if (response.eventId) {
      /// todo - other things here?
      setEventIdSubmit(response.eventId);
      setCurrentGame(game);
    }
  };

  const renderActionButton = () => {
    switch (game.gameAction) {
      case "Submit Wager":
        // return <SubmitWagerButton game={game} />;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setCurrentGame(game);
                  setIsModal(true);
                }}
                variant="outline"
                className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
              >
                Submit wager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="flex gap-1 w-full flex-col justify-center items-center">
                <DialogTitle className=" tracking-lighter dark:text-white  text-[#25292e] text-[18px] ">
                  Would you like to accept the challenge from{" "}
                  <span className="font-extrabold"> {truncateAddress(vs)}</span>{" "}
                  for <span className="font-extrabold">{wager}</span> pieces?
                </DialogTitle>

                <DialogDescription></DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-4 mt-2 text-center w-full items-center">
                <Button
                  disabled={loading}
                  onClick={createSubmitWagerEvent}
                  variant="outline"
                  className="flex flex-col gap-1 hover:text-white dark:hover:bg-[#dbe0e5]  bg-[#fafafa]   h-fit justify-center items-center"
                >
                  <span className="text-xs font-semibold text-black">
                    Submit
                  </span>{" "}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case "Accept":
        // return <AcceptGameButton game={game} />;
        return (
          <Button
            disabled={loading}
            onClick={() => {
              setCurrentGame(game);
              router.push(
                `/accept-game/${game.gameNotification.recordData.game_multisig}`
              );
            }}
            variant="outline"
            className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
          >
            Accept
          </Button>
        );
      case "Calculate":
        return (
          <Button
            onClick={createCalculateOutcomeEvent} // TODO implement a simple wallet popup that consumes 2 records.
            variant="outline"
            className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
          >
            Calculate Outcome
          </Button>
        );
      case "Reveal":
        return (
          <Button
            onClick={createRevealAnswerEvent} // TODO implement a simple wallet popup that consumes 2 records.
            variant="outline"
            className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
          >
            Reveal outcome
          </Button>
        );

      case "Lose":
        return (
          <Button
            variant="outline"
            className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
          >
            Lose
          </Button>
        );

      case "Claim":
        return (
          <Button
            onClick={() => {
              console.log("click claim");
              setCurrentGame(game);
              console.log("click claim game", game);
              createFinishGameEvent();
            }}
            variant="outline"
            className="tracking-wider text-sm text-black dark:text-white font-semibold flex gap-2.5"
          >
            Claim
          </Button>
        );
    }
  };
  return (
    // <div className="mb-2 grid w-full grid-cols-[1fr,auto,1fr] items-center gap-5">
    //   <div className="my-auto self-center text-left text-xs font-bold tracking-tight text-primary-pink max-sm:ml-2">
    //     {truncateAddress(vs)}
    //   </div>
    //   <div className="my-auto self-center text-left text-xs font-bold tracking-tight text-primary-pink max-sm:ml-2">
    //     {wager} pieces
    //   </div>
    //   <div className="flex justify-end">{renderActionButton()}</div>
    // </div>
    <Card className="  w-52 grid-span-1 shadow-lg rounded-xl overflow-hidden">
      <div className="flex flex-col gap-4 justify-center items-center  p-6  sm:space-y-0">
        {/* <div className="flex w-full flex-col justify-between">
          <div>
            <Identicon string={truncateAddress(vs)} size={36} />

            <span className="font-semibold text-lg text-center">
              Challenger: <strong>{truncateAddress(vs)}</strong>
            </span>
          </div>
        </div> */}
        <div className="flex flex-col gap-2.5 items-center ">
          {/* Game id= multisig address */}

          <Identicon string={truncateAddress(vs)} size={36} />
          <span className="font-bold text-lg text-center">
            {truncateAddress(vs)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Challenged you
          </span>
          <span className=" text-sm text-center text-gray-600">
            Game id: {truncateAddress(game_id)}
          </span>
        </div>

        <div className="flex flex-col text-center w-full items-center justify-center">
          <div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              {isFinished && (
                <div className="flex flex-col">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Outcome: <strong>{matchOutcome?.goals_home}</strong> -{" "}
                    <strong>{matchOutcome?.goals_away}</strong>
                  </p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {determineGameOutcome()}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Amount: <strong>{wager}</strong>
              </p>
            </div>
          </div>

          {renderActionButton()}
        </div>
        {/* <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Refree: Pierluigi Webb
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Stadium: Wembley, London
      </p>
    </div> */}
      </div>
      {/* <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-700">
      <Button className="w-full" variant="outline">
        {game.state === "completed" ? "View Match Statistics" : "Play"}
      </Button>
    </div> */}
    </Card>
  );
};
export default YourTurn;
