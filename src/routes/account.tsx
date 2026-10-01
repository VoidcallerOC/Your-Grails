import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Sign in · YourGrails" }] }),
  component: Account,
});

function Account() {
  return (
    <>
      <PageHead eyebrow="Sign in" title="Getting in">
        YourGrails is invite-only right now. In production you connect a wallet (your own, or one made for you at sign-in) and redeem a
        one-time referral code. Collectors unlock their own codes as they open packs and battle.
      </PageHead>
      <div className="wrap space-y-6 text-paper-dim [&>*]:max-w-3xl">
        <section className="panel p-5">
          <h2 className="font-semibold text-paper">Why sign-in is off in this build</h2>
          <p className="mt-2 text-sm">
            Accounts are issued by YourGrails' sign-in provider and only work on addresses YourGrails approves. Until this site's address
            is approved, signing in here could not reach your real account, and anything shown would be made up. So it is off.
          </p>
          <p className="mt-2 text-sm">
            Everything you can see without an account is real and live: packs, odds, pulls, listings, collections and rankings. Buying,
            opening, listing, offers, battles, trades, loans and buybacks all need a signed-in wallet and are off.
          </p>
        </section>
        <p className="text-sm">
          To use your account today, go to <a className="link" href="https://yourgrails.com" rel="noopener noreferrer">yourgrails.com</a>.
          Questions: <Link to="/support" className="link">Support</Link>.
        </p>
      </div>
    </>
  );
}
