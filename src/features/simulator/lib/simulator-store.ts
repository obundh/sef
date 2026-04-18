import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialDesign, simulatorSteps } from "@/features/simulator/data/simulator-data";
import {
  designSchema,
  previousDesignSchema,
  migratePreviousDesign,
  legacyDesignSchema,
  migrateLegacyDesign
} from "@/features/simulator/lib/schema";
import { getEntryAddonStateKey, normalizeEntryAddons } from "@/features/simulator/lib/entry-config";
import type {
  BondingPlan,
  CablePlan,
  DoorPlan,
  EntryAddonId,
  MaterialId,
  OpeningPattern,
  PanelJointPlan,
  SimulatorDesign,
  SimulatorStepId
} from "@/features/simulator/lib/types";

interface SimulatorStore {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
  setMaterial: (materialId: MaterialId) => void;
  setThickness: (thicknessMm: 1 | 2 | 3) => void;
  setOpeningPattern: (openingPattern: OpeningPattern) => void;
  setCablePlan: (cablePlan: CablePlan) => void;
  setEntryAddon: (addonId: EntryAddonId, enabled: boolean) => void;
  setPanelJointPlan: (panelJointPlan: PanelJointPlan) => void;
  setDoorPlan: (doorPlan: DoorPlan) => void;
  setBondingPlan: (bondingPlan: BondingPlan) => void;
  setDesign: (design: SimulatorDesign) => void;
  goToStep: (step: SimulatorStepId) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

const stepIds = simulatorSteps.map((step) => step.id);

function getMigratedDesign(rawDesign: unknown) {
  const current = designSchema.safeParse(rawDesign);

  if (current.success) {
    return {
      ...current.data,
      entryAddons: normalizeEntryAddons(current.data.entryAddons)
    };
  }

  const previous = previousDesignSchema.safeParse(rawDesign);

  if (previous.success) {
    return migratePreviousDesign(previous.data);
  }

  const legacy = legacyDesignSchema.safeParse(rawDesign);

  if (legacy.success) {
    return migrateLegacyDesign(legacy.data);
  }

  return initialDesign;
}

function getMigratedStep(rawStep: unknown): SimulatorStepId {
  if (rawStep === "seam") {
    return "panelJoint";
  }

  if (typeof rawStep === "string" && stepIds.includes(rawStep as SimulatorStepId)) {
    return rawStep as SimulatorStepId;
  }

  return "material";
}

export const useSimulatorStore = create<SimulatorStore>()(
  persist(
    (set, get) => ({
      design: initialDesign,
      activeStep: "material",
      setMaterial: (materialId) =>
        set((state) => ({ design: { ...state.design, materialId } })),
      setThickness: (thicknessMm) =>
        set((state) => ({ design: { ...state.design, thicknessMm } })),
      setOpeningPattern: (openingPattern) =>
        set((state) => ({ design: { ...state.design, openingPattern } })),
      setCablePlan: (cablePlan) =>
        set((state) => ({
          design: {
            ...state.design,
            cablePlan
          }
        })),
      setEntryAddon: (addonId, enabled) =>
        set((state) => {
          const key = getEntryAddonStateKey(addonId);
          return {
            design: {
              ...state.design,
              entryAddons: {
                ...state.design.entryAddons,
                [key]: enabled
              }
            }
          };
        }),
      setPanelJointPlan: (panelJointPlan) =>
        set((state) => ({ design: { ...state.design, panelJointPlan } })),
      setDoorPlan: (doorPlan) =>
        set((state) => ({ design: { ...state.design, doorPlan } })),
      setBondingPlan: (bondingPlan) =>
        set((state) => ({ design: { ...state.design, bondingPlan } })),
      setDesign: (design) =>
        set({
          design: {
            ...design,
            entryAddons: normalizeEntryAddons(design.entryAddons)
          }
        }),
      goToStep: (step) => set({ activeStep: step }),
      nextStep: () => {
        const currentIndex = stepIds.indexOf(get().activeStep);
        set({ activeStep: stepIds[Math.min(currentIndex + 1, stepIds.length - 1)] });
      },
      previousStep: () => {
        const currentIndex = stepIds.indexOf(get().activeStep);
        set({ activeStep: stepIds[Math.max(currentIndex - 1, 0)] });
      },
      reset: () =>
        set({
          design: initialDesign,
          activeStep: "material"
        })
    }),
    {
      name: "shield-simulator-store",
      version: 7,
      partialize: (state) => ({
        design: state.design,
        activeStep: state.activeStep
      }),
      migrate: (persistedState) => {
        const state =
          persistedState && typeof persistedState === "object"
            ? (persistedState as Record<string, unknown>)
            : {};

        return {
          design: getMigratedDesign(state.design),
          activeStep: getMigratedStep(state.activeStep)
        };
      }
    }
  )
);
