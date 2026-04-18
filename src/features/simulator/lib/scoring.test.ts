import { describe, expect, it } from "vitest";
import { initialDesign } from "@/features/simulator/data/simulator-data";
import { scoreDesign } from "@/features/simulator/lib/scoring";

describe("scoreDesign", () => {
  it("rewards a protected shield-room design over a weak raw design", () => {
    const weakResult = scoreDesign({
      ...initialDesign,
      materialId: "plastic",
      openingPattern: "slot-array",
      cablePlan: "multi-raw",
      entryAddons: {
        filteredPower: false,
        filteredSignal: false,
        fiberSignal: false,
        wbcNonconductive: false
      },
      panelJointPlan: "basic-bolted",
      doorPlan: "basic-bolted-no-gasket",
      bondingPlan: "none"
    });

    const improvedResult = scoreDesign({
      ...initialDesign,
      materialId: "composite-panel",
      thicknessMm: 3,
      openingPattern: "wbc-vent-one",
      cablePlan: "integrated-filter-panel-one",
      entryAddons: {
        filteredPower: true,
        filteredSignal: true,
        fiberSignal: true,
        wbcNonconductive: false
      },
      panelJointPlan: "continuous-welded",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "single-point-braided"
    });

    expect(improvedResult.total).toBeGreaterThan(weakResult.total);
    expect(improvedResult.conceptualBands.high).toBeGreaterThan(
      weakResult.conceptualBands.high
    );
    expect(improvedResult.breakdown.panelJointIntegrity).toBeGreaterThan(
      weakResult.breakdown.panelJointIntegrity
    );
  });

  it("scores filtered and separated entries better than raw penetrations", () => {
    const rawEntryResult = scoreDesign({
      ...initialDesign,
      materialId: "steel",
      thicknessMm: 2,
      openingPattern: "honeycomb-one",
      cablePlan: "multi-raw",
      entryAddons: {
        filteredPower: false,
        filteredSignal: false,
        fiberSignal: false,
        wbcNonconductive: false
      },
      panelJointPlan: "dense-bolted",
      doorPlan: "dense-bolted-no-gasket",
      bondingPlan: "basic"
    });

    const protectedEntryResult = scoreDesign({
      ...initialDesign,
      materialId: "steel",
      thicknessMm: 2,
      openingPattern: "honeycomb-one",
      cablePlan: "single-filtered",
      entryAddons: {
        filteredPower: true,
        filteredSignal: false,
        fiberSignal: true,
        wbcNonconductive: false
      },
      panelJointPlan: "dense-bolted",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "single-point-basic"
    });

    expect(protectedEntryResult.breakdown.entryControl).toBeGreaterThan(
      rawEntryResult.breakdown.entryControl
    );
    expect(protectedEntryResult.total).toBeGreaterThan(rawEntryResult.total);
  });

  it("gives better value efficiency to a balanced design than an overbuilt design", () => {
    const overbuiltResult = scoreDesign({
      ...initialDesign,
      materialId: "copper",
      thicknessMm: 3,
      openingPattern: "wbc-vent-one",
      cablePlan: "integrated-filter-panel-one",
      entryAddons: {
        filteredPower: true,
        filteredSignal: true,
        fiberSignal: true,
        wbcNonconductive: false
      },
      panelJointPlan: "continuous-welded",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "single-point-braided"
    });

    const balancedResult = scoreDesign({
      ...initialDesign,
      materialId: "steel",
      thicknessMm: 2,
      openingPattern: "honeycomb-one",
      cablePlan: "single-filtered",
      entryAddons: {
        filteredPower: true,
        filteredSignal: false,
        fiberSignal: true,
        wbcNonconductive: false
      },
      panelJointPlan: "continuous-welded",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "single-point-basic"
    });

    expect(overbuiltResult.total).toBeGreaterThanOrEqual(balancedResult.total - 10);
    expect(balancedResult.valueAssessment.efficiencyScore).toBeGreaterThan(
      overbuiltResult.valueAssessment.efficiencyScore
    );
  });

  it("penalizes missing bonding even when the wall and joints are strong", () => {
    const noBondingResult = scoreDesign({
      ...initialDesign,
      materialId: "steel",
      thicknessMm: 2,
      openingPattern: "sealed",
      cablePlan: "none",
      entryAddons: {
        filteredPower: false,
        filteredSignal: false,
        fiberSignal: false,
        wbcNonconductive: false
      },
      panelJointPlan: "continuous-welded",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "none"
    });

    const bondedResult = scoreDesign({
      ...initialDesign,
      materialId: "steel",
      thicknessMm: 2,
      openingPattern: "sealed",
      cablePlan: "none",
      entryAddons: {
        filteredPower: false,
        filteredSignal: false,
        fiberSignal: false,
        wbcNonconductive: false
      },
      panelJointPlan: "continuous-welded",
      doorPlan: "dense-bolted-conductive-gasket",
      bondingPlan: "single-point-braided"
    });

    expect(bondedResult.breakdown.bondingQuality).toBeGreaterThan(
      noBondingResult.breakdown.bondingQuality
    );
    expect(bondedResult.total).toBeGreaterThan(noBondingResult.total);
  });
});
