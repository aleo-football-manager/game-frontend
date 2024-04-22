import {
  EventType,
  EventsFilter,
  GetEventsResponse,
  getEvents,
} from "@puzzlehq/sdk";

import {
  GAME_PROGRAM_ID,
} from "@/app/state/manager";

export const getPositionRole = (positionCode: number): string => {
  switch (positionCode) {
    case 1:
      return "GK";
    case 2:
      return "DEF";
    case 3:
      return "MID";
    case 4:
      return "ATT";
    default:
      return "UNK";
  }
};

export const isValidPlacement = (playerPosition: string, gridIndex: number) => {
  if (playerPosition === "GK" && gridIndex !== 0) {
    return false;
  } else if (playerPosition === "DEF" && gridIndex !== 1) {
    return false;
  } else if (playerPosition === "MID" && gridIndex !== 2) {
    return false;
  } else if (playerPosition === "ATT" && gridIndex !== 3) {
    return false;
  }

  return true;
};

// todo: update this to map 1:1
export const calculateAttributebute = (value: number | string): number => {
  // Check if the value is within the specified range
  const parsedValue = Number(value);

  if (parsedValue < 0 || parsedValue > 255) {
    throw new Error("Value is outside the specified range.");
  }
  // TODO: mapping not needed anyore since its normalized now
  // Perform the linear mapping
  const fromRange = 99 - 0;
  const toRange = 99 - 0;

  const scaledValue = (parsedValue - 0) * (toRange / fromRange) + 0;

  // Round the result to the nearest integer
  return Math.round(scaledValue);
};
export const getAllPuzzleWalletEvents = async () => {
  const filter: EventsFilter = {
    type: EventType.Execute,
    programId: GAME_PROGRAM_ID,
  };
  const events: GetEventsResponse = await getEvents(filter);
  return events.events;
};

export const getTeamName = (id: string) => {
  switch (id) {
    case "1":
      return "a";
    case "2":
      return "b";
    case "3":
      return "c";
    case "4":
      return "d";
    case "5":
      return "e";
    case "6":
      return "f";
    default:
      return "Unknown";
  }
};
