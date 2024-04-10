"use client";
import { useGameStore } from "@/app/state/gameStore";
import { transitionFees } from "@/app/state/manager";
import {
  EventType,
  disconnect,
  requestCreateEvent,
  useAccount,
  useBalance,
  useConnect,
} from "@puzzlehq/sdk";
import { SessionTypes } from "@walletconnect/types";
import React, { useEffect, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { IoCopyOutline, IoLogOutOutline } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import { ThemeToggle } from "./ToggleTheme";
//@ts-ignore
import Identicon from "react-identicons";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export const truncateAddress = (address: string) => {
  if (address && address.length <= 6) return address; // No need to truncate if the address is too short

  const prefix = address.slice(0, 4); // Typically "0x"
  const suffix = address.slice(-4); // The last 4 characters

  return `${prefix}...${suffix}`;
};
interface IConnectWallet {
  setIsWalletModal: (val: boolean) => void;
}

const ConnectWallet: React.FC<IConnectWallet> = ({ setIsWalletModal }) => {
  const { account, error } = useAccount();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { connect } = useConnect();
  const [isCopied, setIsCopied] = useState(false);
  const { balances } = useBalance({
    address: account?.address!,
    multisig: true,
  });
  // const balances = useBalance();
  const [availableBalance] = useGameStore((state) => [state.availableBalance]);
  const getPuzzlePieces = async () => {
    setLoading(true);
    try {
      const response = await requestCreateEvent({
        type: EventType.Execute,
        programId: "puzzle_pieces_v016.aleo",
        functionId: "mint_private",
        fee: transitionFees.submit_wager,
        inputs: Object.values({
          amount: "1000u64",
          address: account?.address!,
        }),
        address: account?.address, // opponent address
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account?.address as string);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1200);
  };

  const connectWallet = async () => {
    try {
      const session: SessionTypes.Struct = await connect();
    } catch (err) {
      //   setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (account) {
      setAddress(account?.address!);
    }
  }, [account]);

  return (
    <div className="flex font-technor max-sm:gap-2 gap-6 z-50 items-center">
      {account ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsWalletModal(true)}
              variant="outline"
              className="tracking-wider text-base text-black dark:text-white font-semibold flex gap-2.5"
            >
              {address && (
                <>
                  <div className="hidden md:flex">
                    <Identicon string={address} size={20} />
                  </div>
                  {truncateAddress(address)}
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] font-supreme">
            <DialogHeader className="flex gap-1 w-full flex-col justify-center items-center">
              <Identicon string={account?.address!} size={32} />

              <DialogTitle className="font-bold tracking-lighter font-technor dark:text-white  text-[#25292e] text-[18px] ">
                {truncateAddress(account?.address!)}
              </DialogTitle>

              <DialogDescription>
                <h1 className="font-semibold tracking-tighter text-[#868989] ">
                  Public Balance: {balances && balances[0].public.toFixed(2)}
                </h1>
                <h1 className="font-semibold tracking-tighter text-[#868989] ">
                  Private Balance: {balances && balances[0].private.toFixed(2)}
                </h1>
                <h1 className="font-semibold tracking-tighter text-[#868989] ">
                  Puzzle Pieces: {availableBalance && availableBalance}
                </h1>
              </DialogDescription>
            </DialogHeader>
            {availableBalance === 0 && (
              <div className="w-full flex items-center justify-center">
                <Button
                  disabled={loading}
                  onClick={getPuzzlePieces}
                  className="w-32"
                  variant={"outline"}
                >
                  Mint Pieces
                </Button>
              </div>
            )}
            <div className="flex justify-center font-technor gap-4 mt-2 text-center w-full items-center">
              <Button
                onClick={copyAddress}
                variant="outline"
                className="flex flex-col gap-1 hover:text-white  dark:hover:bg-[#dbe0e5] bg-[#fafafa] w-2/5   h-fit justify-center items-center"
              >
                {isCopied ? (
                  <>
                    <MdDone
                      className=" cursor-pointer  stroke-black  text-black fill-current"
                      size={24}
                    />
                    <span className="text-xs mt-1 font-semibold text-black">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <IoCopyOutline
                      className=" stroke-black  text-black fill-current  cursor-pointer"
                      size={24}
                    />
                    <span className="text-xs mt-1 font-semibold text-black">
                      Copy Address
                    </span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsWalletModal(false);
                  disconnect();
                }}
                variant="outline"
                className="flex flex-col gap-1 hover:text-white dark:hover:bg-[#dbe0e5]  bg-[#fafafa] w-2/5   h-fit justify-center items-center"
              >
                <IoLogOutOutline
                  className="stroke-black  text-black fill-current cursor-pointer"
                  size={28}
                />
                <span className="text-xs font-semibold text-black">
                  Disconnect
                </span>{" "}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Button onClick={connectWallet}>
          {account ? "" : "Connect Wallet"}
        </Button>
      )}
      {/* <div className="hidden md:flex"> */}
      <a
        target="_blank"
        className="max-sm:hidden flex"
        href="https://twitter.com/SuperLeoLig/"
      >
        <FaXTwitter className="text-black stroke-current w-5 h-5 dark:text-white" />
      </a>
      <ThemeToggle />
      {/* </div> */}
    </div>
  );
};
export default ConnectWallet;
