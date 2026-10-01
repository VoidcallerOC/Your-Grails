import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProfileView } from "@/components/profile-view";
import { getProfile } from "@/lib/api";

export const Route = createFileRoute("/u/$username")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Number(s.page) > 0 ? Math.floor(Number(s.page)) : 1 }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    const data = await getProfile({ data: { username: params.username, page: deps.page } });
    // Production answers 404 "User not found" for unknown usernames (observed 2026-10-01).
    if (!data.profile.ok && data.profile.status === 404) throw notFound();
    return data;
  },
  head: ({ params }) => ({ meta: [{ title: `${params.username} · YourGrails` }] }),
  component: UsernameProfile,
});

function UsernameProfile() {
  return <ProfileView {...Route.useLoaderData()} />;
}
