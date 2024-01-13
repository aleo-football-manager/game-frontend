"use client";

import Game from "@/components/Game";
import TeamSelection from "@/components/TeamSelection";
import { useState, useEffect } from "react";
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
import { useEventHandling } from '@hooks/eventHandling.js';
import jsyaml from 'js-yaml';

import { Step, useNewGameStore } from '../store.js';
import { useSearchParams } from 'react-router-dom';
interface ICreateGame {}

const messageToSign = '1234567field';


enum ConfirmStep {
  Signing,
  RequestingEvent,
}
const CreateGame: React.FC<ICreateGame> = ({}) => {

  const [inputs, eventId, setInputs, setEventId, setStep] = useNewGameStore(
    (state) => [
      state.inputs,
      state.eventId,
      state.setInputs,
      state.setEventId,
      state.setStep,
    ]
  );
  const [confirmStep, setConfirmStep] = useState(ConfirmStep.Signing);

  const opponent = inputs?.opponent ?? '';
  const answer = inputs?.challenger_answer;
  const amount = inputs?.challenger_wager_amount ?? 0;

  const { account } = useAccount();
  const { balances } = useBalance({});
  const balance = balances?.[0]?.public ?? 0;

  const { loading, error, event, setLoading, setError } = useEventHandling({
    id: eventId,
    onSettled: () => setStep(Step._05_GameStarted),
  });
  const [searchParams, setSearchParams] = useSearchParams();


  useEffect(() => {
    if (event) {
      setConfirmStep(ConfirmStep.Signing);
    }
  }, [event]);

  const createProposeGameEvent = async () => {
    setLoading(true);
    setConfirmStep(ConfirmStep.Signing);
    setError(undefined);
    const signature = await requestSignature({ message: messageToSign });

    if (signature.error || (!signature.messageFields || !signature.signature)) {
      setError(signature.error);
      setLoading(false);
      return;
    }
    const sharedStateResponse = await createSharedState();
    if (sharedStateResponse.error) {
      setError(sharedStateResponse.error);
      setLoading(false);
      return;
    } else if (sharedStateResponse.data) {
      const game_multisig_seed = sharedStateResponse.data.seed;
      const game_multisig = sharedStateResponse.data.address;

      setInputs({ ...inputs, game_multisig_seed, game_multisig });
      if (
        inputs?.opponent &&
        inputs?.wager_record &&
        inputs?.challenger_wager_amount &&
        inputs?.challenger_answer &&
        inputs?.challenger &&
        signature &&
        signature.messageFields &&
        signature.signature &&
        account
      ) {
        setConfirmStep(ConfirmStep.RequestingEvent);

        const fields = Object(jsyaml.load(signature.messageFields));

        const proposalInputs: ProposeGameInputs = {
          wager_record: 'field',
          challenger_wager_amount: '100u64',
          sender: 'aleo1r65hye843hlwcqcv5uuq6dgz9xsmhsphqwfpjc74vf59a4l4dyxqs4er5w',
          challenger: 'aleo1r65hye843hlwcqcv5uuq6dgz9xsmhsphqwfpjc74vf59a4l4dyxqs4er5w',
          opponent: 'aleo1r4pc6ufjvw050jhzrew3vqm2lvacdxfd4a5ckulau0vjc72qvc8sr0jg2a',
          game_multisig: game_multisig,
          challenger_message_1: fields.field_1,
          challenger_message_2: fields.field_2,
          challenger_message_3: fields.field_3,
          challenger_message_4: fields.field_4,
          challenger_message_5: fields.field_5,
          challenger_sig: signature.signature,
          challenger_nonce: messageToSign, 
          challenger_answer: '[0u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8,8u8]',
          game_multisig_seed: '98765field',
          uuid: '0field',
        };
        const response = await requestCreateEvent({
          type: EventType.Execute,
          programId: GAME_PROGRAM_ID,
          functionId: GAME_FUNCTIONS.propose_game,
          fee: transitionFees.propose_game,
          inputs: Object.values(proposalInputs),
        });
        if (response.error) {
          setError(response.error);
        } else if (!response.eventId) {
          setError('No eventId found!');
        } else {
          console.log('success', response.eventId);
          setEventId(response.eventId);
          setSearchParams({ eventId: response.eventId });
        }
      }
    }
  };


  const disabled = [
    inputs?.opponent,
    inputs?.wager_record,
    inputs?.challenger_wager_amount,
    inputs?.challenger_answer,
    balance === 0
  ].includes(undefined);

  const [buttonText, setButtonText] = useState('PROPOSE GAME');

  useEffect(() => {
    if (!loading) {
      setButtonText('PROPOSE GAME');
    } else if (event?.status === EventStatus.Creating) {
      setButtonText('CREATING EVENT...');
    } else if (event?.status === EventStatus.Pending) {
      setButtonText('EVENT PENDING...');
    } else if (confirmStep === ConfirmStep.Signing) {
      setButtonText('REQUESTING SIGNATURE...');
    } else if (confirmStep === ConfirmStep.RequestingEvent) {
      setButtonText('REQUESTING EVENT...');
    }
  }, [loading, event?.status, confirmStep]);

  

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
