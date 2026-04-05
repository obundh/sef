import { describe, expect, it } from "vitest";
import { initialDesign } from "@/features/simulator/data/simulator-data";
import { scoreDesign } from "@/features/simulator/lib/scoring";

describe("scoreDesign", () => {
  it("rewards a protected shield-room design over a weak raw design", () => {
    const weakResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "plastic",
        openingPattern: "slot-array",
        cablePlan: "multi-raw",
        entryAddons: {
          filteredPower: true,
          filteredSignal: false,
          fiberSignal: false,
          wbcNonconductive: false
        },
        panelJointPlan: "basic-bolted",
        doorPlan: "basic-bolted-no-gasket",
        bondingPlan: "none"
      },
      "occupied-room"
    );

    const improvedResult = scoreDesign(
      {
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
      },
      "occupied-room"
    );

    expect(improvedResult.total).toBeGreaterThan(weakResult.total);
    expect(improvedResult.conceptualBands.high).toBeGreaterThan(
      weakResult.conceptualBands.high
    );
    expect(improvedResult.breakdown.panelJointIntegrity).toBeGreaterThan(
      weakResult.breakdown.panelJointIntegrity
    );
  });

  it("treats no penetration differently by mission", () => {
    const storageResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "composite-panel",
        thicknessMm: 3,
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
      },
      "storage-room"
    );

    const serverResult = scoreDesign(
      {
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
      },
      "server-room"
    );

    expect(storageResult.total).toBeGreaterThan(serverResult.total);
    expect(storageResult.mission.conditionsMet).toBe(true);
    expect(serverResult.mission.status).toBe("fail");
  });

  it("treats fiber communication differently from WBC nonconductive service", () => {
    const fiberServerResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "steel",
        thicknessMm: 2,
        openingPattern: "wbc-vent-one",
        cablePlan: "single-filtered",
        entryAddons: {
          filteredPower: true,
          filteredSignal: false,
          fiberSignal: true,
          wbcNonconductive: false
        },
        panelJointPlan: "continuous-welded",
        doorPlan: "dense-bolted-conductive-gasket",
        bondingPlan: "single-point-braided"
      },
      "server-room"
    );

    const wbcServerResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "steel",
        thicknessMm: 2,
        openingPattern: "wbc-vent-one",
        cablePlan: "single-filtered",
        entryAddons: {
          filteredPower: true,
          filteredSignal: false,
          fiberSignal: false,
          wbcNonconductive: true
        },
        panelJointPlan: "continuous-welded",
        doorPlan: "dense-bolted-conductive-gasket",
        bondingPlan: "single-point-braided"
      },
      "server-room"
    );

    expect(
      fiberServerResult.mission.requirementChecks.find((item) => item.id === "signal")?.satisfied
    ).toBe(true);
    expect(
      wbcServerResult.mission.requirementChecks.find((item) => item.id === "signal")?.satisfied
    ).toBe(false);
  });

  it("allows fiber plus filtered power as a combined protected entry strategy", () => {
    const combinedEntryResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "steel",
        thicknessMm: 2,
        openingPattern: "wbc-vent-one",
        cablePlan: "single-filtered",
        entryAddons: {
          filteredPower: true,
          filteredSignal: false,
          fiberSignal: true,
          wbcNonconductive: false
        },
        panelJointPlan: "continuous-welded",
        doorPlan: "dense-bolted-conductive-gasket",
        bondingPlan: "single-point-braided"
      },
      "server-room"
    );

    expect(
      combinedEntryResult.mission.requirementChecks.find((item) => item.id === "power")?.satisfied
    ).toBe(true);
    expect(
      combinedEntryResult.mission.requirementChecks.find((item) => item.id === "signal")?.satisfied
    ).toBe(true);
  });

  it("can report satisfied conditions but score below threshold", () => {
    const lowScoringOccupiedResult = scoreDesign(
      {
        ...initialDesign,
        materialId: "plastic",
        thicknessMm: 1,
        openingPattern: "honeycomb-one",
        cablePlan: "none",
        entryAddons: {
          filteredPower: false,
          filteredSignal: false,
          fiberSignal: false,
          wbcNonconductive: false
        },
        panelJointPlan: "basic-bolted",
        doorPlan: "dense-bolted-no-gasket",
        bondingPlan: "none"
      },
      "occupied-room"
    );

    expect(lowScoringOccupiedResult.mission.conditionsMet).toBe(true);
    expect(lowScoringOccupiedResult.mission.status).toBe("warn");
    expect(lowScoringOccupiedResult.total).toBeLessThan(
      lowScoringOccupiedResult.mission.scoreThreshold
    );
  });

  it("distinguishes performance-first designs from value-first designs", () => {
    const overbuiltResult = scoreDesign(
      {
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
      },
      "server-room"
    );

    const balancedResult = scoreDesign(
      {
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
      },
      "server-room"
    );

    expect(overbuiltResult.total).toBeGreaterThanOrEqual(balancedResult.total - 10);
    expect(balancedResult.valueAssessment.efficiencyScore).toBeGreaterThan(
      overbuiltResult.valueAssessment.efficiencyScore
    );
  });
});
