"use client";

import Game from "@/components/Game";
import TeamSelection from "@/components/TeamSelection";
import { useState } from "react";
import {
  createSharedState,
  requestCreateEvent,
  requestSignature,
  useAccount,
  EventType,
  EventStatus,
  useBalance,
} from '@puzzlehq/sdk';

import {
  GAME_FUNCTIONS,
  GAME_PROGRAM_ID,
  ProposeGameInputs,
  transitionFees,
} from '@state/manager.js';

interface ICreateGame {}

const CreateGame: React.FC<ICreateGame> = ({}) => {

  const proposalInputs: ProposeGameInputs = {
    wager_record: puzzle_piece_wager_input,
    challenger_wager_amount: '100u64',
    sender: 'aleo1r65hye843hlwcqcv5uuq6dgz9xsmhsphqwfpjc74vf59a4l4dyxqs4er5w',
    challenger: 'aleo1r65hye843hlwcqcv5uuq6dgz9xsmhsphqwfpjc74vf59a4l4dyxqs4er5w',
    opponent: 'aleo1r4pc6ufjvw050jhzrew3vqm2lvacdxfd4a5ckulau0vjc72qvc8sr0jg2a',
    game_multisig: 'aleo1asu88azw3uqud282sll23wh3tvmvwjdz5vhvu2jwyrdwtgqn5qgqetuvr6',
    challenger_message_1: '344770206515066694345863990910961346516345489682671576468160854792060056345field',
    challenger_message_2: '825602627445886687266399512080984152479750081242066206322049231905840897733field',
    challenger_message_3: '7131563294138157697636980988285342289800193481060118979325065061725401371413field',
    challenger_message_4: '5614969858986721495317269544367248590671925341452452275659834275047113140510field',
    challenger_message_5: '998663372122700561883073426402819334460124966419873210288648288784658870328field',
    challenger_sig: 'sign1tvl3d46v49qg4pj204msl0c50sk27yarmktw7slxqv76z5djtgps9uqjds4vlftrg9tg5pnw3f8ddnzgpt40fcn073cgrju080xyuq79rm93tzlnnqrljj43cpzpy9h7v26fu3sa2xd0v52al4h5w3knqy2a8kgupslh9f6tyrphczumvhxmt59hvavmm3ef56k2jkrq2tzq7r0dgc5',
    challenger_nonce: '12345field', /// todo - make this random
    challenger_answer: '[0u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8]',
    game_multisig_seed: '98765field',
    uuid: '0field',
  };

  // const response = await requestCreateEvent({
  //   type: EventType.Execute,
  //   programId: "football_game_v008.aleo",
  //   functionId: "propose_game",
  //   fee: "150000",
  //   inputs: Object.values("1"),
  // });


  const [selectedTeam, setSelectedTeam] = useState(2);
  const [isGameStarted, setIsGameStarted] = useState(false);


  return (
    <div className="">
      {isGameStarted ? (
        <Game selectedTeam={selectedTeam} setIsGameStarted={setIsGameStarted} />
      ) : (
        <TeamSelection
          setSelectedTeam={setSelectedTeam}
          selectedTeam={selectedTeam}
          setIsGameStarted={setIsGameStarted}
        />
      )}
    </div>
  );
};
export default CreateGame;
