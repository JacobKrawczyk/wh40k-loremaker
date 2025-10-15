import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CreateCampaignForm from "@/components/campaign/CreateCampaignForm";
import JoinCampaignForm from "@/components/campaign/JoinCampaignForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CampaignRow = {
  id: string;
  name: string;
  tone: string | null;
  mode: "interplanetary" | "sequential-claim";
  code: string;
  created_at: string;
};

export default async function CampaignsPage() {
  // Gate by auth
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/campaigns");
  }

  // With RLS, this returns only campaigns the user can see (is a member/owner)
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name, tone, mode, code, created_at")
    .order("created_at", { ascending: false });

  const campaigns = (data ?? []) as CampaignRow[];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <form action="/auth/sign-out" method="post">\n          <Button type="submit" variant="outline" className="border-white/30 text-white hover:bg-white/10">\n            Sign out\n          </Button>\n        </form>
      </header>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <CreateCampaignForm />
        <JoinCampaignForm />
      </div>

      {/* List */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">My campaigns</h2>
        {error ? (
          <p className="text-red-300">Failed to load campaigns: {error.message}</p>
        ) : campaigns.length === 0 ? (
          <p className="text-white/70">You havenâ€™t joined or created any campaigns yet.</p>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id} className="bg-black/60 border-white/10 text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="text-xs opacity-70">
                    {c.mode === "interplanetary" ? "Interplanetary" : "Conquest"} â€¢ Invite code:{" "}
                    <span className="font-mono">{c.code}</span> â€¢{" "}
                    {new Date(c.created_at).toLocaleString()}
                    {c.tone ? ` â€¢ Tone: ${c.tone}` : ""}
                  </div>
                </div>
                <Link href={`/campaigns/${c.id}`}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Open
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
