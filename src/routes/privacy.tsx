import { createFileRoute } from "@tanstack/react-router";
import { LegalPointer } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy · YourGrails" }] }),
  component: () => <LegalPointer title="Privacy Policy" href="https://yourgrails.com/privacy" />,
});
