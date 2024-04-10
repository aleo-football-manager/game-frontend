import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQ() {
  return (
    <div className="flex justify-center  items-center min-h-screen">
      <Card className="shadow-lg w-[550px]">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold font-technor tracking-tighter">
            Frequently Asked Questions
          </h2>
          <Accordion className="w-full mt-4" type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                How to play Super Leo Lig?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme">
                <p>
                  You can play <strong>Super Leo Lig</strong> by connecting your
                  Aleo account using the Puzzle Wallet. Download the wallet{" "}
                  <a
                    href="https://chromewebstore.google.com/detail/puzzle-wallet/fdchdcpieegfofnofhgdombfckhbcokj"
                    target="_blank"
                    className="underline"
                  >
                    here
                  </a>
                  .
                </p>{" "}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                How many players can play?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme ">
                Two players can play against each other after selecting their
                teams and entering the wagers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                Are there any tournaments to compete in?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme">
                Seasons and special tournaments are part of the roadmap.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                Why is Super Leo Lig build on Aleo?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme">
                Super Leo Lig is only available on Aleo, because Aleo enables
                apps that are private by default. This enables users to commit
                to their strategy, without revealing it to the opponent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                Am I able to buy/sell players for my team?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme">
                In the future it will be possible. Players will be tokenized as
                NFT&apos;s and tradeable on the market.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem className="border-b-0" value="item-6">
              <AccordionTrigger className="hover:no-underline font-semibold tracking-tight font-technor">
                Will I get rugged if my opponent rage quits?
              </AccordionTrigger>
              <AccordionContent className="text-black/80 dark:text-white/70 font-supreme">
                No! Super Leo Lig uses the Puzzle SDK and wallet, which are
                optimized for multiparty privacy games. Because Super Leo lig
                implements the Puzzle SDK, all wagered amounts are stored in a
                time-locked multisig. If an opponent decides to not finish the
                game, the wagered amount is released to the user after the
                time-lock expires.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
