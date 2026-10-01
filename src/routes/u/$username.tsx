import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "@/components/profile-view";
import { getProfile } from "@/lib/api";

export const Route = createFileRoute("/u/$username")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Number(s.page) > 0 ? Math.floor(Number(s.page)) : 1 }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ params, deps }) => getProfile({ data: { username: params.username, page: deps.page } }),
  head: ({ params }) => ({ meta: [{ title: `${params.username} · YourGrails` }] }),
  component: UsernameProfile,
});

function UsernameProfile() {
  return <ProfileView {...Route.useLoaderData()} />;
}
