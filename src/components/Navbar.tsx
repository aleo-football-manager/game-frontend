"use client";

import { cn } from "@/lib/utils";
import { useAccount } from "@puzzlehq/sdk";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import ConnectWallet from "./ConnectWallet";
import {
  FloatingMenu,
  HoveredLink,
  MobileMenu,
  MobileMenuItem,
} from "./FloatingMenu";
import { buttonVariants } from "./ui/button";
const Navbar = ({ className }: { className?: string }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { account, error, loading } = useAccount();
  const pathname = usePathname();

  const [isWalletModal, setIsWalletModal] = useState(false);
  const { width } = useWindowSize();
  const [active, setActive] = useState<boolean>(false);
  useEffect(() => {
    if (width > 768) {
      setIsNavOpen(false);
    }
  }, [width]);

  return (
    <div
      className={` flex justify-between pt-3 md:pt-6 items-center md:items-end    px-6 ${
        pathname === "/" ? "bg-[#E0F4FF]" : "bg-transparent"
      }  dark:bg-black  w-full z-20 top-0 left-0`}
    >
      {width < 950 ? (
        <MobileMenu setActive={setActive}>
          {/* <Link
              href="/your-games"
              className={`text-black ${buttonVariants({
                variant: "link",
              })}`}
            >
              Your Games
            </Link>
            <Link
              href="/create-game"
              className={`text-black ${buttonVariants({
                variant: "link",
              })}`}
            >
              Create Game
            </Link> */}

          <MobileMenuItem
            setActive={setActive}
            active={active}
            // item={<IoFootballOutline className="h-4 w-4 " />}
            item={
              <Image
                width={48}
                height={48}
                src={"/logo_2.png"}
                className="rounded-full"
                alt="logo"
              />
            }
          >
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink href="/create-game">Create Game</HoveredLink>
              <HoveredLink href="/your-games">Your Games</HoveredLink>
              <HoveredLink href="https://twitter.com/SuperLeoLig/">
                Twitter
              </HoveredLink>
            </div>
          </MobileMenuItem>
        </MobileMenu>
      ) : (
        <Link href="/" className="">
          <Image
            width={48}
            height={48}
            src={"/logo_2.png"}
            className="rounded-full"
            alt="logo"
          />
        </Link>
      )}
      <div
        className={cn(
          "fixed flex items-center  justify-center top-6 inset-x-0 max-w-xl mx-auto z-50",
          className
        )}
      >
        {width > 950 && (
          <FloatingMenu setActive={setActive}>
            <Link
              href="/your-games"
              className={`text-black ${buttonVariants({
                variant: "link",
              })}`}
            >
              Your Games
            </Link>
            <Link
              href="/create-game"
              className={`text-black ${buttonVariants({
                variant: "link",
              })}`}
            >
              Create Game
            </Link>
          </FloatingMenu>
        )}
      </div>
      <ConnectWallet setIsWalletModal={setIsWalletModal} />
    </div>
  );
};

export default Navbar;
