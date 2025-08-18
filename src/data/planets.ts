import type { PlanetDef } from "@/lib/types";

export const PLANETS: PlanetDef[] = [
  {
    key: "terra",
    name: "Holy Terra",
    segmentum: "Solar",
    biomes: ["Hive", "Urban"],
    primaryAllegiances: ["Imperium"],
    keywords: ["capital", "throne", "sol"],
    notes: "Seat of the Imperium."
  },
  {
    key: "mars",
    name: "Mars",
    segmentum: "Solar",
    biomes: ["Forge", "Desert"],
    primaryAllegiances: ["Imperium"],
    keywords: ["mechanicus", "forge world", "sol"],
    notes: "Adeptus Mechanicus domain."
  },
  {
    key: "necromunda",
    name: "Necromunda",
    segmentum: "Solar",
    biomes: ["Hive", "Forge", "Urban"],
    primaryAllegiances: ["Imperium"],
    keywords: ["hive world", "underhive"],
    notes: "Industrial hive world of the Segmentum Solar."
  },
  {
    key: "armageddon",
    name: "Armageddon",
    segmentum: "Solar",
    biomes: ["Hive", "Forge", "Urban"],
    primaryAllegiances: ["Imperium", "Orks", "Chaos"],
    keywords: ["warzone", "steel legion"],
    notes: "Repeated Ork and Chaos invasions; eternal warzone."
  },
  {
    key: "cadia",
    name: "Cadia",
    segmentum: "Obscurus",
    biomes: ["Ruin", "Tundra"],
    primaryAllegiances: ["Imperium", "Chaos"],
    keywords: ["gate", "eye of terror"],
    notes: "World-broken during the 13th Black Crusade; relics and debris fields remain."
  },
  {
    key: "fenris",
    name: "Fenris",
    segmentum: "Obscurus",
    biomes: ["Frozen", "Oceanic", "Volcanic"],
    primaryAllegiances: ["Imperium"],
    keywords: ["space wolves", "ice", "volcano"],
    notes: "Harsh home of the Space Wolves."
  },
  {
    key: "valhalla",
    name: "Valhalla",
    segmentum: "Obscurus",
    biomes: ["Frozen", "Urban"],
    primaryAllegiances: ["Imperium"],
    keywords: ["ice world", "astra militarum"],
    notes: "Ice world famed for stoic regiments."
  },
  {
    key: "krieg",
    name: "Krieg",
    segmentum: "Tempestus",
    biomes: ["Death World", "Ruin"],
    primaryAllegiances: ["Imperium"],
    keywords: ["siege", "astra militarum"],
    notes: "Radiated, war-scarred manufactoria and trenches."
  },
  {
    key: "tallarn",
    name: "Tallarn",
    segmentum: "Ultima",
    biomes: ["Desert"],
    primaryAllegiances: ["Imperium"],
    keywords: ["desert", "armoured warfare"],
    notes: "Vast dunes; famed armoured regiments."
  },
  {
    key: "macragge",
    name: "Macragge",
    segmentum: "Ultima",
    biomes: ["Tundra", "Urban"],
    primaryAllegiances: ["Imperium"],
    keywords: ["ultramar", "ultramarines"],
    notes: "Capital world of Ultramar."
  },
  {
    key: "baal",
    name: "Baal",
    segmentum: "Ultima",
    biomes: ["Desert", "Ruin"],
    primaryAllegiances: ["Imperium", "Tyranids"],
    keywords: ["blood angels", "devastated"],
    notes: "Devastated by Tyranid invasions."
  },
  {
    key: "tau",
    name: "T'au",
    segmentum: "Ultima",
    biomes: ["Agri", "Urban"],
    primaryAllegiances: ["T'au"],
    keywords: ["damocles", "sept"],
    notes: "Core world of the T'au Empire."
  },
  {
    key: "nocturne",
    name: "Nocturne",
    segmentum: "Ultima",
    biomes: ["Volcanic"],
    primaryAllegiances: ["Imperium"],
    keywords: ["salamanders", "volcano"],
    notes: "Volcanic home world of the Salamanders."
  }
];
