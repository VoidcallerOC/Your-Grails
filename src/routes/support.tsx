import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { BlockedAction } from "@/components/states";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support · YourGrails" }] }),
  component: Support,
});

function Support() {
  return (
    <>
      <PageHead kicker="Support" title="Get it fixed">
        Pack purchases, reveals, battles, marketplace, buybacks, account access, bugs or feedback.
      </PageHead>
      <div className="wrap grid grid-cols-1 max-w-4xl gap-6 md:grid-cols-2">
        <section className="panel p-5">
          <h2 className="font-semibold">Email</h2>
          <p className="mt-2 text-sm text-paper-dim">
            <a className="link" href="mailto:support@yourgrails.com">support@yourgrails.com</a>
          </p>
          <p className="mt-3 text-sm text-muted">
            Include the wallet address involved, transaction hashes, the pack or card name, and the battle room if it's about a battle.
          </p>
        </section>
        <BlockedAction label="Open a ticket" does="Creates a support thread tied to your wallet, with replies delivered as notifications." />
      </div>
    </>
  );
}
