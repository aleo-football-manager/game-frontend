"use client";
import { Step, useAcceptGameStore } from "@/app/accept-game/store";
import { useGameStore } from "@/app/state/gameStore";
import {
  GAME_FUNCTIONS,
  GAME_PROGRAM_ID,
  SubmitWagerInputs,
  transitionFees,
} from "@/app/state/manager";
import { useEventHandling } from "@/hooks/eventHandling";
import { useMsRecords } from "@/hooks/msRecords";
import { teams } from "@/utils/team-data";
import {
  EventType,
  RecordsFilter,
  getRecords,
  importSharedState,
  requestCreateEvent,
  requestSignature,
  useAccount,
  zodAddress,
} from "@puzzlehq/sdk";
import jsyaml from "js-yaml";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { z } from "zod";
import { useNewGameStore } from "../app/create-game/store";
import TeamCard from "./TeamCard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
interface ITeamSelection {
  setSelectedTeam: (val: number) => void;
  setIsGameStarted: (val: boolean) => void;
  selectedTeam: number;
  // startGame: () => void;
}

type Team = {
  name: string;
  attack: number;
  // midfield: number;
  defense: number;
  image: string;
  foundingYear: number;
  coach: string;
  colors: string[];
  achievements: string[];
  fanbase: string;
};
enum ConfirmStep {
  Signing,
  RequestingEvent,
}

const messageToSign = "1234567field"; // TODO?

const opponentSchema = zodAddress;
const wagerAmountSchema = z
  .number()
  .refine(
    (value) => !isNaN(Number(value)),
    "Wager amount must be a valid number"
  )
  .refine(
    (value) => Number(value) >= 0 && Number(value) <= 1000, // TODO change this to availableBalance?
    "Wager amount must be between 0 and 1000"
  );

const TeamSelection: React.FC<ITeamSelection> = ({
  selectedTeam,
  setSelectedTeam,
  setIsGameStarted,
}) => {
  const [bet, setBet] = useState(1);
  const [opponent, setOpponent] = useState("");
  const swiperRef = useRef<any>();
  const [opponentError, setOpponentError] = useState<string | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  const [isChallenged, setIsChallenged] = useState(false);
  const { account } = useAccount();
  const { setInputs, inputs } = useNewGameStore();
  const [availableBalance, largestPiece, currentGame] = useGameStore(
    (state) => [state.availableBalance, state.largestPiece, state.currentGame]
  );
  console.log("🚀 ~ currentGame:", currentGame, availableBalance, largestPiece);
  const [
    inputsSubmitWager,
    eventIdSubmit,
    acceptGameInputs,
    setSubmitWagerInputs,
    setEventIdSubmit,
    setStep,
    setAcceptedSelectedTeam,
  ] = useAcceptGameStore((state: any) => [
    state.inputsSubmitWager,
    state.eventIdSubmit,
    state.setAcceptGameInputs,
    state.setSubmitWagerInputs,
    state.setEventIdSubmit,
    state.setStep,
    state.setAcceptedSelectedTeam,
  ]);
  console.log("🚀 ~ inputsSubmitWager:", eventIdSubmit, acceptGameInputs);

  const msAddress = currentGame?.gameNotification.recordData.game_multisig;
  const { msPuzzleRecords, msGameRecords } = useMsRecords(msAddress);
  const [confirmStep, setConfirmStep] = useState(ConfirmStep.Signing);
  const router = useRouter();
  const { loading, error, event, setLoading, setError } = useEventHandling({
    id: eventIdSubmit,
    stepName: "Submit Wager",
    onSettled: () => setStep(Step._02_AcceptGame),
  });
  const filter: RecordsFilter = {
    type: "unspent",
  };
  useEffect(() => {
    const response = async () => {
      const record = await getRecords({
        filter,
        address: account?.address,
      });
      console.log("🚀 ~ response ~ response:", record);

      return record;
    };
    response();
  }, [account]);

  console.log("🚀 ~ availableBalance:", availableBalance);
  console.log("🚀 ~ largestPiece:", largestPiece);

  const handleOpponentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpponent(e.target.value);
  };
  useEffect(() => {
    const wagerAmountResult = wagerAmountSchema.safeParse(bet);
    console.log("🚀 ~ useEffect ~ wagerAmountResult:", wagerAmountResult);
    const opponentResult = opponentSchema.safeParse(opponent);
    console.log("🚀 ~ useEffect ~ opponentResult:", opponentResult);

    if (!wagerAmountResult.success) {
      setBetError("Wager amount must be a valid number");
    } else {
      setBetError(null);
    }

    if (!opponentResult.success) {
      setOpponentError("Opponent address must be valid aleo account");
    } else {
      setOpponentError(null);
    }

    // Update inputs only if both values are valid
    if (wagerAmountResult.success && opponentResult.success) {
      setInputs({
        challenger_wager_amount: wagerAmountResult.data.toString(),
        opponent: opponentResult.data,
        wager_record: largestPiece,
      });
    }
  }, [bet, opponent]);

  const createSubmitWagerEvent = async () => {
    if (
      !acceptGameInputs?.opponent_wager_record ||
      !acceptGameInputs.key_record ||
      !acceptGameInputs.game_req_notification
    ) {
      return;
    }
    setLoading(true);
    setError(undefined);
    const signature = await requestSignature({ message: messageToSign });
    setConfirmStep(ConfirmStep.Signing);
    if (!signature.messageFields || !signature.signature) {
      setError("Signature or signature message fields not found");
      setLoading(false);
      return;
    }
    setConfirmStep(ConfirmStep.RequestingEvent);
    const messageFields = Object(jsyaml.load(signature.messageFields));

    const newInputs: Partial<SubmitWagerInputs> = {
      opponent_wager_record: inputsSubmitWager.opponent_wager_record,
      key_record: inputsSubmitWager.key_record,
      game_req_notification: inputsSubmitWager.game_req_notification,
      opponent_message_1: messageFields.field_1,
      opponent_message_2: messageFields.field_2,
      opponent_message_3: messageFields.field_3,
      opponent_message_4: messageFields.field_4,
      opponent_message_5: messageFields.field_5,
      opponent_sig: signature.signature,
    };
    const game_multisig_seed = currentGame?.utilRecords?.[0].data.seed ?? "";
    console.log("game_multisig seed", game_multisig_seed);
    const { data } = await importSharedState(game_multisig_seed);
    console.log(`Shared state imported: ${data?.address}`);

    setSubmitWagerInputs(newInputs);
    const response = await requestCreateEvent({
      type: EventType.Execute,
      programId: GAME_PROGRAM_ID,
      functionId: GAME_FUNCTIONS.submit_wager,
      fee: transitionFees.submit_wager,
      inputs: Object.values(newInputs),
      address: acceptGameInputs.game_req_notification.owner, // opponent address
    });
    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else if (response.eventId) {
      /// todo - other things here?
      setEventIdSubmit(response.eventId);
      setSubmitWagerInputs({ ...newInputs });
      router.push(`/accept-game/${response.eventId}`);
    }
  };

  useEffect(() => {
    if (
      acceptGameInputs?.opponent_wager_record ||
      acceptGameInputs.key_record ||
      acceptGameInputs.game_req_notification
    ) {
      setIsChallenged(true);
    } else {
      setIsChallenged(false);
    }
  }, [account]);

  console.log(
    "acceptgame",
    acceptGameInputs.game_req_notification,
    acceptGameInputs?.opponent_wager_record,
    acceptGameInputs.key_record
  );

  const handleStartGame = () => {
    if (account?.address) {
      setIsGameStarted(true);
    } else {
      toast.info("Please connect your Puzzle Wallet to play");
    }
  };

  console.log("bet", bet, inputs);

  return (
    <div className="flex flex-col h-fit  items-center gap-16 mt-16 justify-around ">
      <Swiper
        onSnapIndexChange={
          (newIndex) => {
            setSelectedTeam(newIndex.activeIndex);
            setAcceptedSelectedTeam(newIndex.activeIndex);
          }
          /* or set to state */
        }
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 300,
          modifier: 1,
          slideShadows: false,
          //   scale: 0.9,
        }}
        direction="horizontal"
        navigation={{
          nextEl: "swiper-button-prev",
          prevEl: "swiper-button-next",
        }}
        initialSlide={teams.length / 2}
        // navigation={true}
        modules={[EffectCoverflow, Navigation]}
        className="mySwiper max-w-md h-fit lg:max-w-3xl lg:h-full"
      >
        {/* {artists.map((artist) => (
          <SwiperSlide key={artist.id} className={SwiperSlideClass}>
            <FeaturedEventCard artist={artist} />
          </SwiperSlide>
        ))} */}
        {teams.map((team, index) => {
          // console.log("teams", team);
          return (
            <SwiperSlide
              key={team.name}
              className="max-w-fit flex flex-col gap-8 items-center justify-center rounded-3xl font-bold"
            >
              <TeamCard
                key={team.name}
                index={index}
                selectedTeam={selectedTeam}
                team={team}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="hidden sm:block  absolute top-[45%]  left-48">
        <Button
          size={"icon"}
          className="rounded-full"
          variant={"ghost"}
          onClick={() => swiperRef.current?.slidePrev()}
          title="Previous"
        >
          <FaChevronLeft size={24} />
        </Button>
      </div>
      <div className="hidden sm:block  absolute top-[45%]  right-48">
        <Button
          size={"icon"}
          className="rounded-full"
          variant={"ghost"}
          onClick={() => {
            swiperRef.current?.slideNext();
          }}
          title="Next"
        >
          {" "}
          <FaChevronRight size={24} />
        </Button>
        {/* <div className="flex flex-row gap-1"> */}
        {/* </div> */}

      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Pick Team</Button>
        </DialogTrigger>
        {isChallenged ? (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Game</DialogTitle>
              <DialogDescription>
                You have been challenged to a game
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full gap-2 justify-center  items-center ">
              <Button
                onClick={createSubmitWagerEvent}
                className="w-full"
                variant={"outline"}
              >
                Accept
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="w-full"
                variant={"outline"}
              >
                Reject
              </Button>
            </div>
          </DialogContent>
        ) : (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Game</DialogTitle>
              <DialogDescription>
                Enter your opponent&apos;s Aleo address and how much you are wagering for the game
              </DialogDescription>
            </DialogHeader>
            <Input
              type="text"
              onChange={(e) => handleOpponentChange(e)}
              placeholder="Opponent address"
            />
            {opponentError && (
              <p className="text-red-500 text-sm">{opponentError}</p>
            )}
            <div className="grid gap-4 py-4">
              <div className="flex w-full relative items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Wager
                </Label>
                <Input
                  id="amount"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBet(parseInt(e.currentTarget.value))
                  }
                  className="col-span-3 outline-none  ring-offset-0"
                  value={bet}
                />
                <p className="absolute text-xs tracking-tighter right-4">
                  Puzzle Token
                </p>
              </div>
              {betError && <p className="text-red-500 text-sm">{betError}</p>}
              <div className="relative">
                <Slider
                  className="mt-6"
                  onValueChange={(e) => setBet(e[0])}
                  defaultValue={[100]}
                  value={[bet]}
                  min={0}
                  max={availableBalance}
                  step={1}
                />
                {/* Min label */}
                <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-7">
                  0
                </span>
                {/* Max label */}
                <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-7">
                  {availableBalance}
                </span>
              </div>
            </div>
            <div className="flex w-full justify-center  items-center ">
              {/* <Button
              variant="outline"
              className="relative w-48 overflow-hidden bg-gradient-to-r from-blue-300 via-fuchsia-400 to-yellow-600"
              onClick={() => {
                const number = getRandomNumber();
                setBet(number);
              }}
            >
              <motion.span
                layout
                initial={{
                  x: Math.random() * 100 - 50, // Random initial x position between -50 and 50
                  y: Math.random() * 60 - 30, // Random initial y position between -30 and 30
                }}
                animate={{
                  x: Math.random() * 100 - 50, // Random destination x position between -50 and 50
                  y: Math.random() * 60 - 30, // Random destination y position between -30 and 30
                  z: Math.random(),
                }}
                className="absolute  bg-clip-text bg-transparent"
                transition={{
                  repeatType: "reverse",
                  repeat: Infinity,
                  duration: 2,
                }}
              >
                Feeling Lucky!
              </motion.span>
            </Button> */}
              <Button
                onClick={handleStartGame}
                className="w-full"
                variant={"outline"}
                type="submit"
              >
                Start Game
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
export default TeamSelection;
