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
      <PageHead kicker="Collection" title="Your slabs">
        Your collection lists every card token in your wallet, one slab per token: grade, cert, value, buyback window and what you can
        do with it. It needs you signed in.
      </PageHead>
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-2">
        <BlockedAction label="Sign in to see your collection" does="Connects your wallet and loads your cards. From here you can sell back, list, lend, trade or battle." />
        <form onSubmit={submit} className="panel p-4" noValidate>
          <label htmlFor="who" className="label mb-2 block">Look up any collector</label>
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
