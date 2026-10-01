import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { BlockedAction } from "@/components/states";
import { CustodyTrack, type Holder } from "@/components/experience";

/** Who holds the slab at each step, per the published loan rules above. */
const CUSTODY: [Holder, boolean, string?][] = [
  ["vault", true, "Locked in the lending contract while the request is open."],
  ["vault", true],
  ["vault", true, "The USDC goes to the borrower; the slab stays locked."],
  ["borrower", false, "Released back to the borrower."],
  ["lender", false, "After grace ends, the lender can claim it."],
  ["vault", true],
];

export const Route = createFileRoute("/lending")({
  head: () => ({ meta: [{ title: "Lending · YourGrails" }] }),
  component: Lending,
});

/** Peer-to-peer card-backed loans, as documented by YourGrails. No rates or limits are shown because they come from live loan terms. */
const STEPS: [string, string][] = [
  ["Borrowers request", "Pick a card or a bundle of cards and a loan term, then request a USDC amount. The cards lock in the lending contract while the request is open."],
  ["Limits come from the term", "The most you can ask for is set by the term's loan-to-value rule and a signed appraisal of your cards."],
  ["Lenders fund", "A lender reviews the cards, their values, the APR, term and LTV, then funds the request. The USDC goes to the borrower and the due date starts."],
  ["Repay to unlock", "Repaying the loan plus interest and the platform fee releases the cards back to the borrower."],
  ["Grace, then default", "Miss the due date and a grace period begins. You can still repay during grace. After it ends, the lender can claim the collateral."],
  ["Extra time", "Lenders can pre-approve extra time, and borrowers can prepay extra periods. The lender collects that extra-time payout."],
];

function Lending() {
  return (
    <>
      <PageHead eyebrow="Card-backed loans · follow the slab" title="Borrow against your slabs">
        Collectors lend USDC to collectors, secured by graded cards in the vault. YourGrails does not lend; it runs the contract and
        the appraisals.
      </PageHead>
      <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        {/* A loan's life, start to finish: calm, sequential, nothing hidden. */}
        <ol className="relative">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 pb-9 last:pb-0">
              {i < STEPS.length - 1 && <span className="absolute bottom-0 left-[21px] top-11 w-px bg-line-strong" aria-hidden="true" />}
              <span className={`flex h-11 w-11 items-center justify-center font-display text-base font-semibold cut-sm ${i === 4 ? "bg-warn/15 text-warn" : "bg-raised text-paper"}`}>{i + 1}</span>
              <div className="pt-2">
                <h2 className="font-display text-xl font-semibold">{t}</h2>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-paper-dim">{d}</p>
                <CustodyTrack at={CUSTODY[i][0]} locked={CUSTODY[i][1]} note={CUSTODY[i][2]} />
              </div>
            </li>
          ))}
        </ol>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel space-y-6 p-6">
            <BlockedAction tone="primary" label="Request a loan" does="Shows your eligible cards and the current loan terms, then locks the cards and posts your request." />
            <BlockedAction label="Fund a loan" does="Lists open requests with their collateral, APR, term and LTV so you can fund one." />
            <BlockedAction label="My loans" does="Repay, propose or accept extra time, claim yield, or claim collateral after a default." />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Loan terms, rates and the platform fee come from YourGrails' live terms. They aren't shown here because they need sign-in.
          </p>
        </aside>
      </div>
    </>
  );
}
