import { RecordWithPlaintext, zodAddress } from '@puzzlehq/sdk';
import { z } from 'zod';

const u8 = z.number().int().min(0).max(255);

export const GameRecordSchema = z.object({
  owner: zodAddress,
  challenger_commit: z.string(),
  opponent_answer: z.array(u8).length(11),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  game_multisig: zodAddress,
  game_state: z.enum([
    '0field',
    '1field',
    '2field',
    '3field',
    '4field',
    '5field',
    '6field',
    '7field',
  ]),
  ix: z.literal('1u32'),
  uuid: z.string().uuid(),
  _nonce: z.string(),
});
export type GameRecord = {
  recordData: z.infer<typeof GameRecordSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const GameReqNotificationSchema = z.object({
  owner: zodAddress,
  game_multisig: zodAddress,
  game_state: z.literal('1field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('2u32'),
  _nonce: z.string(),
});
export type GameReqNotification = {
  recordData: z.infer<typeof GameReqNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const WaitingAcceptanceNotificationSchema = z.object({
  owner: zodAddress, // challenger
  game_multisig: zodAddress,
  game_state: z.literal('1field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('3u32'),
  _nonce: z.string(),
});
export type WaitingAcceptanceNotification = {
  recordData: z.infer<typeof WaitingAcceptanceNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const StakeRenegedNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('0field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  renege_address: zodAddress,
  ix: z.literal('4u32'),
  _nonce: z.string(),
});
export type StakeRenegedNotification = {
  recordData: z.infer<typeof StakeRenegedNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const ChallengerWagerNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('2field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('5u32'),
  _nonce: z.string(),
});
export type ChallengerWagerNotification = {
  recordData: z.infer<typeof ChallengerWagerNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const OpponentWagerNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('2field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('6u32'),
  _nonce: z.string(),
});
export type OpponentWagerNotification = {
  recordData: z.infer<typeof OpponentWagerNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const WaitingRevealNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('3field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('7u32'),
  _nonce: z.string(),
});
export type WaitingRevealNotification = {
  recordData: z.infer<typeof WaitingRevealNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const CalculatedOutcomeNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('3field'), //TODO: which field value we use?
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  ix: z.literal('11u32'),
  uuid: z.string().uuid(),
  _nonce: z.string(),
});
export type CalculatedOutcomeNotification = {
  recordData: z.infer<typeof CalculatedOutcomeNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const RevealAnswerNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('3field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  opponent_answer: z.array(u8).length(11),
  uuid: z.string().uuid(),
  ix: z.literal('8u32'),
  _nonce: z.string(),
});
export type RevealAnswerNotification = {
  recordData: z.infer<typeof RevealAnswerNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const GameFinishReqNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.literal('4field'),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  challenger_answer: z.array(u8).length(11),
  opponent_answer: z.array(u8).length(11),
  winner: zodAddress,
  loser: zodAddress,
  ix: z.literal('9u32'),
  _nonce: z.string(),
});
export type GameFinishReqNotification = {
  recordData: z.infer<typeof GameFinishReqNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export const GameFinishedNotificationSchema = z.object({
  owner: zodAddress, //opponent
  game_multisig: zodAddress,
  game_state: z.enum(['5field', '6field']),
  your_turn: z.string().transform(Boolean),
  total_pot: z.string().transform(Number),
  challenger_address: zodAddress,
  opponent_address: zodAddress,
  winner: zodAddress,
  loser: zodAddress,
  ix: z.literal('10u32'),
  _nonce: z.string(),
});
export type GameFinishedNotification = {
  recordData: z.infer<typeof GameFinishedNotificationSchema>;
  recordWithPlaintext: RecordWithPlaintext;
};

export type GameNotification =
  | GameReqNotification
  | WaitingAcceptanceNotification
  | StakeRenegedNotification
  | ChallengerWagerNotification
  | OpponentWagerNotification
  | WaitingRevealNotification
  | RevealAnswerNotification
  | GameFinishReqNotification
  | GameFinishedNotification
  | CalculatedOutcomeNotification;

export const removeVisibilitySuffix = (obj: { [key: string]: string }) => {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace('.private', '')
        .replace('.public', '')
        .replace('u64', '');
    }
  }
  return obj;
};

export type GameState =
  | 'challenger:0'
  | 'challenger:1'
  | 'challenger:2'
  | 'challenger:3'
  | 'challenger:5'
  | 'challenger:6'
  | 'opponent:0'
  | 'opponent:1'
  | 'opponent:2'
  | 'opponent:3'
  | 'opponent:5'
  | 'opponent:6'
  | 'winner:4'
  | 'loser:4'
  | 'challenger:7'; // Added this state for calculating outcome

export const getGameState = (game: GameNotification): GameState => {
  const challenger_or_opponent =
    game.recordData.challenger_address === game.recordData.owner
      ? 'challenger'
      : 'opponent';

  switch (game.recordData.ix) {
    case '2u32':
      return `opponent:1`;
    case '3u32':
      return `challenger:1`;
    case '4u32':
      return `${challenger_or_opponent}:0`;
    case '5u32':
      return `challenger:2`;
    case '6u32':
      return `opponent:2`;
    case '7u32':
      return `opponent:3`;
    case '8u32':
      return `challenger:3`;
    case '9u32': {
      const isWinner = game.recordData.winner === game.recordData.owner;
      return isWinner ? `winner:4` : `loser:4`;
    }
    case '10u32':
      return `${challenger_or_opponent}:5`;
    case '11u32':
      return 'challenger:7'
    default:
      return 'challenger:0';
  }
};

export type GameAction =
  | 'Renege'
  | 'Reveal'
  | 'Claim'
  | 'Accept'
  | 'Submit Wager'
  | 'Ping'
  | 'Claim'
  | 'Lose'
  | 'Calculate'
  | undefined;

export const getGameAction = (gameState: GameState): GameAction => {
  switch (gameState) {
    case 'challenger:0':
      return undefined;
    case 'challenger:1':
      return 'Renege'; // and ping
    case 'challenger:2':
      return 'Renege'; // and ping
    case 'challenger:3':
      return 'Reveal';
    case 'winner:4':
      return 'Claim';
    case 'loser:4':
      return 'Lose';
    case 'challenger:5':
      return undefined;
    case 'challenger:6':
      return undefined;
    case 'opponent:0':
      return undefined;
    case 'opponent:1':
      return 'Submit Wager';
    case 'opponent:2':
      return 'Accept';
    case 'opponent:3':
      return 'Ping';
    case 'opponent:5':
      return undefined;
    case 'opponent:6':
      return undefined;
    case 'challenger:7':
      return 'Calculate';
  }
};

export const parseGameRecord = (
  recordWithPlaintext: RecordWithPlaintext
): GameNotification | undefined => {
  const schemas = [
    GameReqNotificationSchema,
    WaitingAcceptanceNotificationSchema,
    StakeRenegedNotificationSchema,
    ChallengerWagerNotificationSchema,
    OpponentWagerNotificationSchema,
    WaitingRevealNotificationSchema,
    RevealAnswerNotificationSchema,
    GameFinishReqNotificationSchema,
    GameFinishedNotificationSchema,
    CalculatedOutcomeNotificationSchema
  ];

  for (const schema of schemas) {
    try {
      const result = schema.parse(
        removeVisibilitySuffix(recordWithPlaintext.data)
      );
      return {
        recordData: result,
        recordWithPlaintext: recordWithPlaintext,
      } as GameNotification;
    } catch {}
  }
  return undefined;
};

// game_state
// 0field - StakeRenegedNotification
// 1field - ChallengerWagerNotification, OpponentWagerNotification
// 2field - WaitingRevealNotification, RevealAnswerNotification, GameFinishReqNotification
// 3field - GameFinishedNotification
