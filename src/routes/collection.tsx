import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { BlockedAction } from "@/components/states";
import { isAddress } from "@/lib/normalize";
import { useState } from "react";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "Collection · YourGrails" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (isAddress(v)) navigate({ to: "/u/address/$address", params: { address: v.toLowerCase() }, search: { page: 1 } });
    else if (/^[A-Za-z0-9_.-]{2,40}$/.test(v)) navigate({ to: "/u/$username", params: { username: v }, search: { page: 1 } });
    else setError("Enter a username or a full 0x wallet address.");
  };
  return (
    <>
      <PageHead eyebrow="Your vault" title="Your slabs">
        Your collection lists every card token in your wallet, one slab per token: grade, cert, value, buyback window and what you can
        do with it. It needs you signed in.
      </PageHead>
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* The empty case waiting for your slabs. */}
        <section className="panel relative overflow-hidden px-6 pb-8 pt-10 sm:px-10">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(520px 260px at 50% 0%, rgba(212,168,75,0.13), transparent 70%)" }} aria-hidden="true" />
          <div className="relative grid grid-cols-3 gap-4 sm:gap-8" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="shelf pb-px">
                <div className="mx-auto aspect-[5/8] w-[78%] border border-dashed border-line-strong/70" />
              </div>
            ))}
          </div>
          <BlockedAction tone="primary" className="relative mx-auto mt-10 max-w-sm" label="Sign in to see your collection" does="Connects your wallet and loads your cards. From here you can sell back, list, lend, trade or battle." />
        </section>
        <form onSubmit={submit} className="self-start" noValidate>
          <h2 className="shout text-3xl">Look up any collector</h2>
          <label htmlFor="who" className="label mb-3 mt-2 block">Username or wallet address</label>
          <div className="flex gap-2">
            <input
              id="who"
              className="field"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
              placeholder="Username or 0x address"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "who-err" : undefined}
            />
            <button className="btn-quiet" type="submit">View</button>
          </div>
          {error && <p id="who-err" className="mt-2 text-sm text-err">{error}</p>}
          <p className="mt-3 text-xs text-muted">Public collections are live from YourGrails.</p>
        </form>
      </div>
    </>
  );
}
