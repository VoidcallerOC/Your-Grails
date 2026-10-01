import { Link, useRouterState } from "@tanstack/react-router";
import { Gem, Menu, Package, Store, Swords, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/** Primary destinations, in collector verbs. Lending and the rest live under More / the footer. */
const NAV: [string, string][] = [
  ["/packs", "Packs"],
  ["/market", "Market"],
  ["/battles", "Battles"],
  ["/trading", "Trade"],
  ["/lending", "Lend"],
  ["/leaderboard", "Leaderboard"],
];

const TABS: [string, string, typeof Package][] = [
  ["/packs", "Packs", Package],
  ["/market", "Market", Store],
  ["/battles", "Battles", Swords],
  ["/collection", "Vault", Gem],
];

const MORE: [string, string][] = [
  ["/trading", "Trade cards"],
  ["/lending", "Lend & borrow"],
  ["/leaderboard", "Leaderboard"],
  ["/redeem", "Ship a slab home"],
  ["/docs", "How it works"],
  ["/support", "Support"],
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
];

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

function Wordmark({ className }: { className: string }) {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="YourGrails home">
      <img src="/brand/wordmark.svg" alt="YourGrails" width={152} height={32} className={`${className} w-auto`} />
    </Link>
  );
}

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/90 backdrop-blur-md">
      <div className="wrap flex h-14 items-center justify-between gap-6 lg:h-16">
        <Wordmark className="h-6 lg:h-7" />
        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map(([href, label]) => {
              const on = isActive(path, href);
              return (
                <li key={href}>
                  <Link
                    to={href}
                    aria-current={on ? "page" : undefined}
                    className={`relative block px-3 py-2 font-display text-[15px] font-semibold tracking-[0.01em] transition-colors ${on ? "text-gold" : "text-paper-dim hover:text-paper"}`}
                  >
                    {label}
                    {on && <span className="absolute inset-x-3 -bottom-[13px] h-[2px] -skew-x-[30deg] bg-gold" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/collection"
            aria-current={isActive(path, "/collection") ? "page" : undefined}
            className="hidden items-center gap-2 px-3 py-2 font-display text-[15px] font-semibold text-paper-dim hover:text-paper lg:flex"
          >
            <Gem size={16} aria-hidden="true" /> Vault
          </Link>
          <Link to="/account" className="btn-primary min-h-9 px-4 text-sm">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

/** One-handed navigation on phones: the four things collectors do most, plus everything else in a sheet. */
function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More">
          <button type="button" className="absolute inset-0 bg-ink/70 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="cut absolute inset-x-2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] bg-vault p-2">
            <ul>
              {MORE.map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="flex min-h-12 items-center px-3 font-display text-[17px] font-semibold text-paper hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map(([href, label, Icon]) => {
            const on = isActive(path, href);
            return (
              <li key={href}>
                <Link to={href} aria-current={on ? "page" : undefined} className={`flex h-16 flex-col items-center justify-center gap-1 font-display text-[12px] font-semibold ${on ? "text-gold" : "text-muted"}`}>
                  <Icon size={21} aria-hidden="true" strokeWidth={on ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className={`flex h-16 w-full flex-col items-center justify-center gap-1 font-display text-[12px] font-semibold ${open ? "text-gold" : "text-muted"}`}
            >
              {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

/** Tells every visitor what this build can and cannot do. */
export function PreviewNotice() {
  return (
    <div className="border-b border-line/70 bg-velvet">
      <p className="wrap py-1.5 text-[12px] text-muted">
        <span className="font-semibold text-paper-dim">Preview build.</span>{" "}
        <span className="hidden sm:inline">Packs, listings, prices and rankings are live from YourGrails. Sign-in, purchases and other transactions are switched off here.</span>
        <span className="sm:hidden">Live data. Sign-in and purchases are off.</span>{" "}
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
    <footer className="mt-28 border-t border-line bg-velvet">
      <div className="wrap grid grid-cols-3 gap-x-6 gap-y-10 py-14 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-3 max-w-sm md:col-span-1">
          <img src="/brand/lockup.svg" alt="YourGrails: Rip, Battle, Grail" width={240} height={66} className="h-14 w-auto" loading="lazy" />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Sealed packs of real graded cards. Every pull is a PSA, BGS or CGC slab held in the vault and owned by you.
          </p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <h2 className="mb-3 font-display text-sm font-semibold text-paper">{title}</h2>
            <ul className="space-y-2 text-sm">
              {links.map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="text-paper-dim hover:text-gold">
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
    <div aria-live="polite" className="fixed inset-x-0 top-0 z-[60] h-0.5">
      {loading && (
        <>
          <span className="sr-only">Loading</span>
          <div className="nav-progress h-full bg-gold" />
        </>
      )}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <NavProgress />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <PreviewNotice />
      <SiteHeader />
      <main id="main">
        {children}
      </main>
      <SiteFooter />
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <TabBar />
    </>
  );
}

/**
 * Page title as a statement: the wordmark's forward-leaning italic.
 * `eyebrow` is a short live or contextual line above it; `note` is a status beside it (e.g. "Coming soon").
 */
export function PageHead({ eyebrow, note, title, children, aside }: { eyebrow?: ReactNode; note?: string; title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="wrap flex flex-col gap-6 pb-10 pt-10 sm:pt-14 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="shout text-[2.6rem] sm:text-6xl">
          {title}
          {note && <span className="ml-3 inline-block translate-y-[-0.35em] bg-raised px-2.5 py-1 align-middle font-sans text-xs font-medium not-italic tracking-normal text-paper-dim cut-sm">{note}</span>}
        </h1>
        {children && <div className="mt-4 max-w-2xl text-[16px] leading-relaxed text-paper-dim">{children}</div>}
      </div>
      {aside}
    </div>
  );
}
