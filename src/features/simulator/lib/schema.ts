import { z } from "zod";
import { defaultMissionId } from "@/features/simulator/data/missions";

const materialIds = [
  "aluminum",
  "steel",
  "copper",
  "stainless",
  "plastic",
  "composite-panel"
] as const;

const legacyMaterialIds = ["aluminum", "steel", "copper", "stainless", "plastic"] as const;

const openingPatterns = [
  "sealed",
  "two-round",
  "four-round",
  "slot-array",
  "honeycomb-one",
  "honeycomb-two",
  "wbc-vent-one"
] as const;

const legacyOpeningPatterns = ["sealed", "two-round", "four-round", "slot-array"] as const;

const cablePlans = [
  "none",
  "single-filtered",
  "single-raw",
  "multi-raw",
  "integrated-filter-panel-one"
] as const;

const previousCablePlans = [
  "none",
  "single-filtered",
  "single-raw",
  "multi-raw",
  "fiber-one",
  "wbc-nonconductive-one",
  "integrated-filter-panel-one"
] as const;

const legacyCablePlans = ["none", "single-filtered", "single-raw", "multi-raw"] as const;

const panelJointPlans = ["basic-bolted", "dense-bolted", "continuous-welded"] as const;
const doorPlans = [
  "basic-bolted-no-gasket",
  "dense-bolted-no-gasket",
  "dense-bolted-conductive-gasket"
] as const;
const bondingPlans = [
  "none",
  "basic",
  "multipoint",
  "single-point-basic",
  "single-point-multipoint",
  "single-point-braided"
] as const;

const legacySeamPlans = ["basic-bolted", "dense-bolted", "conductive-gasket"] as const;
const legacyBondingPlans = ["none", "basic", "multipoint"] as const;
const missionIds = ["server-room", "storage-room", "occupied-room"] as const;

const entryAddonsSchema = z.object({
  filteredPower: z.boolean(),
  filteredSignal: z.boolean(),
  fiberSignal: z.boolean(),
  wbcNonconductive: z.boolean()
});

const previousEntryAddonsSchema = z.object({
  filteredPower: z.boolean(),
  fiberSignal: z.boolean(),
  wbcNonconductive: z.boolean()
});

export const designSchema = z.object({
  materialId: z.enum(materialIds).nullable(),
  thicknessMm: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  openingPattern: z.enum(openingPatterns),
  cablePlan: z.enum(cablePlans),
  entryAddons: entryAddonsSchema,
  panelJointPlan: z.enum(panelJointPlans),
  doorPlan: z.enum(doorPlans),
  bondingPlan: z.enum(bondingPlans)
});

export const previousDesignSchema = z.object({
  materialId: z.enum(materialIds).nullable(),
  thicknessMm: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  openingPattern: z.enum(openingPatterns),
  cablePlan: z.enum(previousCablePlans),
  entryAddons: previousEntryAddonsSchema.optional(),
  panelJointPlan: z.enum(panelJointPlans),
  doorPlan: z.enum(doorPlans),
  bondingPlan: z.enum(bondingPlans)
});

export const legacyDesignSchema = z.object({
  materialId: z.enum(legacyMaterialIds).nullable(),
  thicknessMm: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  openingPattern: z.enum(legacyOpeningPatterns),
  cablePlan: z.enum(legacyCablePlans),
  seamPlan: z.enum(legacySeamPlans),
  bondingPlan: z.enum(legacyBondingPlans)
});

export const exportPayloadSchema = z.object({
  version: z.literal(7),
  exportedAt: z.string(),
  design: designSchema
});

export const previousCurrentExportPayloadSchema = z.object({
  version: z.literal(6),
  exportedAt: z.string(),
  missionId: z.enum(missionIds),
  design: designSchema
});

export const previousExportPayloadSchema = z.object({
  version: z.literal(5),
  exportedAt: z.string(),
  missionId: z.enum(missionIds),
  design: previousDesignSchema
});

export const olderExportPayloadSchema = z.object({
  version: z.literal(4),
  exportedAt: z.string(),
  missionId: z.enum(missionIds),
  design: previousDesignSchema.omit({ entryAddons: true }).extend({})
});

export const missionlessExportPayloadSchema = z.object({
  version: z.literal(3),
  exportedAt: z.string(),
  design: previousDesignSchema.omit({ entryAddons: true }).extend({})
});

export const legacyExportPayloadSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string(),
  design: legacyDesignSchema
});

export type DesignSchema = z.infer<typeof designSchema>;
export type PreviousDesignSchema = z.infer<typeof previousDesignSchema>;
export type LegacyDesignSchema = z.infer<typeof legacyDesignSchema>;

function getEmptyEntryAddons() {
  return {
    filteredPower: false,
    filteredSignal: false,
    fiberSignal: false,
    wbcNonconductive: false
  };
}

export function migratePreviousDesign(previous: PreviousDesignSchema): DesignSchema {
  const next = getEmptyEntryAddons();

  if (previous.entryAddons?.filteredPower) {
    next.filteredPower = true;
  }

  if (previous.entryAddons?.fiberSignal) {
    next.fiberSignal = true;
  }

  if (previous.entryAddons?.wbcNonconductive) {
    next.wbcNonconductive = true;
  }

  if (previous.cablePlan === "single-filtered") {
    next.filteredPower = next.filteredPower || true;
  }

  if (previous.cablePlan === "integrated-filter-panel-one") {
    next.filteredPower = next.filteredPower || true;
    next.filteredSignal = true;
  }

  if (previous.cablePlan === "fiber-one") {
    next.fiberSignal = true;
  }

  if (previous.cablePlan === "wbc-nonconductive-one") {
    next.wbcNonconductive = true;
  }

  return {
    materialId: previous.materialId,
    thicknessMm: previous.thicknessMm,
    openingPattern: previous.openingPattern,
    cablePlan:
      previous.cablePlan === "fiber-one" || previous.cablePlan === "wbc-nonconductive-one"
        ? "none"
        : previous.cablePlan,
    entryAddons: next,
    panelJointPlan: previous.panelJointPlan,
    doorPlan: previous.doorPlan,
    bondingPlan: previous.bondingPlan
  };
}

export function migrateLegacyDesign(legacy: LegacyDesignSchema): DesignSchema {
  const next = getEmptyEntryAddons();

  if (legacy.cablePlan === "single-filtered") {
    next.filteredPower = true;
  }

  return {
    materialId: legacy.materialId,
    thicknessMm: legacy.thicknessMm,
    openingPattern: legacy.openingPattern,
    cablePlan: legacy.cablePlan,
    entryAddons: next,
    panelJointPlan: legacy.seamPlan === "conductive-gasket" ? "dense-bolted" : legacy.seamPlan,
    doorPlan:
      legacy.seamPlan === "conductive-gasket"
        ? "dense-bolted-conductive-gasket"
        : legacy.seamPlan === "dense-bolted"
          ? "dense-bolted-no-gasket"
          : "basic-bolted-no-gasket",
    bondingPlan: legacy.bondingPlan
  };
}

export function getDefaultMissionId() {
  return defaultMissionId;
}
