import type {
  CablePlan,
  EntryAddonId,
  EntryAddons,
  SimulatorDesign
} from "@/features/simulator/lib/types";

export const emptyEntryAddons: EntryAddons = {
  filteredPower: false,
  filteredSignal: false,
  fiberSignal: false,
  wbcNonconductive: false
};

type EntryDesignSlice = Pick<SimulatorDesign, "cablePlan" | "entryAddons">;

export function normalizeEntryAddons(entryAddons?: Partial<EntryAddons> | null): EntryAddons {
  return {
    filteredPower: Boolean(entryAddons?.filteredPower),
    filteredSignal: Boolean(entryAddons?.filteredSignal),
    fiberSignal: Boolean(entryAddons?.fiberSignal),
    wbcNonconductive: Boolean(entryAddons?.wbcNonconductive)
  };
}

export function getEntryAddonStateKey(addonId: EntryAddonId): keyof EntryAddons {
  switch (addonId) {
    case "filtered-power":
      return "filteredPower";
    case "filtered-signal":
      return "filteredSignal";
    case "fiber-signal":
      return "fiberSignal";
    case "wbc-nonconductive":
      return "wbcNonconductive";
    default:
      return "filteredPower";
  }
}

export function isFilteredEntryBase(cablePlan: CablePlan) {
  return cablePlan === "single-filtered" || cablePlan === "integrated-filter-panel-one";
}

export function isIntegratedEntryBase(cablePlan: CablePlan) {
  return cablePlan === "integrated-filter-panel-one";
}

export function hasPowerService(design: EntryDesignSlice) {
  return design.entryAddons.filteredPower;
}

export function hasProtectedPower(design: EntryDesignSlice) {
  return design.entryAddons.filteredPower && isFilteredEntryBase(design.cablePlan);
}

export function hasMetalSignalService(design: EntryDesignSlice) {
  return design.entryAddons.filteredSignal;
}

export function hasProtectedMetalSignal(design: EntryDesignSlice) {
  return design.entryAddons.filteredSignal && isFilteredEntryBase(design.cablePlan);
}

export function hasFiberSignal(design: EntryDesignSlice) {
  return design.entryAddons.fiberSignal;
}

export function hasWbcNonconductive(design: EntryDesignSlice) {
  return design.entryAddons.wbcNonconductive;
}

export function hasProtectedSignal(design: EntryDesignSlice) {
  return hasFiberSignal(design) || hasProtectedMetalSignal(design);
}

export function hasUnsafeEntry(design: EntryDesignSlice) {
  return (
    (design.cablePlan === "single-raw" || design.cablePlan === "multi-raw") &&
    (design.entryAddons.filteredPower || design.entryAddons.filteredSignal)
  );
}

export function hasAnyEntry(design: EntryDesignSlice) {
  return (
    design.cablePlan !== "none" ||
    design.entryAddons.filteredPower ||
    design.entryAddons.filteredSignal ||
    design.entryAddons.fiberSignal ||
    design.entryAddons.wbcNonconductive
  );
}

export function hasProtectedEntry(design: EntryDesignSlice) {
  return (
    hasProtectedPower(design) ||
    hasProtectedMetalSignal(design) ||
    hasFiberSignal(design) ||
    hasWbcNonconductive(design)
  );
}

export function getVisibleEntryAddonIds(design: EntryDesignSlice): EntryAddonId[] {
  const entryAddons = normalizeEntryAddons(design.entryAddons);
  const ids: EntryAddonId[] = [];

  if (entryAddons.filteredPower) {
    ids.push("filtered-power");
  }

  if (entryAddons.filteredSignal) {
    ids.push("filtered-signal");
  }

  if (entryAddons.fiberSignal) {
    ids.push("fiber-signal");
  }

  if (entryAddons.wbcNonconductive) {
    ids.push("wbc-nonconductive");
  }

  return ids;
}
