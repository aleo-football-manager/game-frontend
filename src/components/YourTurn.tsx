import { Button } from './ui/button';
import { Game, useGameStore } from '@state/gameStore.js';
import { shortenAddress } from '@puzzlehq/sdk';


interface IYourTurn {
    game: Game;
}

const YourTurn: React.FC<IYourTurn> = ({ game }) => {
    const user = game.gameNotification.recordData.owner;
    const opponent_address = game.gameNotification.recordData.opponent_address;
    const challenger_address =
        game.gameNotification.recordData.challenger_address;
    const vs = user === opponent_address ? challenger_address : opponent_address;
    const wager = game.gameNotification.recordData.total_pot / 2;
    const renderActionButton = () => {
        switch (game.gameAction) {
            case "Submit Wager":
                // return <SubmitWagerButton game={game} />;
                return <Button
                    size="sm"
                    color="yellow"
                >
                    Submit
                </Button>
            case "Accept":
                // return <AcceptGameButton game={game} />;
                return <Button
                    size="sm"
                    color="yellow"
                >
                    Accept
                </Button>
            case "Reveal":
                return <Button
                    size="sm"
                    color="yellow"
                >
                    Reveal
                </Button>
            // return (
            // <Button
            //     onClick={() => {
            //         setCurrentGame(game);
            //         navigate(
            //             `/reveal-answer/${game.gameNotification.recordData.game_multisig}`
            //         );
            //     }}
            //     size="sm"
            //     color="yellow"
            // >
            //     Reveal
            // </Button>
            // );
            case "Lose":

                return <Button
                    size="sm"
                    color="yellow"
                >
                    Lose
                </Button>
            // return (
            //     <Button
            //         onClick={() => {
            //             setCurrentGame(game);
            //             navigate(
            //                 `/finish-game/lose/${game.gameNotification.recordData.game_multisig}`
            //             );
            //         }}
            //         size="sm"
            //         color="yellow"
            //     >
            //         See Answer
            //     </Button>
            // );
            case "Claim":
                return <Button
                    size="sm"
                    color="yellow"
                >
                    Claim
                </Button>
            // return (
            //     <Button
            //         onClick={() => {
            //             setCurrentGame(game);
            //             navigate(
            //                 `/finish-game/win/${game.gameNotification.recordData.game_multisig}`
            //             );
            //         }}
            //         color="yellow"
            //         size="sm"
            //     >
            //         View Result
            //     </Button>
            // );
        }
    };
    return (
        <div className='mb-2 grid w-full grid-cols-[1fr,auto,1fr] items-center gap-5'>
            <div className='my-auto self-center text-left text-xs font-bold tracking-tight text-primary-pink max-sm:ml-2'>
                {shortenAddress(vs)}
            </div>
            <div className='my-auto self-center text-left text-xs font-bold tracking-tight text-primary-pink max-sm:ml-2'>
                {wager} pieces
            </div>
            <div className='flex justify-end'>{renderActionButton()}</div>
        </div>);
};
export default YourTurn;
