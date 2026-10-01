import { createFileRoute } from "@tanstack/react-router";
import { LegalPointer } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service · YourGrails" }] }),
  component: () => (
    <LegalPointer
      title="Terms of Service"
      href="https://yourgrails.com/terms"
      note="Those terms cover packs, battles (21+), the buyback option, the marketplace, redemption, fees and arbitration."
    />
  ),
});
