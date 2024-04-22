import { RecordWithPlaintext } from "@puzzlehq/sdk";

export const GAME_PROGRAM_ID = "football_game_v015b.aleo";
export const COIN_PROGRAM_ID = "football_coins_v001.aleo";
export const PVP_UTILS_PROGRAM_ID = "football_pvp_utils_v001.aleo";
export const GAME_OUCOMES_MAPPING = "https://node.puzzle.online/testnet3/program/football_game_v015b.aleo/mapping/game_outcomes/";

export const GAME_RESULTS_MAPPING = "game_outcomes";

export const GAME_FUNCTIONS = {
  propose_game: "propose_game",
  submit_wager: "submit_wager",
  accept_game: "accept_game",
  calculate_outcome: "calculate_outcome",
  reveal_answer: "reveal_answer_game",
  finish_game: "finish_game",
  finish_game_draw: "finish_game_draw",
};
export const COIN_FUNCTIONS = {
  mint_private: "mint_private",
};

/// In comment actual values. For testing use more 
export const transitionFees = {
  propose_game: 0.027, // 0.017897
  submit_wager: 0.01505, // 0.008505,
  accept_game: 0.03901, // 0.030573
  calculate_outcome: 3.2, //2.046452, todo: doesnt get in with 2.2 but burns 1.15??
  reveal_answer: 0.1,
  finish_game: 0.1,
  mint_private: 0.002, //0.001809,
};

export type LoadingStatus = "idle" | "loading" | "success" | "error";

export type ProposeGameInputs = {
  wager_record: RecordWithPlaintext;
  challenger_wager_amount: string;
  challenger: string;
  opponent: string;
  game_multisig: string;
  challenger_message_1: string;
  challenger_message_2: string;
  challenger_message_3: string;
  challenger_message_4: string;
  challenger_message_5: string;
  challenger_sig: string;
  challenger_nonce: string;
  challenger_answer: string;
  game_multisig_seed: string;
};

export type SubmitWagerInputs = {
  opponent_wager_record: RecordWithPlaintext;
  key_record: RecordWithPlaintext;
  game_req_notification: RecordWithPlaintext;
  opponent_message_1: string; //from output of useSignature
  opponent_message_2: string;
  opponent_message_3: string;
  opponent_message_4: string;
  opponent_message_5: string;
  opponent_sig: string; //from output of useSignature
};

// used for submit wager and accept game
export type AcceptGameInputs = {
  game_record: RecordWithPlaintext;
  opponent_answer: string;
  piece_stake_challenger: RecordWithPlaintext;
  piece_claim_challenger: RecordWithPlaintext;
  piece_stake_opponent: RecordWithPlaintext;
  piece_claim_opponent: RecordWithPlaintext;
  block_ht: string;
};

export type CalculateOutcomeInputs = {
  reveal_answer_notification_record: RecordWithPlaintext;
  challenger_answer_record: RecordWithPlaintext;
};

export type RevealAnswerInputs = {
  challenger_claim_signature: RecordWithPlaintext;
  calculated_outcome_notification_record: RecordWithPlaintext;
  joint_piece_state: RecordWithPlaintext;
  challenger_answer_record: RecordWithPlaintext;
  game_outcome: string;
};

export type FinishGameInputs = {
  game_record: RecordWithPlaintext;
  joint_piece_winner: RecordWithPlaintext;
  piece_joint_stake: RecordWithPlaintext;
  joint_piece_time_claim: RecordWithPlaintext;
};
