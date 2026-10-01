import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const NAV: [string, string][] = [
  ["/packs", "Packs"],
  ["/battles", "Battles"],
  ["/market", "Marketplace"],
  ["/trading", "Trading"],
  ["/lending", "Lending"],
  ["/collection", "Collection"],
  ["/leaderboard", "Leaderboard"],
];

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center" aria-label="YourGrails home">
          <img src="/brand/header.png" alt="YourGrails" width={152} height={40} className="h-9 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link
                  to={href}
                  aria-current={isActive(path, href) ? "page" : undefined}
                  className={`block px-3 py-2 text-sm ${isActive(path, href) ? "text-paper" : "text-muted hover:text-paper"}`}
                >
                  {label}
                  {isActive(path, href) && <span className="mt-0.5 block h-px bg-brass" aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/account" className="btn-quiet hidden sm:inline-flex">
            Sign in
          </Link>
          <button
            type="button"
            className="btn-quiet w-11 px-0 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line lg:hidden">
          <ul className="wrap py-2">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link to={href} className="flex min-h-12 items-center border-b border-line text-base last:border-0">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/account" className="flex min-h-12 items-center text-base text-brass">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/** Tells every visitor what this build can and cannot do. */
export function PreviewNotice() {
  return (
    <div className="border-b border-line bg-vault">
      <p className="wrap py-2 text-xs text-paper-dim">
        <span className="font-semibold text-paper">Preview build.</span> Packs, listings, prices and rankings are live from YourGrails.
        Sign-in, purchases and other transactions are switched off here.{" "}
        <Link to="/account" className="link">
          Why
        </Link>
      </p>
    </div>
  );
}

const FOOTER: [string, [string, string][]][] = [
  ["Play", [["/packs", "Packs"], ["/battles", "Battles"], ["/leaderboard", "Leaderboard"]]],
  ["Market", [["/market", "Marketplace"], ["/trading", "Trading"], ["/lending", "Lending"], ["/collection", "Collection"], ["/redeem", "Redemption"]]],
  ["Help", [["/docs", "How it works"], ["/support", "Support"], ["/terms", "Terms"], ["/privacy", "Privacy"]]],
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap grid grid-cols-1 gap-10 py-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="max-w-sm">
          <img src="/brand/logo.png" alt="YourGrails" width={96} height={96} className="h-16 w-auto" loading="lazy" />
          <p className="mt-4 text-sm text-muted">
            Sealed packs of real graded cards. Every pull is a PSA, BGS or CGC slab held in the vault and owned by you.
          </p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <h2 className="label mb-3">{title}</h2>
            <ul className="space-y-2 text-sm">
              {links.map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="text-paper-dim hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-xs text-muted">
        <span>© YourGrails LLC</span>
        <a href="https://x.com/yourgrails" className="hover:text-paper" rel="noopener noreferrer" target="_blank">
          @yourgrails on X
        </a>
      </div>
    </footer>
  );
}

/** Thin bar while a route loader is fetching from production. Announced once to screen readers. */
function NavProgress() {
  const loading = useRouterState({ select: (s) => s.isLoading });
  return (
    <div aria-live="polite" className="fixed inset-x-0 top-0 z-50 h-0.5">
      {loading && (
        <>
          <span className="sr-only">Loading</span>
          <div className="nav-progress h-full bg-brass" />
        </>
      )}
    </div>
  );
}

/** Shown in the outlet when a route takes longer than the pending threshold. */
export function RoutePending() {
  return (
    <div className="wrap py-16" role="status">
      <p className="label">Loading from YourGrails…</p>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <NavProgress />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <PreviewNotice />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHead({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="wrap pb-8 pt-10 sm:pt-14">
      {kicker && <p className="label mb-3">{kicker}</p>}
      <h1 className="display text-5xl sm:text-6xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-paper-dim">{children}</div>}
    </div>
  );
}
