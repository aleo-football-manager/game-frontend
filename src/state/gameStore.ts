import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RecordWithPlaintext } from '@puzzlehq/sdk';
import {
  GameAction,
  GameNotification,
  GameState,
  getGameAction,
  getGameState,
  parseGameRecord,
} from './RecordTypes/football_game';

const parsePuzzlePieces = (records: RecordWithPlaintext[]) => {
  if (records.length > 0) {
    let availableBalance = 0;
    let largestPiece = records[0];
    const totalBalance = records
      .filter((record) => !record.spent)
      .map((record) => {
        const amount = record.data?.amount?.replace('u64.private', '');
        if (amount && record.data?.ix === '0u32.private') {
          /// find largestPiece (and thus availableBalance)
          const amountInt = parseInt(amount);
          availableBalance = Math.max(availableBalance, amountInt);
          if (availableBalance == amountInt) {
            largestPiece = record;
          }
          return amountInt;
        }
        return 0;
      })
      .reduce((total, amount) => {
        /// sum up
        return total + amount;
      });
    return { totalBalance, availableBalance, largestPiece };
  }
  return { totalBalance: 0, availableBalance: 0, largestPiece: undefined };
};

export type Game = {
  gameNotification: GameNotification;
  gameState: GameState;
  gameAction?: GameAction;
  puzzleRecords: RecordWithPlaintext[];
  utilRecords: RecordWithPlaintext[];
  msRecords?: MSGameRecords;
};

export type MSGameRecords = {
  gameRecords: RecordWithPlaintext[];
  puzzleRecords: RecordWithPlaintext[];
  utilRecords: RecordWithPlaintext[];
};

type GameStore = {
  currentGame?: Game;
  yourTurn: Game[];
  theirTurn: Game[];
  finished: Game[];
  puzzleRecords: RecordWithPlaintext[];
  availableBalance: number;
  totalBalance: number;
  largestPiece?: RecordWithPlaintext;
  setRecords: (
    user: string,
    records: {
      gameNotifications: RecordWithPlaintext[];
      utilRecords: RecordWithPlaintext[];
      puzzleRecords: RecordWithPlaintext[];
    },
    msRecords?: MSGameRecords
  ) => void;
  setCurrentGame: (game?: Game) => void;
  clearFlowStores: () => void;
};

const createGame = (
  gameNotification: GameNotification,
  puzzleRecords: RecordWithPlaintext[],
  utilRecords: RecordWithPlaintext[],
  msRecords?: MSGameRecords
): Game => {
  const gameState = getGameState(gameNotification);
  return {
    gameNotification,
    gameState: gameState,
    gameAction: getGameAction(gameState),
    puzzleRecords: puzzleRecords.filter(
      (puzzleRecord) =>
        puzzleRecord.data.game_multisig?.replace('.private', '') ===
        gameNotification.recordData.game_multisig
    ),
    utilRecords: utilRecords.filter(
      (utilRecord) =>
        utilRecord.data.game_multisig?.replace('.private', '') ===
        gameNotification.recordData.game_multisig
    ),
    msRecords: msRecords
      ? {
          gameRecords: msRecords.gameRecords.filter(
            (gameRecord) =>
              gameRecord.owner === gameNotification.recordData.game_multisig
          ),
          puzzleRecords: msRecords.puzzleRecords.filter(
            (puzzleRecord) =>
              puzzleRecord.owner === gameNotification.recordData.game_multisig
          ),
          utilRecords: msRecords.utilRecords.filter(
            (utilRecord) =>
              utilRecord.owner === gameNotification.recordData.game_multisig
          ),
        }
      : undefined,
  };
};

const validStates = {
  yourTurn: new Set([
    'challenger:3', // challenger to reveal answer
    'challenger:4:win', // challenger to claim prize
    'winner:4', // challenger or opponent to claim prize
    'opponent:1', // opponent to submit wager
    'opponent:2', // opponent to accept game
  ]),
  theirTurn: new Set([
    'challenger:1', // challenger to ping opponent to submit wager
    'challenger:2', // challenger to ping opponent to accept game
    'loser:4', // remind challenger or opponent to accept funds
    'opponent:3', // opponent to ping challenger to reveal answer
  ]),
  finished: new Set([
    'opponent:0',
    'opponent:5',
    'opponent:6',
    'challenger:0',
    'challenger:5',
    'challenger:6',
  ]),
};
