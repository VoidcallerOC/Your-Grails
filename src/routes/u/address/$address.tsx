import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProfileView } from "@/components/profile-view";
import { getProfile } from "@/lib/api";
import { isAddress } from "@/lib/normalize";

export const Route = createFileRoute("/u/address/$address")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Number(s.page) > 0 ? Math.floor(Number(s.page)) : 1 }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ params, deps }) => {
    if (!isAddress(params.address)) throw notFound();
    return getProfile({ data: { address: params.address, page: deps.page } });
  },
  head: () => ({ meta: [{ title: "Collector · YourGrails" }] }),
  component: AddressProfile,
});

function AddressProfile() {
  return <ProfileView {...Route.useLoaderData()} />;
}
