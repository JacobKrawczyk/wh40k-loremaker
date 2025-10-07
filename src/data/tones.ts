// Lightweight curated tone presets for consistent narrative voice.

export type ToneKey =
  | "grimdark"
  | "guard_trench"
  | "ecclesiarchal"
  | "inquisitorial"
  | "mechanicus"
  | "knightly"
  | "rogue_trader"
  | "arbites"
  | "aeldari_elegy"
  | "drukhari"
  | "ynnari"
  | "tau_propaganda"
  | "orks"
  | "necron"
  | "tyranid"
  | "gsc"
  | "chaos_undivided"
  | "khorne"
  | "nurgle"
  | "tzeentch"
  | "slaanesh"
  | "hive_noir"
  | "void_gothic"
  | "blackstone"
  | "deathworld";

export type ToneDef = {
  key: ToneKey;
  label: string;         // what users see in the dropdown
  description: string;   // short tooltip/hover text (future use)
  bestFor?: string[];    // optional hints
  sampleLexicon?: string[];
};

export const TONES: ToneDef[] = [
  { key: "grimdark", label: "Grimdark (Baseline)", description: "Bleak duty and fatalism.", bestFor: ["Mixed Imperium", "Any"] },
  { key: "guard_trench", label: "Astra Militarum Trench", description: "Barked orders; mud and shellfire.", bestFor: ["Astra Militarum"] },
  { key: "ecclesiarchal", label: "Ecclesiarchal Hymnal", description: "Liturgical zeal; martyrdom.", bestFor: ["Adepta Sororitas"] },
  { key: "inquisitorial", label: "Inquisitorial Dossier", description: "Clipped, redacted, threatening subtext." },
  { key: "mechanicus", label: "Mechanicus Cant", description: "Techno-liturgical; binharic asides.", bestFor: ["Adeptus Mechanicus"] },
  { key: "knightly", label: "Knightly Lament", description: "Oaths, lineages, doom-bound honor.", bestFor: ["Imperial/Chaos Knights"] },
  { key: "rogue_trader", label: "Rogue-Trader Baroque", description: "Void pomp; gilt-edged bravado." },
  { key: "arbites", label: "Arbites Edict", description: "Civic oppression and legalese." },

  { key: "aeldari_elegy", label: "Aeldari Elegy", description: "Poetic fatalism; age-worn grief.", bestFor: ["Craftworlds/Exodites"] },
  { key: "drukhari", label: "Drukhari Masquerade", description: "Cruel decadence, stage venom." },
  { key: "ynnari", label: "Ynnari Funereal Resolve", description: "Hush and renewal through death." },
  { key: "tau_propaganda", label: "T’au Propaganda", description: "Uplift-jargon; sanitized conquest." },
  { key: "orks", label: "Ork Loudmouthed Brutal", description: "Gleeful krumpin’ and dakka." },
  { key: "necron", label: "Necron Dynastic Edict", description: "Cold disdain; eternity calculus." },
  { key: "tyranid", label: "Tyranid Predatory Clinical", description: "Detached biology; hive imperatives." },
  { key: "gsc", label: "Genestealer Cult Cant", description: "Whispered revolution; family/faith." },

  { key: "chaos_undivided", label: "Chaos Undivided Sermon", description: "Blasphemous triumphalism." },
  { key: "khorne", label: "Khorne War-Chant", description: "Terse, percussive, blood-oaths." },
  { key: "nurgle", label: "Nurgle Rot-Pastoral", description: "Sickly cheer; decay as bounty." },
  { key: "tzeentch", label: "Tzeentch Esoteric", description: "Riddles and inevitability." },
  { key: "slaanesh", label: "Slaanesh Decadent", description: "Sensory excess; perfection mania." },

  { key: "hive_noir", label: "Hive-Noir", description: "Smog, neon, informants and rot." },
  { key: "void_gothic", label: "Void-Gothic Naval", description: "Bells, auspex, keel-prayers." },
  { key: "blackstone", label: "Blackstone Geometric", description: "Sterile angles; null-tone." },
  { key: "deathworld", label: "Death-World Survivalist", description: "Weather and flora as enemies." },
];

// Tiny helpers (optional)
export const toneOptions = () => TONES.map(t => ({ value: t.key, label: t.label }));
export const toneLabelFromKey = (key?: string) => TONES.find(t => t.key === key)?.label ?? key ?? "";
