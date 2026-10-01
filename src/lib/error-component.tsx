import { Link, type ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const message = error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
  return (
    <div className="wrap py-20">
      <p className="label mb-3">Error</p>
      <h1 className="display text-4xl">This page didn't load.</h1>
      <p className="mt-3 max-w-xl text-paper-dim">{message}</p>
      <p className="mt-6">
        <Link to="/" className="link">
          Back to YourGrails
        </Link>
      </p>
    </div>
  );
}
