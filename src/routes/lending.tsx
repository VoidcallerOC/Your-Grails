import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { BlockedAction } from "@/components/states";

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
      <PageHead kicker="Lending" title="Borrow against your slabs">
        Collectors lend USDC to collectors, secured by graded cards in the vault. YourGrails does not lend; it runs the contract and
        the appraisals.
      </PageHead>
      <div className="wrap grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <ol className="border-t border-line">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[40px_1fr] gap-3 border-b border-line py-5">
              <span className="font-mono text-sm text-brass">0{i + 1}</span>
              <div>
                <h2 className="font-semibold">{t}</h2>
                <p className="mt-1 text-sm text-paper-dim">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="space-y-3">
          <BlockedAction label="Request a loan" does="Shows your eligible cards and the current loan terms, then locks the cards and posts your request." />
          <BlockedAction label="Fund a loan" does="Lists open requests with their collateral, APR, term and LTV so you can fund one." />
          <BlockedAction label="My loans" does="Repay, propose or accept extra time, claim yield, or claim collateral after a default." />
          <p className="pt-2 text-xs text-muted">
            Loan terms, rates and the platform fee come from YourGrails' live terms. They aren't shown here because they need sign-in.
          </p>
        </aside>
      </div>
    </>
  );
}
