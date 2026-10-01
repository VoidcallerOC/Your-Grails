import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { CONTRACTS, contractUrl } from "@/lib/contracts";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "How it works · YourGrails" }] }),
  component: Docs,
});

const SECTIONS: [string, string[]][] = [
  ["Real cards", [
    "Each card is a PSA, BGS or CGC graded slab stored insured in the vault. You hold it as a CardNFT token on Avalanche, tied to the slab's cert number.",
    "Card pages show market value, not floor price. Values come from recent graded sales and a pricing model, and are refreshed over time.",
    "For cards the vault holds for you, you can ask support for a live photo of the exact slab.",
  ]],
  ["Fair draws", [
    "Every pack opening and battle opening uses Chainlink VRF on Avalanche. The website cannot pick the card.",
    "Odds are published per pack as value tiers, calculated from the cards in that pack's pool, and change as cards are pulled and restocked.",
    "Buying several packs at once gives each pack its own random draw.",
  ]],
  ["Paying", [
    "Packs, battles and marketplace sales settle in USDC on Avalanche.",
    "You can also pay from Ethereum, Base, Arbitrum, OP Mainnet, Polygon, HyperEVM or Monad. Circle CCTP moves the USDC and finishes the purchase on Avalanche.",
  ]],
  ["Instant buyback", [
    "The original buyer of a pull can sell it back for 90% of its appraised market value within five days of the reveal.",
    "Cards bought on the marketplace or received by transfer don't qualify. Large buybacks can be reviewed manually.",
  ]],
  ["Marketplace", [
    "Sellers list at a buy-now price, and the card moves into escrow. Sellers can cancel and get the card back.",
    "Buyers deposit USDC into an offer balance and make offers. Sellers choose whether to accept. You're warned if an offer is above the buy-now price.",
  ]],
];

function Docs() {
  return (
    <>
      <PageHead title="The short version">
        What happens under the hood, in plain English. For the full current guide, see{" "}
        <a className="link" href="https://yourgrails.com/docs" rel="noopener noreferrer">yourgrails.com/docs</a>.
      </PageHead>
      <div className="wrap space-y-10 [&>*]:max-w-4xl">
        {SECTIONS.map(([title, paras]) => (
          <section key={title}>
            <h2 className="display text-2xl">{title}</h2>
            <div className="mt-3 space-y-3 text-paper-dim">
              {paras.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
        ))}
        <section>
          <h2 className="display text-2xl">Contracts</h2>
          <p className="mt-3 text-sm text-paper-dim">
            Avalanche C-Chain (43114). "Source verified" means the explorer shows verified source code for that address as of 1 Oct 2026.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="label pb-2 font-normal">Contract</th>
                  <th scope="col" className="label pb-2 font-normal">What it does</th>
                  <th scope="col" className="label pb-2 font-normal">Address</th>
                </tr>
              </thead>
              <tbody>
                {CONTRACTS.map((c) => (
                  <tr key={c.address} className="border-t border-line align-top">
                    <th scope="row" className="py-2 pr-4 text-left font-semibold">
                      {c.name}
                      <span className={`block text-xs font-normal ${c.verified ? "text-ok" : "text-muted"}`}>{c.verified ? "Source verified" : "Not checked"}</span>
                    </th>
                    <td className="py-2 pr-4 text-paper-dim">{c.role}</td>
                    <td className="py-2 font-mono text-xs"><a className="link break-all" href={contractUrl(c.address)} target="_blank" rel="noopener noreferrer">{c.address}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
