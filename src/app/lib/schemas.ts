import { z } from "zod";

export const PositionSchema = z.union([
  z.literal("OP"),
  z.literal("MB"),
  z.literal("WS"),
  z.literal("S"),
  z.literal("L"),
]);

export const RaritySchema = z.union([
  z.literal("SR"),
  z.literal("SSR"),
  z.literal("UR"),
  z.literal("SP"),
]);

export const SchoolSchema = z.union([
  z.literal("Shiratorizawa"),
  z.literal("Nekoma"),
  z.literal("Fukurodani"),
  z.literal("Aoba Johsai"),
  z.literal("Inarizaki"),
  z.literal("Kamomedai"),
  z.literal("Karasuno"),
  z.literal("Date Tech"),
  z.literal("Itachiyama"),
  z.literal("Johzenji"),
  z.literal("Kitagawa Daichi"),
]);

export const SkillSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  character_id: z.number().optional(),
  created_at: z.string().optional(),
  type: z.union([z.literal("Normal"), z.literal("Special"), z.string(), z.null()]).optional(),
  category: z.union([z.literal("Active"), z.literal("Passive"), z.string(), z.null()]).optional(),
});

export const BondSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.string().optional(),
  participants: z.array(z.number()).optional(),
  is_team_bond: z.boolean().optional(),
});

export const CharacterBondLinkSchema = z.object({
  character_id: z.number(),
  bond_id: z.number(),
});

export const StatsBondTypeSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  created_at: z.string().optional(),
});

export const CharacterStatsBondSchema = z.object({
  id: z.number(),
  stats_bond_id: z.number(),
  character_id: z.number(),
  buff_description: z.string().nullable(),
  created_at: z.string().optional(),
  stats_bond_name: z.string().optional(),
});

export const CharacterSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.union([PositionSchema, z.string(), z.null()]),
  rarity: z.union([RaritySchema, z.null()]),
  school: z.union([SchoolSchema, z.string(), z.null()]),
  image_url: z.string().nullable(),
  styles: z.array(z.string()).nullable(),
  serve: z.number().nullable(),
  attack: z.number().nullable(),
  set: z.number().nullable(),
  receive: z.number().nullable(),
  block: z.number().nullable(),
  defense: z.number().nullable(),
  created_at: z.string().optional(),
  skills: z.array(SkillSchema).optional(),
  bondIds: z.array(z.number()).optional(),
  bonds: z.array(BondSchema).optional(),
  statsBonds: z.array(CharacterStatsBondSchema).optional(),
  potential: z.object({
    "4slots": z.number().nullable(),
    "2slots": z.number().nullable(),
  }).nullable().optional(),
  recommended_stats: z.object({
    slot1: z.string().optional(),
    slot2: z.string().optional(),
    slot3: z.string().optional(),
    slot4: z.string().optional(),
    slot5: z.string().optional(),
    slot6: z.string().optional(),
  }).nullable().optional(),
  recommended_memories: z.object({
    main: z.string().optional(),
    others: z.array(z.string()).optional(),
  }).nullable().optional(),
  substats: z.string().nullable().optional(),
  resonance: z.object({
    re1: z.string().optional(),
    re2: z.string().optional(),
    re3: z.string().optional(),
    re4: z.string().optional(),
    re5: z.string().optional(),
  }).optional(),
});

export const PotentialSchema = z.object({
  id: z.number(),
  name: z.string(),
  image_url: z.string(),
  catalog_id: z.string(),
  twoPiece: z.record(z.string(), z.object({ pct: z.number() })),
  fourPiece: z.record(z.string(), z.object({ pct: z.number() })),
  desc2: z.string(),
  desc4: z.string(),
});

export const MemorySchema = z.object({
  id: z.string(),
  name: z.string(),
  positions: z.array(z.string()),
  bonus: z.record(z.string(), z.object({ flat: z.number().optional(), pct: z.number().optional() })).optional(),
  desc: z.string(),
  image_url: z.string(),
});

export const ResonanceItemSchema = z.object({
  nivel: z.string(),
  descricao: z.string(),
});

export const ResonanceEntrySchema = z.object({
  character_id: z.number(),
  character: z.string(),
  rarity: z.string(),
  ressonancias: z.array(ResonanceItemSchema),
});
