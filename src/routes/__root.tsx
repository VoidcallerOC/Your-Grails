import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { Shell } from "@/components/chrome";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "YourGrails · Real graded cards, sealed in packs" },
      { name: "description", content: "Open sealed packs of real PSA, BGS and CGC graded cards. Keep them in the vault, list them, battle with them or sell them back." },
      // Preview build: keep it out of search until it replaces production.
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#0d0c0b" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/brand/logo.png" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  notFoundComponent: () => (
    <div className="wrap py-20">
      <p className="label mb-3">404</p>
      <h1 className="display text-5xl">Nothing in this slot.</h1>
      <p className="mt-6">
        <Link to="/" className="link">
          Back to YourGrails
        </Link>
      </p>
    </div>
  ),
  component: () => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Shell>
          <Outlet />
        </Shell>
        <Scripts />
      </body>
    </html>
  ),
});
