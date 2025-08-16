import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">
        WH40k LoreMaker
      </h1>

      <p className="mt-4 text-lg text-black/70">
        Generate lore-accurate Warhammer 40,000 narrative scenarios before and after your games.
        Define factions, alliances, personal stakes, and get objectives with a built-in
        Resonance Points (RP = campaign currency) system.
      </p>

      <div className="mt-8">
        <Link
          href="/scenario"
          className="inline-block rounded-lg border border-black bg-black px-5 py-2.5 text-white transition hover:bg-white hover:text-black"
        >
          Open Scenario Generator
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">What it does</h2>
          <ul className="mt-3 list-disc pl-5 text-black/75">
            <li>Pre-battle dossier with overarching hook</li>
            <li>Faction motives & canon-plausible alliances</li>
            <li>Matched-play + narrative objectives</li>
            <li>Risk scores (1–5) for objectives</li>
          </ul>
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Campaign rules baked in</h2>
          <ul className="mt-3 list-disc pl-5 text-black/75">
            <li>Resonance Points (RP) economy</li>
            <li>+3 RP for narrative objective, +1 RP for VP win</li>
            <li>Opponent-agreed cinematic moments (+1 RP)</li>
            <li>Spend RP for CGP (campaign game points) & perks</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
