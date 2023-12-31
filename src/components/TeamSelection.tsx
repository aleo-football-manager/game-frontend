"use client";
import { teams } from "@/utils/team-data";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
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
  defense: number;
  image: string;
  foundingYear: number;
  coach: string;
  colors: string[];
  achievements: string[];
  fanbase: string;
};

function getRandomNumber(): number {
  return Math.floor(Math.random() * 1000) + 1;
}

const TeamSelection: React.FC<ITeamSelection> = ({
  selectedTeam,
  setSelectedTeam,
  setIsGameStarted,
}) => {
  const [bet, setBet] = useState(1);
  const swiperRef = useRef<any>();

  console.log("bet", bet);

  return (
    <div className="flex flex-col h-fit items-center gap-16 mt-16 justify-around ">
      <Swiper
        onSnapIndexChange={
          (newIndex) =>
            setSelectedTeam(newIndex.activeIndex) /* or set to state */
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
        className="mySwiper h-full"
      >
        {/* {artists.map((artist) => (
          <SwiperSlide key={artist.id} className={SwiperSlideClass}>
            <FeaturedEventCard artist={artist} />
          </SwiperSlide>
        ))} */}
        {teams.map((team, index) => {
          console.log("teams", team);
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Game</DialogTitle>
            <DialogDescription>
              Enter how much you are wagering for the game
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 relative items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
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
            <div className="relative">
              <Slider
                className="mt-6"
                onValueChange={(e) => setBet(e[0])}
                defaultValue={[100]}
                value={[bet]}
                min={0}
                max={1000}
                step={10}
              />

              {/* <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-[26%] -translate-x-1/2 rtl:translate-x-1/2  -bottom-7">
                250
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-7">
                500
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 absolute start-3/4 -translate-x-1/2 rtl:translate-x-1/2 -bottom-7">
                750
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-7">
                1000
              </span> */}
            </div>
          </div>
          <div className="flex justify-around  items-center ">
            <Button
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
            </Button>
            <Button
              onClick={() => setIsGameStarted(true)}
              variant={"outline"}
              type="submit"
            >
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default TeamSelection;
