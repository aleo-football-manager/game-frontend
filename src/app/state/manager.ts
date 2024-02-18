import { RecordWithPlaintext } from "@puzzlehq/sdk";

export const GAME_PROGRAM_ID = "football_game_v012.aleo";

export const GAME_FUNCTIONS = {
  propose_game: "propose_game",
  submit_wager: "submit_wager",
  accept_game: "accept_game",
  reveal_answer: "reveal_answer_game",
  finish_game: "finish_game",
  calculate_outcome: "calculate_outcome",
};

/// todo - update these
export const transitionFees = {
  propose_game: 0.017,
  submit_wager: 0.0186,
  accept_game: 0.03901,
  calculate_outcome: 0.1,
  reveal_answer: 0.1,
  finish_game: 0.1,
  testing: 0.5,
};

export type LoadingStatus = "idle" | "loading" | "success" | "error";

export type ProposeGameInputs = {
  wager_record: RecordWithPlaintext;
  challenger_wager_amount: string;
  sender: string; // challenger address proposing game
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
  uuid: string;
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

export type RevealAnswerInputs = {
  reveal_answer_notification_record: RecordWithPlaintext;
  challenger_answer_record: RecordWithPlaintext;
  joint_piece_stake: RecordWithPlaintext;
  challenger_claim_signature: RecordWithPlaintext;
  game_outcome: string;
  calculated_outcome_notification_record: RecordWithPlaintext;
};

export type FinishGameInputs = {
  game_record: RecordWithPlaintext;
  joint_piece_winner: RecordWithPlaintext;
  piece_joint_stake: RecordWithPlaintext;
  joint_piece_time_claim: RecordWithPlaintext;
};
