import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";

export const Route = createFileRoute("/redeem")({
  head: () => ({ meta: [{ title: "Redemption · YourGrails" }] }),
  component: Redeem,
});

function Redeem() {
  return (
    <>
      <PageHead eyebrow="Redemption" note="Coming soon" title="Ship the slab home">
        Physical redemption isn't open yet. YourGrails lists it as coming after the beta.
      </PageHead>
      <div className="wrap [&>*]:max-w-3xl">
        <h2 className="mb-3 text-base font-semibold">How it is planned to work</h2>
        <ol className="border-t border-line text-sm text-paper-dim">
          {[
            "Request shipment of a card you hold.",
            "YourGrails confirms and sends an itemized cost for shipping, insurance and fees. Identity checks may apply.",
            "You pay. The card's token is burned. This can't be undone.",
            "The slab leaves the vault, is inspected, packed, insured and shipped with tracking.",
          ].map((s, i) => (
            <li key={s} className="grid grid-cols-[32px_minmax(0,1fr)] border-b border-line py-3"><span className="tabular-nums text-muted">{i + 1}.</span>{s}</li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-paper-dim">
          Until then, you can ask for a live photo of the exact card the vault holds for you through <Link to="/support" className="link">support</Link>.
          Fees, destinations and processing times will be published when redemption opens.
        </p>
      </div>
    </>
  );
}
