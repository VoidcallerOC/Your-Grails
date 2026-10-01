import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ProfileView } from "@/components/profile-view";
import { getProfile } from "@/lib/api";
import { isAddress } from "@/lib/normalize";

export const Route = createFileRoute("/u/address/$address")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Number(s.page) > 0 ? Math.floor(Number(s.page)) : 1 }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    if (!isAddress(params.address)) throw notFound();
    const result = await getProfile({ data: { address: params.address, page: deps.page } });
    // Production behavior: an address with a username lives at /u/<username>.
    const username = result.profile.ok ? result.profile.data?.username : undefined;
    if (username) throw redirect({ to: "/u/$username", params: { username }, search: { page: deps.page }, statusCode: 307 });
    return result;
  },
  head: () => ({ meta: [{ title: "Collector · YourGrails" }] }),
  component: AddressProfile,
});

function AddressProfile() {
  return <ProfileView {...Route.useLoaderData()} />;
}
