"use client";

import Image from "next/image";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface IPlayerDetails {}

const data = [
  {
    attribute: "Attack",
    A: 86,
    fullMark: 100,
  },
  {
    attribute: "Defense",
    A: 98,
    fullMark: 100,
  },
  {
    attribute: "Speed",
    A: 86,
    fullMark: 100,
  },
  {
    attribute: "Power",
    A: 85,
    fullMark: 100,
  },
  {
    attribute: "Technique",
    A: 65,
    fullMark: 100,
  },
  {
    attribute: "Stamina",
    A: 55,
    fullMark: 100,
  },
];

const PlayerDetails: React.FC<IPlayerDetails> = ({}) => {
  return (
    <Card className="flex items-center py-4 max-w-xs mx-auto bg-white rounded-xl shadow-md overflow-hidden ">
      <div className="md:flex-shrink-0">
        <Image
          alt="Player image"
          className="h-36 w-24 object-cover md:w-48"
          height="100"
          src="/player_c.png"
          style={{
            aspectRatio: "100/100",
            objectFit: "contain",
          }}
          width="50"
        />
      </div>
      <div className="flex flex-col">
        <div className="p-8">
          <CardTitle className="uppercase whitespace-nowrap tracking-wide text-sm text-gray-500 font-semibold">
            John Doe
          </CardTitle>
          <CardDescription className="block mt-1 text-lg leading-tight font-medium text-black">
            ST/CF
          </CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Player Details</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Player Details</DialogTitle>
              {/* <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription> */}
            </DialogHeader>
            <div className=" w-full h-[200px]  rounded">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="attribute" />
                  <Tooltip />
                  <Radar
                    name="Team"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.75}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <DialogFooter>
              {/* <Button type="submit">Save changes</Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
export default PlayerDetails;
