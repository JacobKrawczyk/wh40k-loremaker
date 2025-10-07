// appui/src/components/campaign/MembersPanel.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  campaign_id: string;
  user_id: string;
  role: "owner" | "player";
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
};

export default function MembersPanel({
  campaignId,
  currentUserId,
  isOwner,
  members,
}: {
  campaignId: string;
  currentUserId: string;
  isOwner: boolean;
  members: Member[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [list, setList] = useState(members);

  const onKick = async (userId: string) => {
    if (!confirm("Remove this member from the campaign?")) return;
    setBusyId(userId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(`Failed to remove member.\n${txt || res.statusText}`);
        return;
      }
      setList((prev) => prev.filter((m) => m.user_id !== userId));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="bg-black/60 border-white/10 text-white">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members</h2>
          {!isOwner ? (
            <div className="text-xs opacity-70">Only the owner can remove members.</div>
          ) : null}
        </div>

        <ul className="divide-y divide-white/10">
          {list.map((m) => {
            const you = m.user_id === currentUserId;
            const canKick = isOwner && m.role !== "owner" && !you;
            return (
              <li key={m.user_id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
                    {m.avatar_url ? (
                      <Image
                        alt={m.display_name || m.user_id}
                        src={m.avatar_url}
                        width={32}
                        height={32}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">
                      {m.display_name || <span className="opacity-70">{m.user_id}</span>}
                      {you ? <span className="ml-2 rounded bg-white/10 px-1 text-xs">you</span> : null}
                    </div>
                    <div className="text-xs opacity-70">
                      {m.role === "owner" ? "Owner" : "Player"} •{" "}
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  {canKick ? (
                    <Button
                      variant="outline"
                      className="border-red-400/40 text-red-200 hover:bg-red-500/10"
                      onClick={() => onKick(m.user_id)}
                      disabled={busyId === m.user_id}
                    >
                      {busyId === m.user_id ? "Removing..." : "Remove"}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
