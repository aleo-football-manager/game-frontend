"use client";
import { Step, useAcceptGameStore } from "@/app/accept-game/store";
import { useGameStore } from "@/app/state/gameStore";
import { transitionFees } from "@/app/state/manager";
import { useEventHandling } from "@/hooks/eventHandling";
import { useMsRecords } from "@/hooks/msRecords";
import { teams } from "@/utils/team-data";
import {
  EventType,
  RecordsFilter,
  getRecords,
  requestCreateEvent,
  useAccount,
  zodAddress,
} from "@puzzlehq/sdk";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CiCircleRemove } from "react-icons/ci";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { z } from "zod";
import { useNewGameStore } from "../app/create-game/store";
import { truncateAddress } from "./ConnectWallet";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
interface ITeamSelection {
  setSelectedTeam: (val: number) => void;
  setIsGameStarted: (val: boolean) => void;
  selectedTeam: number;
  isChallenged: boolean;
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
  isChallenged,
}) => {
  const [bet, setBet] = useState(1);
  const [opponent, setOpponent] = useState("");
  const swiperRef = useRef<any>();
  const [opponentError, setOpponentError] = useState<string | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  // const [isChallenged, setIsChallenged] = useState(false);
  const { account } = useAccount();
  const { setInputs, inputs } = useNewGameStore();
  const [savedOpponents, setSavedOpponents] = useLocalStorage("opponents", []);
  const [availableBalance, largestPiece, currentGame] = useGameStore(
    (state) => [state.availableBalance, state.largestPiece, state.currentGame]
  );
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
    programIds: [
      "football_game_v014.aleo",
      "puzzle_pieces_v016.aleo",
      "multiparty_pvp_utils_v015_avh.aleo",
    ],
  };
  useEffect(() => {
    const response = async () => {
      const record = await getRecords({
        filter,
        // address: account?.address,
      });

      return record;
    };
    response();
  }, [account]);

  const handleOpponentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpponent(e.target.value);
  };
  useEffect(() => {
    const wagerAmountResult = wagerAmountSchema.safeParse(bet);
    const opponentResult = opponentSchema.safeParse(opponent);

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
      //@ts-ignore
      setSavedOpponents((prevState: string[]) => {
        if (!prevState.includes(opponentResult.data)) {
          return [...prevState, opponentResult.data];
        } else {
          return prevState;
        }
      });
      setInputs({
        challenger_wager_amount: wagerAmountResult.data.toString(),
        opponent: opponentResult.data,
        wager_record: largestPiece,
      });
    }
  }, [bet, opponent]);

  const getPuzzlePieces = async () => {
    setLoading(true);
    try {
      const response = await requestCreateEvent({
        type: EventType.Execute,
        programId: "puzzle_pieces_v016.aleo",
        functionId: "mint_private",
        fee: transitionFees.submit_wager,
        inputs: Object.values({
          amount: "1000u64",
          address: account?.address!,
        }),
        address: account?.address,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // const createSubmitWagerEvent = async () => {
  //   if (
  //     !acceptGameInputs?.opponent_wager_record ||
  //     !acceptGameInputs.key_record ||
  //     !acceptGameInputs.game_req_notification
  //   ) {
  //     return;
  //   }
  //   setLoading(true);
  //   setError(undefined);
  //   const signature = await requestSignature({ message: messageToSign });
  //   setConfirmStep(ConfirmStep.Signing);
  //   if (!signature.messageFields || !signature.signature) {
  //     setError("Signature or signature message fields not found");
  //     setLoading(false);
  //     return;
  //   }
  //   setConfirmStep(ConfirmStep.RequestingEvent);
  //   const messageFields = Object(jsyaml.load(signature.messageFields));

  //   const newInputs: Partial<SubmitWagerInputs> = {
  //     opponent_wager_record: inputsSubmitWager.opponent_wager_record,
  //     key_record: inputsSubmitWager.key_record,
  //     game_req_notification: inputsSubmitWager.game_req_notification,
  //     opponent_message_1: messageFields.field_1,
  //     opponent_message_2: messageFields.field_2,
  //     opponent_message_3: messageFields.field_3,
  //     opponent_message_4: messageFields.field_4,
  //     opponent_message_5: messageFields.field_5,
  //     opponent_sig: signature.signature,
  //   };
  //   const game_multisig_seed = currentGame?.utilRecords?.[0].data.seed ?? "";
  //   const { data } = await importSharedState(game_multisig_seed);

  //   setSubmitWagerInputs(newInputs);
  //   const response = await requestCreateEvent({
  //     type: EventType.Execute,
  //     programId: GAME_PROGRAM_ID,
  //     functionId: GAME_FUNCTIONS.submit_wager,
  //     fee: transitionFees.submit_wager,
  //     inputs: Object.values(newInputs),
  //     address: acceptGameInputs.game_req_notification.owner, // opponent address
  //   });
  //   if (response.error) {
  //     setError(response.error);
  //     setLoading(false);
  //   } else if (response.eventId) {
  //     /// todo - other things here?
  //     setEventIdSubmit(response.eventId);
  //     setSubmitWagerInputs({ ...newInputs });
  //     router.push(`/accept-game/${response.eventId}`);
  //   }
  // };

  // useEffect(() => {
  //   if (
  //     acceptGameInputs?.opponent_wager_record ||
  //     acceptGameInputs.key_record ||
  //     acceptGameInputs.game_req_notification
  //   ) {
  //     setIsChallenged(true);
  //   } else {
  //     setIsChallenged(false);
  //   }
  // }, [account]);

  const getButtonFillPercentage = () => {
    return (bet / availableBalance) * 100;
  };

  const variants = {
    initial: {
      background:
        "linear-gradient(to right, #32a852 0%, #32a852 0%, transparent 0%)",
    },
    animate: {
      background: `linear-gradient(to right, #32a852 0%, #32a852 ${getButtonFillPercentage()}%, transparent ${getButtonFillPercentage()}%)`,
      // transition: { duration: 0.5 },
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        ease: "easeInOut",
      },
    },
  };

  const handleStartGame = () => {
    if (!isChallenged) {
      if (bet <= 0) {
        toast.error("Wager can't be equal to or lower than 0");
        return;
      }
      if (opponentError) {
        toast.error("Please select an opponent");
        return;
      }
      if (account?.address && bet <= availableBalance) {
        setIsGameStarted(true);
      } else {
        toast.info("Please connect your Puzzle Wallet to play");
        return;
      }
    } else {
      if (account?.address) {
        setIsGameStarted(true);
      } else {
        toast.info("Please connect your Puzzle Wallet to play");
        return;
      }
    }
  };

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
        className="mySwiper max-w-[320px] md:max-w-2xl h-fit lg:max-w-3xl lg:h-full"
      >
        {/* {artists.map((artist) => (
          <SwiperSlide key={artist.id} className={SwiperSlideClass}>
            <FeaturedEventCard artist={artist} />
          </SwiperSlide>
        ))} */}
        {teams.map((team, index) => {
          return (
            <SwiperSlide
              key={team.name}
              className="max-w-fit max-md:max-w-[320px]  min-h-full flex flex-col gap-8 items-center justify-center rounded-3xl font-bold"
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
      <div className="w-full max-w-5xl absolute top-[45%] flex justify-between">
        <div className="   ">
          <Button
            size={"icon"}
            className="rounded-full"
            variant={"ghost"}
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={selectedTeam === 0}
            title="Previous"
          >
            <FaChevronLeft size={24} />
          </Button>
        </div>
        <div className="   ">
          <Button
            size={"icon"}
            className="rounded-full"
            variant={"ghost"}
            disabled={selectedTeam === teams.length - 1}
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
      </div>
      {!isChallenged ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Pick Team</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Game</DialogTitle>
              <DialogDescription>
                Enter your opponent&apos;s Aleo address and how much you are
                wagering for the game
              </DialogDescription>
            </DialogHeader>
            <div className="relative">
              <Input
                type="text"
                value={opponent}
                onChange={(e) => handleOpponentChange(e)}
                placeholder="Opponent address"
                className="w-full fill-input"
              />
              <span
                onClick={() => setOpponent("")}
                className="absolute px-1 cursor-pointer backdrop-blur-3xl right-1 top-1/4"
              >
                <CiCircleRemove className="h-5 w-5 " />
              </span>
            </div>
            {savedOpponents?.length! > 0 && opponent === "" && (
              <Select
                onValueChange={(value) => {
                  console.log("value", value);
                  setOpponent(value);
                }}

                // defaultValue="4-4-2"
              >
                <SelectTrigger className="w-full ">
                  <SelectValue
                    className=""
                    placeholder="Select from previous opponents"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Previous Opponents</SelectLabel>
                    {savedOpponents?.map((opponent) => {
                      return (
                        <SelectItem key={crypto.randomUUID()} value={opponent}>
                          {truncateAddress(opponent)}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (isNaN(parseFloat(e.currentTarget.value))) {
                      setBet(0);
                    } else {
                      setBet(parseInt(e.currentTarget.value));
                    }
                  }}
                  className="col-span-3 outline-none  ring-offset-0"
                  value={bet}
                />
                <p className="absolute text-xl tracking-tighter right-4">
                  {/* Puzzle Token */}
                  &#129513;
                </p>
              </div>
              {betError && <p className="text-red-500 text-sm">{betError}</p>}
              {availableBalance === 0 ? (
                <div className="flex flex-col gap-4 -mb-6 items-center justify-center text-center w-full tracking-tight">
                  <p className="text-red-500 text-sm">
                    You need puzzle pieces to play the game
                  </p>
                  <Button
                    disabled={loading}
                    onClick={getPuzzlePieces}
                    className="w-32"
                    variant={"outline"}
                  >
                    Mint Pieces
                  </Button>
                </div>
              ) : (
                <div className="relative flex flex-col">
                  <Slider
                    className="mt-6"
                    onValueChange={(e) => setBet(e[0])}
                    defaultValue={[100]}
                    value={[bet]}
                    min={0}
                    max={availableBalance}
                    step={1}
                  />
                  <div className="w-full mt-0.5 flex justify-between py-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 ">
                      0
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ">
                      {availableBalance}
                    </span>
                  </div>
                  <motion.div
                    className={`w-full   flex rounded-lg border my-2`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                  >
                    {/* <div
                      className={`w-96 absolute  z-20`}
                    ></div> */}

                    <Button
                      onClick={() => setBet(Math.floor(availableBalance / 4))}
                      variant={"ghost"}
                      className={`w-1/4 hover:bg-transparent border-r-2 rounded-none border-dashed border-opacity-5 tracking-tighter`}
                    >
                      25%
                    </Button>
                    <Button
                      onClick={() => setBet(Math.floor(availableBalance / 2))}
                      variant={"ghost"}
                      className={`w-1/4 hover:bg-transparent border-r-2 rounded-none border-dashed border-opacity-5 tracking-tighter`}
                    >
                      50%
                    </Button>
                    <Button
                      onClick={() =>
                        setBet(Math.floor((availableBalance / 4) * 3))
                      }
                      variant={"ghost"}
                      className={`w-1/4 hover:bg-transparent border-r-2 rounded-none border-dashed border-opacity-5 tracking-tighter`}
                    >
                      75%
                    </Button>
                    <Button
                      onClick={() => setBet(availableBalance)}
                      variant={"ghost"}
                      className={`w-1/4 hover:bg-transparent  tracking-tighter`}
                    >
                      100%
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
            <div className="flex w-full justify-center  items-center ">
              {availableBalance !== 0 && (
                <Button
                  onClick={handleStartGame}
                  className="w-full"
                  variant={"outline"}
                  type="submit"
                >
                  Start Game
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Button
          onClick={handleStartGame}
          className="w-36"
          variant={"outline"}
          type="submit"
        >
          Start Game
        </Button>
      )}
    </div>
  );
};
export default TeamSelection;
