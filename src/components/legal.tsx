import { PageHead } from "@/components/chrome";

/**
 * Binding legal text must be YourGrails LLC's own, word for word. This build does not restate or summarize it.
 * It links to the governing document until the owner supplies the text for this site.
 */
export function LegalPointer({ title, href, note }: { title: string; href: string; note?: string }) {
  return (
    <>
      <PageHead title={title} />
      <div className="wrap max-w-3xl space-y-4 text-paper-dim">
        <p>
          The current, binding version is published by YourGrails LLC at{" "}
          <a className="link" href={href} rel="noopener noreferrer">{href.replace("https://", "")}</a>.
        </p>
        {note && <p className="text-sm">{note}</p>}
        <p className="text-sm text-muted">This page will carry the full text once YourGrails provides it for this site.</p>
      </div>
    </>
  );
}
