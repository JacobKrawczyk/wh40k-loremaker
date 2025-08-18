// FILE: src/data/factions.ts
import type { FactionDef } from "@/lib/types";

export const FACTIONS: FactionDef[] = [
  {
    key: "space-marines",
    name: "Adeptus Astartes (Space Marines)",
    allegiance: "Imperium",
    subfactions: [
      { key: "ultramarines", name: "Ultramarines" },
      { key: "imperial-fists", name: "Imperial Fists" },
      { key: "blood-angels", name: "Blood Angels" },
      { key: "dark-angels", name: "Dark Angels" },
      { key: "salamanders", name: "Salamanders" },
      { key: "raven-guard", name: "Raven Guard" },
      { key: "white-scars", name: "White Scars" },
    ],
  },
  {
    key: "astra-militarum",
    name: "Astra Militarum",
    allegiance: "Imperium",
    subfactions: [
      { key: "cadian", name: "Cadian" },
      { key: "catachan", name: "Catachan" },
      { key: "krieg", name: "Death Korps of Krieg" },
      { key: "valhallan", name: "Valhallan" },
      { key: "tallarn", name: "Tallarn" },
    ],
  },
  {
    key: "adeptus-mechanicus",
    name: "Adeptus Mechanicus",
    allegiance: "Imperium",
    subfactions: [
      { key: "mars", name: "Forge World: Mars" },
      { key: "ryza", name: "Forge World: Ryza" },
      { key: "metalica", name: "Forge World: Metalica" },
      { key: "graia", name: "Forge World: Graia" },
    ],
  },
  {
    key: "agents-of-the-imperium",
    name: "Agents of the Imperium",
    allegiance: "Agents of the Imperium",
    subfactions: [
      { key: "ordo-malleus", name: "Inquisition: Ordo Malleus" },
      { key: "ordo-xenos", name: "Inquisition: Ordo Xenos" },
      { key: "ordo-hereticus", name: "Inquisition: Ordo Hereticus" },
      { key: "rogue-traders", name: "Rogue Traders" },
    ],
  },

  {
    key: "craftworld-aeldari",
    name: "Craftworld Aeldari",
    allegiance: "Aeldari",
    subfactions: [
      { key: "ulthwe", name: "Ulthwé" },
      { key: "biel-tan", name: "Biel-Tan" },
      { key: "saim-hann", name: "Saim-Hann" },
      { key: "iyanden", name: "Iyanden" },
      { key: "alaitoc", name: "Alaitoc" },
    ],
  },
  {
    key: "ynnari",
    name: "Ynnari",
    allegiance: "Ynnari",
    subfactions: [
      { key: "reborn", name: "The Reborn" },
      { key: "yvraines-host", name: "Yvraine’s Host" },
    ],
  },
  {
    key: "drukhari",
    name: "Drukhari",
    allegiance: "Drukhari",
    subfactions: [
      { key: "kabal-of-the-black-heart", name: "Kabal of the Black Heart" },
      { key: "cult-of-strife", name: "Wych Cult of Strife" },
      { key: "haemonculus-prophets-of-flesh", name: "Prophets of Flesh" },
    ],
  },

  {
    key: "necrons",
    name: "Necrons",
    allegiance: "Necrons",
    subfactions: [
      { key: "sautekh", name: "Sautekh Dynasty" },
      { key: "mephrit", name: "Mephrit Dynasty" },
      { key: "novokh", name: "Novokh Dynasty" },
      { key: "nihilakh", name: "Nihilakh Dynasty" },
    ],
  },

  {
    key: "orks",
    name: "Orks",
    allegiance: "Orks",
    subfactions: [
      { key: "goffs", name: "Goffs" },
      { key: "evil-sunz", name: "Evil Sunz" },
      { key: "bad-moons", name: "Bad Moons" },
      { key: "deathskulls", name: "Deathskulls" },
      { key: "snakebites", name: "Snakebites" },
      { key: "blood-axes", name: "Blood Axes" },
    ],
  },

  {
    key: "tau-empire",
    name: "T’au Empire",
    allegiance: "T'au",
    subfactions: [
      { key: "tau-sept", name: "T’au Sept" },
      { key: "viorla", name: "Vior’la" },
      { key: "dal-yeth", name: "Dal’yth" },
      { key: "sa-cea", name: "Sa’cea" },
      { key: "bork-an", name: "Bork’an" },
      { key: "farsight-enclaves", name: "Farsight Enclaves" },
    ],
  },

  {
    key: "tyranids",
    name: "Tyranids",
    allegiance: "Tyranids",
    subfactions: [
      { key: "behemoth", name: "Hive Fleet Behemoth" },
      { key: "kraken", name: "Hive Fleet Kraken" },
      { key: "leviathan", name: "Hive Fleet Leviathan" },
      { key: "gorgon", name: "Hive Fleet Gorgon" },
      { key: "jormungandr", name: "Hive Fleet Jormungandr" },
      { key: "kronos", name: "Hive Fleet Kronos" },
    ],
  },
  {
    key: "genestealer-cults",
    name: "Genestealer Cults",
    allegiance: "Genestealer Cults",
    subfactions: [
      { key: "four-armed-emperor", name: "The Four-Armed Emperor" },
      { key: "twisted-helix", name: "The Twisted Helix" },
      { key: "rusted-claw", name: "The Rusted Claw" },
      { key: "pauper-princes", name: "The Pauper Princes" },
    ],
  },

  {
    key: "chaos-space-marines",
    name: "Chaos Space Marines",
    allegiance: "Chaos",
    subfactions: [
      { key: "black-legion", name: "Black Legion" },
      { key: "world-eaters", name: "World Eaters" },
      { key: "emperors-children", name: "Emperor's Children" },
      { key: "death-guard", name: "Death Guard" },
      { key: "thousand-sons", name: "Thousand Sons" },
      { key: "alpha-legion", name: "Alpha Legion" },
      { key: "iron-warriors", name: "Iron Warriors" },
      { key: "night-lords", name: "Night Lords" },
      { key: "word-bearers", name: "Word Bearers" },
    ],
  },
];
