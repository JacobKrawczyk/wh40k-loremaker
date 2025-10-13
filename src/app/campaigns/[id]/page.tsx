// appui/src/app/campaigns/[id]/page.tsx
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import ScenariosPanel from "./ScenariosPanel"; // you already have this
import MembersPanel from "@/components/campaign/MembersPanel";

export const dynamic = "force-dynamic";

type CampaignRow = {
  id: string;
  name: string;
  tone: string | null;
  mode: "interplanetary" | "sequential-claim";
  code: string;
  created_at: string;
  created_by: string;
};

type MemberRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  role: "owner" | "player";
  created_at: string;
};

type ProfileRow = {
  id: string; // user_id
  display_name: string | null;
  avatar_url: string | null;
};

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=/campaigns/${id}`);
  }

  // RLS: returns row only if requester is member (or owner)
  const { data: campaign, error: cErr } = await supabase
    .from("campaigns")
    .select("id,name,tone,mode,code,created_at,created_by")
    .eq("id", id)
    .maybeSingle();

  if (cErr) {
    // if RLS blocked, we’ll get null too
    redirect("/campaigns");
  }
  if (!campaign) {
    notFound();
  }

  // Members (simple 2-step fetch to avoid complex FK join)
  const { data: members, error: mErr } = await supabase
    .from("campaign_members")
    .select("id,campaign_id,user_id,role,created_at")
    .eq("campaign_id", id)
    .order("created_at", { ascending: true });

  if (mErr) {
    // Don’t hard fail the whole page — render with empty list
    // But you can choose to throw if you prefer.
  }

  const userIds = (members ?? []).map((m) => m.user_id);
  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      // alias username -> display_name for UI compatibility
      .select("id,display_name:username,avatar_url")
      .in("id", userIds);
    profiles = (profs as ProfileRow[]) ?? [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const isOwner = user.id === campaign.created_by;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{campaign.name}</h1>
          <div className="text-xs opacity-70">
            {campaign.mode === "interplanetary" ? "Interplanetary" : "Conquest"} • Invite code:{" "}
            <span className="font-mono">{campaign.code}</span> •{" "}
            {new Date(campaign.created_at).toLocaleString()}
            {campaign.tone ? ` • Tone: ${campaign.tone}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/campaigns">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Back
            </Button>
          </Link>
          {/* Copy code */}
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={async () => {
              "use client";
              await navigator.clipboard.writeText(campaign.code);
            }}
          >
            Copy Invite
          </Button>
          {/* Danger Zone goes elsewhere later (menu) */}
        </div>
      </div>

      {/* Members */}
      <MembersPanel
        campaignId={campaign.id}
        currentUserId={user.id}
        isOwner={isOwner}
        members={(members ?? []).map((m) => ({
          ...m,
          display_name: profileMap.get(m.user_id)?.display_name ?? null,
          avatar_url: profileMap.get(m.user_id)?.avatar_url ?? null,
        }))}
      />

      {/* Scenarios + Drafts */}
      <ScenariosPanel campaignId={campaign.id} />
    </div>
  );
}
