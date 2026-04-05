import { defaultMissionId, missions } from "@/features/simulator/data/missions";
import {
  bondingOptions,
  cableOptions,
  doorOptions,
  materials,
  openingOptions,
  panelJointOptions,
  thicknessOptions
} from "@/features/simulator/data/simulator-data";
import {
  hasAnyEntry,
  hasFiberSignal,
  hasPowerService,
  hasMetalSignalService,
  hasProtectedEntry,
  hasProtectedMetalSignal,
  hasProtectedPower,
  hasProtectedSignal,
  hasUnsafeEntry,
  hasWbcNonconductive,
  isIntegratedEntryBase
} from "@/features/simulator/lib/entry-config";
import type {
  HotspotItem,
  MissionCheck,
  MissionEvaluation,
  MissionId,
  MissionStatus,
  ScoreBreakdown,
  ScoreResult,
  Severity,
  SimulatorDesign,
  ValueAssessment
} from "@/features/simulator/lib/types";

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

const protectedOpeningPlans = new Set(["honeycomb-one", "honeycomb-two", "wbc-vent-one"]);
const singlePointBondingPlans = new Set([
  "single-point-basic",
  "single-point-multipoint",
  "single-point-braided"
]);

const breakdownWeights: Record<keyof ScoreBreakdown, number> = {
  wall: 0.2,
  openingControl: 0.17,
  entryControl: 0.2,
  panelJointIntegrity: 0.15,
  doorIntegrity: 0.15,
  bondingQuality: 0.13
};

const weakestLinkCapOffset = 28;

const thicknessBurden = {
  1: { cost: 0, weight: 0, complexity: 0 },
  2: { cost: 6, weight: 8, complexity: 1 },
  3: { cost: 12, weight: 16, complexity: 2 }
} as const;

const openingBurden = {
  sealed: { cost: 0, weight: 0, complexity: 0 },
  "two-round": { cost: 2, weight: 1, complexity: 3 },
  "four-round": { cost: 4, weight: 2, complexity: 5 },
  "slot-array": { cost: 3, weight: 1, complexity: 4 },
  "honeycomb-one": { cost: 9, weight: 4, complexity: 8 },
  "honeycomb-two": { cost: 15, weight: 7, complexity: 12 },
  "wbc-vent-one": { cost: 18, weight: 9, complexity: 14 }
} as const;

const cableBurden = {
  none: { cost: 0, weight: 0, complexity: 0 },
  "single-filtered": { cost: 6, weight: 2, complexity: 7 },
  "single-raw": { cost: 2, weight: 1, complexity: 2 },
  "multi-raw": { cost: 5, weight: 2, complexity: 4 },
  "integrated-filter-panel-one": { cost: 16, weight: 4, complexity: 15 }
} as const;

const entryAddonBurden = {
  filteredPower: { cost: 6, weight: 1, complexity: 5 },
  filteredSignal: { cost: 6, weight: 1, complexity: 5 },
  fiberSignal: { cost: 9, weight: 1, complexity: 6 },
  wbcNonconductive: { cost: 8, weight: 2, complexity: 6 }
} as const;

const panelJointBurden = {
  "basic-bolted": { cost: 2, weight: 1, complexity: 2 },
  "dense-bolted": { cost: 6, weight: 2, complexity: 6 },
  "continuous-welded": { cost: 14, weight: 4, complexity: 16 }
} as const;

const doorBurden = {
  "basic-bolted-no-gasket": { cost: 2, weight: 1, complexity: 2 },
  "dense-bolted-no-gasket": { cost: 6, weight: 1, complexity: 5 },
  "dense-bolted-conductive-gasket": { cost: 12, weight: 2, complexity: 10 }
} as const;

const bondingBurden = {
  none: { cost: 0, weight: 0, complexity: 0 },
  basic: { cost: 4, weight: 1, complexity: 4 },
  multipoint: { cost: 8, weight: 2, complexity: 8 },
  "single-point-basic": { cost: 9, weight: 2, complexity: 9 },
  "single-point-multipoint": { cost: 12, weight: 3, complexity: 12 },
  "single-point-braided": { cost: 15, weight: 4, complexity: 13 }
} as const;

interface MissionOutcome {
  checks: MissionCheck[];
  conditionsMet: boolean;
  scoreCap: number;
  scoreBonus: number;
  unmetLabels: string[];
  nextUpgrade?: string;
}

function findDelta<T extends { id: string; scoreDelta: number }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.scoreDelta ?? 0;
}

function getEntryAddonDelta(design: SimulatorDesign) {
  let delta = 0;

  if (design.entryAddons.filteredPower) {
    delta += hasProtectedPower(design) ? 6 : -10;
  }

  if (design.entryAddons.filteredSignal) {
    delta += hasProtectedMetalSignal(design) ? 6 : -10;
  }

  if (design.entryAddons.fiberSignal) {
    delta += 8;
  }

  if (design.entryAddons.wbcNonconductive) {
    delta += 6;
  }

  if (isIntegratedEntryBase(design.cablePlan) && hasPowerService(design) && hasProtectedMetalSignal(design)) {
    delta += 4;
  }

  if (!isIntegratedEntryBase(design.cablePlan) && hasPowerService(design) && hasProtectedMetalSignal(design)) {
    delta -= 2;
  }

  if (hasUnsafeEntry(design)) {
    delta -= 6;
  }

  return delta;
}

function getEntryBurden(design: SimulatorDesign) {
  const base = cableBurden[design.cablePlan];

  return {
    cost:
      base.cost +
      (design.entryAddons.filteredPower ? entryAddonBurden.filteredPower.cost : 0) +
      (design.entryAddons.filteredSignal ? entryAddonBurden.filteredSignal.cost : 0) +
      (design.entryAddons.fiberSignal ? entryAddonBurden.fiberSignal.cost : 0) +
      (design.entryAddons.wbcNonconductive ? entryAddonBurden.wbcNonconductive.cost : 0),
    weight:
      base.weight +
      (design.entryAddons.filteredPower ? entryAddonBurden.filteredPower.weight : 0) +
      (design.entryAddons.filteredSignal ? entryAddonBurden.filteredSignal.weight : 0) +
      (design.entryAddons.fiberSignal ? entryAddonBurden.fiberSignal.weight : 0) +
      (design.entryAddons.wbcNonconductive ? entryAddonBurden.wbcNonconductive.weight : 0),
    complexity:
      base.complexity +
      (design.entryAddons.filteredPower ? entryAddonBurden.filteredPower.complexity : 0) +
      (design.entryAddons.filteredSignal ? entryAddonBurden.filteredSignal.complexity : 0) +
      (design.entryAddons.fiberSignal ? entryAddonBurden.fiberSignal.complexity : 0) +
      (design.entryAddons.wbcNonconductive ? entryAddonBurden.wbcNonconductive.complexity : 0)
  };
}

function getEntryControlScore(design: SimulatorDesign) {
  const baseDelta = findDelta(cableOptions, design.cablePlan);
  let score = 38 + baseDelta + getEntryAddonDelta(design);

  if (design.cablePlan === "single-raw") {
    score = Math.min(score, 46);
  }

  if (design.cablePlan === "multi-raw") {
    score = Math.min(score, 32);
  }

  if (design.cablePlan === "none" && !hasAnyEntry(design)) {
    score += 8;
  }

  return clamp(score);
}

function getSeverity(score: number): Severity {
  if (score < 40) {
    return "critical";
  }

  if (score < 65) {
    return "warn";
  }

  return "good";
}

function getProtectedServiceBonus(design: SimulatorDesign) {
  const openingBonus = protectedOpeningPlans.has(design.openingPattern) ? 3 : 0;
  const entryBonus = hasProtectedEntry(design) ? 4 : 0;
  const mixedServiceBonus =
    hasProtectedPower(design) &&
    (hasProtectedMetalSignal(design) || hasFiberSignal(design)) &&
    !hasUnsafeEntry(design)
      ? 3
      : 0;

  return openingBonus + entryBonus + mixedServiceBonus;
}

function getContinuityBonus(design: SimulatorDesign) {
  return (
    (design.panelJointPlan === "continuous-welded" ? 3 : 0) +
    (design.doorPlan === "dense-bolted-conductive-gasket" ? 3 : 0) +
    (singlePointBondingPlans.has(design.bondingPlan) ? 2 : 0)
  );
}

function evaluateMissionRequirements(design: SimulatorDesign, missionId: MissionId): MissionOutcome {
  switch (missionId) {
    case "server-room": {
      const powerSatisfied = hasProtectedPower(design);
      const signalSatisfied = hasProtectedSignal(design);
      const ventSatisfied = protectedOpeningPlans.has(design.openingPattern);

      const checks: MissionCheck[] = [
        {
          id: "power",
          label: "전원 1개를 보호된 방식으로 인입",
          satisfied: powerSatisfied
        },
        {
          id: "signal",
          label: "통신 1개를 보호된 방식으로 인입",
          satisfied: signalSatisfied
        },
        {
          id: "vent",
          label: "환기를 보호된 방식으로 확보",
          satisfied: ventSatisfied
        }
      ];

      const unmet = checks.filter((check) => !check.satisfied);
      const satisfiedCount = checks.length - unmet.length;
      const nextUpgradeMap: Record<string, string> = {
        power:
          "서버 보호 차폐실은 전원 인입이 필요합니다. 필터 관통판이나 통합 필터 관통판을 고르고 전원선 인입을 켜 보세요.",
        signal:
          "통신 경로가 부족합니다. 금속 신호선을 필터 경로로 들이거나 광섬유 통신을 추가해 보세요.",
        vent: "서버 보호 차폐실은 환기가 필요합니다. 허니컴 또는 WBC 환기구로 바꿔 보세요."
      };

      return {
        checks,
        conditionsMet: unmet.length === 0,
        scoreCap: unmet.length === 0 ? 100 : 54 + satisfiedCount * 10,
        scoreBonus: unmet.length === 0 ? 4 : 0,
        unmetLabels: unmet.map((check) => check.label),
        nextUpgrade: unmet.length > 0 ? nextUpgradeMap[unmet[0].id] : undefined
      };
    }

    case "storage-room": {
      const checks: MissionCheck[] = [
        {
          id: "no-entry",
          label: "관통부를 만들지 않음",
          satisfied: !hasAnyEntry(design)
        },
        {
          id: "no-opening",
          label: "환기 개구부를 만들지 않음",
          satisfied: design.openingPattern === "sealed"
        }
      ];

      const unmet = checks.filter((check) => !check.satisfied);
      const satisfiedCount = checks.length - unmet.length;
      const nextUpgradeMap: Record<string, string> = {
        "no-entry": "완전 차폐실이라면 관통부를 없애는 편이 가장 직접적인 개선입니다.",
        "no-opening": "완전 차폐실이라면 개구부를 없애는 편이 가장 직접적인 개선입니다."
      };

      return {
        checks,
        conditionsMet: unmet.length === 0,
        scoreCap: unmet.length === 0 ? 100 : satisfiedCount === 1 ? 84 : 72,
        scoreBonus: unmet.length === 0 ? 4 : 0,
        unmetLabels: unmet.map((check) => check.label),
        nextUpgrade: unmet.length > 0 ? nextUpgradeMap[unmet[0].id] : undefined
      };
    }

    case "occupied-room": {
      const doorSatisfied = design.doorPlan !== "basic-bolted-no-gasket";
      const ventSatisfied = protectedOpeningPlans.has(design.openingPattern);

      const checks: MissionCheck[] = [
        {
          id: "door",
          label: "출입문 차폐 건전성 확보",
          satisfied: doorSatisfied
        },
        {
          id: "vent",
          label: "환기를 보호된 방식으로 확보",
          satisfied: ventSatisfied
        }
      ];

      const unmet = checks.filter((check) => !check.satisfied);
      const satisfiedCount = checks.length - unmet.length;
      const nextUpgradeMap: Record<string, string> = {
        door:
          "사람이 들어가는 차폐실이라면 최소한 촘촘한 체결 이상으로 가고, 가능하면 도전성 가스켓까지 적용하는 편이 좋습니다.",
        vent:
          "사람이 들어가는 차폐실은 환기가 필요하므로 허니컴 또는 WBC 환기구를 추가해 보세요."
      };

      return {
        checks,
        conditionsMet: unmet.length === 0,
        scoreCap: unmet.length === 0 ? 100 : satisfiedCount === 1 ? 78 : 60,
        scoreBonus: unmet.length === 0 ? 3 : 0,
        unmetLabels: unmet.map((check) => check.label),
        nextUpgrade: unmet.length > 0 ? nextUpgradeMap[unmet[0].id] : undefined
      };
    }

    default:
      return evaluateMissionRequirements(design, defaultMissionId);
  }
}

function buildMissionEvaluation(
  missionId: MissionId,
  conditionsMet: boolean,
  total: number,
  checks: MissionCheck[],
  unmetLabels: string[]
): MissionEvaluation {
  const mission = missions[missionId];
  const scoreQualified = total >= mission.scoreThreshold;
  const status: MissionStatus = !conditionsMet ? "fail" : scoreQualified ? "pass" : "warn";
  const message = !conditionsMet
    ? `${mission.failureMessage} 부족한 항목: ${unmetLabels.join(", ")}.`
    : scoreQualified
      ? mission.successMessage
      : `필수 조건은 충족했지만 현재 학습 점수 ${total}점은 권장 통과선 ${mission.scoreThreshold}점보다 낮습니다. 병목 구간을 더 개선해야 합니다.`;

  return {
    missionId,
    title: mission.title,
    summary: mission.summary,
    objective: mission.objective,
    status,
    message,
    scoreThreshold: mission.scoreThreshold,
    conditionsMet,
    scoreQualified,
    requirementChecks: checks
  };
}

function getTopBurdenSource(design: SimulatorDesign) {
  const materialCost = design.materialId ? materials[design.materialId].costIndex : 0;
  const entryBurden = getEntryBurden(design);
  const burdenByCategory = [
    { key: "material", label: "벽체 재질", value: materialCost },
    { key: "thickness", label: "벽체 두께", value: thicknessBurden[design.thicknessMm].cost },
    { key: "opening", label: "환기 / 개구부", value: openingBurden[design.openingPattern].cost },
    { key: "entry", label: "관통판 / 서비스", value: entryBurden.cost },
    { key: "panelJoint", label: "패널 조인트", value: panelJointBurden[design.panelJointPlan].cost },
    { key: "door", label: "출입문", value: doorBurden[design.doorPlan].cost },
    { key: "bonding", label: "본딩 / 접지", value: bondingBurden[design.bondingPlan].cost }
  ];

  return burdenByCategory.sort((left, right) => right.value - left.value)[0];
}

function buildValueAssessment(
  design: SimulatorDesign,
  total: number,
  mission: MissionEvaluation,
  weakestKey: keyof ScoreBreakdown
): ValueAssessment {
  const material = design.materialId ? materials[design.materialId] : null;
  const entryBurden = getEntryBurden(design);
  const costIndex = clamp(
    ((material?.costIndex ?? 0) +
      thicknessBurden[design.thicknessMm].cost +
      openingBurden[design.openingPattern].cost +
      entryBurden.cost +
      panelJointBurden[design.panelJointPlan].cost +
      doorBurden[design.doorPlan].cost +
      bondingBurden[design.bondingPlan].cost) *
      0.64
  );
  const weightIndex = clamp(
    (material?.weightIndex ?? 0) +
      thicknessBurden[design.thicknessMm].weight +
      openingBurden[design.openingPattern].weight +
      entryBurden.weight +
      panelJointBurden[design.panelJointPlan].weight +
      doorBurden[design.doorPlan].weight +
      bondingBurden[design.bondingPlan].weight
  );
  const complexityIndex = clamp(
    (thicknessBurden[design.thicknessMm].complexity +
      openingBurden[design.openingPattern].complexity +
      entryBurden.complexity +
      panelJointBurden[design.panelJointPlan].complexity +
      doorBurden[design.doorPlan].complexity +
      bondingBurden[design.bondingPlan].complexity) *
      1.2
  );
  const burdenScore = costIndex * 0.5 + weightIndex * 0.2 + complexityIndex * 0.3;
  const efficiencyScore = clamp(total * 0.72 + (100 - burdenScore) * 0.28 - 5);
  const topBurdenSource = getTopBurdenSource(design);

  let rating: ValueAssessment["rating"] = "poor";
  if (efficiencyScore >= 78) {
    rating = "excellent";
  } else if (efficiencyScore >= 66) {
    rating = "good";
  } else if (efficiencyScore >= 54) {
    rating = "balanced";
  }

  const headline =
    mission.status === "fail"
      ? "가성비 판단 전에 미션 필수 조건부터 맞춰야 합니다."
      : mission.status === "warn"
        ? "예산은 버텼지만 성능 병목이 남아 있어 아직 가성비가 좋다고 보기 어렵습니다."
        : rating === "excellent"
          ? "필수 성능을 확보하면서도 과투자가 적은 가성비 우수 설계입니다."
          : rating === "good"
            ? "성능과 비용을 비교적 잘 균형 잡은 설계입니다."
            : rating === "balanced"
              ? "성능은 확보했지만 일부 선택은 가성비 측면에서 다시 볼 여지가 있습니다."
              : "성능도 충분하지 않은데 비용, 무게, 복잡도 부담이 큰 편입니다.";

  const summary =
    mission.status === "fail"
      ? "현재는 비용 효율보다 먼저 미션 필수 기능을 보호된 방식으로 만족시키는 것이 우선입니다."
      : `추정 비용 부담 ${costIndex}, 무게 부담 ${weightIndex}, 제작 복잡도 ${complexityIndex} 수준입니다. 가장 큰 부담 요인은 ${topBurdenSource.label}입니다.`;

  const weakestUpgradeMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체를 더 비싸게 올리기보다 강철 2 mm 또는 복합패널 수준에서 조인트와 개구부를 같이 다듬는 편이 효율적입니다.",
    openingControl: "슬롯이나 일반 개구부를 줄이고 허니컴 1개 또는 WBC 1개 같은 보호된 최소 개구부로 정리해 보세요.",
    entryControl: "무처리 관통을 줄이고 전원선, 금속 신호선, 광 통신, 비전도 서비스를 각각 맞는 보호 경로로 나눠 보세요.",
    panelJointIntegrity: "벽체를 더 두껍게 하기보다 패널 조인트부터 먼저 정리하는 편이 성능 대비 비용 효율이 좋습니다.",
    doorIntegrity: "문 둘레가 약하면 다른 투자 효과가 줄어듭니다. 도전성 가스켓 쪽 보강이 우선입니다.",
    bondingQuality: "본딩과 접지를 정리하는 비용은 비교적 작지만 전체 효과는 커서 우선순위가 높습니다."
  };

  const nextMove =
    mission.status === "fail"
      ? "먼저 미션 필수 조건을 만족하도록 보호된 환기와 보호된 관통 서비스를 구성해 보세요."
      : design.materialId === "copper"
        ? "구리 벽체는 비용 부담이 큽니다. 강철 2 mm나 복합패널로 낮추고 조인트·문·관통 서비스 보호를 유지하는 편이 더 효율적일 수 있습니다."
        : design.thicknessMm === 3 && weakestKey !== "wall"
          ? "벽체를 더 두껍게 유지하기보다 병목 구간의 비용을 먼저 줄이는 편이 가성비가 좋습니다."
          : design.openingPattern === "honeycomb-two"
            ? "허니컴 2개는 과한 선택일 수 있습니다. 필요한 환기량이 충분하다면 허니컴 1개나 WBC 1개로 줄여 보세요."
            : weakestUpgradeMap[weakestKey];

  return {
    costIndex,
    weightIndex,
    complexityIndex,
    efficiencyScore,
    rating,
    headline,
    summary,
    nextMove
  };
}

export function scoreDesign(
  design: SimulatorDesign,
  missionId: MissionId = defaultMissionId
): ScoreResult {
  const material = design.materialId ? materials[design.materialId] : null;
  const wallBase = material?.wallBase ?? 0;
  const thicknessDelta = findDelta(thicknessOptions, String(design.thicknessMm));
  const openingDelta = findDelta(openingOptions, design.openingPattern);
  const panelJointDelta = findDelta(panelJointOptions, design.panelJointPlan);
  const doorDelta = findDelta(doorOptions, design.doorPlan);
  const bondingDelta = findDelta(bondingOptions, design.bondingPlan);
  const missionOutcome = evaluateMissionRequirements(design, missionId);

  const breakdown: ScoreBreakdown = {
    wall: clamp(wallBase + thicknessDelta),
    openingControl: clamp(40 + openingDelta),
    entryControl: getEntryControlScore(design),
    panelJointIntegrity: clamp(44 + panelJointDelta),
    doorIntegrity: clamp(40 + doorDelta),
    bondingQuality: clamp(40 + bondingDelta)
  };

  const weightedAverage =
    breakdown.wall * breakdownWeights.wall +
    breakdown.openingControl * breakdownWeights.openingControl +
    breakdown.entryControl * breakdownWeights.entryControl +
    breakdown.panelJointIntegrity * breakdownWeights.panelJointIntegrity +
    breakdown.doorIntegrity * breakdownWeights.doorIntegrity +
    breakdown.bondingQuality * breakdownWeights.bondingQuality;

  const weakest = Math.min(
    breakdown.wall,
    breakdown.openingControl,
    breakdown.entryControl,
    breakdown.panelJointIntegrity,
    breakdown.doorIntegrity,
    breakdown.bondingQuality
  );

  const preMissionTotal = Math.min(
    weightedAverage + getProtectedServiceBonus(design) + getContinuityBonus(design),
    weakest + weakestLinkCapOffset
  );
  const total = clamp(Math.min(preMissionTotal + missionOutcome.scoreBonus, missionOutcome.scoreCap));
  const mission = buildMissionEvaluation(
    missionId,
    missionOutcome.conditionsMet,
    total,
    missionOutcome.checks,
    missionOutcome.unmetLabels
  );

  const conceptualBands = {
    low: clamp(
      breakdown.wall * 0.4 +
        breakdown.bondingQuality * 0.24 +
        breakdown.entryControl * 0.16 +
        breakdown.panelJointIntegrity * 0.1 +
        breakdown.doorIntegrity * 0.1 +
        (material?.lowBandBias ?? -6) * 2.4
    ),
    mid: clamp(
      breakdown.wall * 0.18 +
        breakdown.openingControl * 0.18 +
        breakdown.entryControl * 0.18 +
        breakdown.panelJointIntegrity * 0.16 +
        breakdown.doorIntegrity * 0.14 +
        breakdown.bondingQuality * 0.16
    ),
    high: clamp(
      breakdown.openingControl * 0.28 +
        breakdown.entryControl * 0.23 +
        breakdown.panelJointIntegrity * 0.19 +
        breakdown.doorIntegrity * 0.15 +
        breakdown.wall * 0.15 +
        (material?.highBandBias ?? -6) * 2.8
    )
  };

  const entryDetail =
    breakdown.entryControl < 45
      ? "무처리 전도성 관통이 남아 있어 보호된 서비스가 일부 있더라도 현재는 관통부가 지배적인 누설 경로입니다."
      : hasUnsafeEntry(design)
        ? "보호된 서비스가 일부 있더라도 무처리 전도성 선로 하나가 전체 관통부 성능 상한을 끌어내립니다."
        : hasProtectedPower(design) &&
            (hasProtectedMetalSignal(design) || hasFiberSignal(design)) &&
            hasWbcNonconductive(design)
          ? "전원, 통신, 비전도 서비스가 각각 맞는 보호 경로로 분리되어 관통부 관리가 안정적입니다."
          : hasProtectedPower(design) && (hasProtectedMetalSignal(design) || hasFiberSignal(design))
            ? "전원과 통신이 모두 보호된 경로로 들어와 서버실 계열 미션에 유리한 관통 구성입니다."
            : hasFiberSignal(design)
              ? "광 통신 경로는 확보됐지만 전원선이나 금속 신호선은 별도 보호 경로가 더 필요할 수 있습니다."
              : hasWbcNonconductive(design)
                ? "비전도 서비스 경로는 잘 보호됐지만 전도성 선로 관리는 따로 점검해야 합니다."
                : hasProtectedEntry(design)
                  ? "보호된 관통 서비스가 적용되어 필요한 기능을 상대적으로 안전하게 들이고 있습니다."
                  : "관통부 제어 상태는 비교적 단순하지만 미션에 따라 필요한 서비스를 못 들일 수 있습니다.";

  const hotspots: HotspotItem[] = [
    {
      id: "wall-zone",
      title: "벽체 재질 / 두께",
      detail:
        breakdown.wall < 45
          ? "벽체 자체가 약해 다른 보강 요소를 더해도 전체 점수 상한이 낮게 형성됩니다."
          : "벽체 기본 성능은 충분한 편입니다. 이제 조인트와 개구부 관리가 더 중요합니다.",
      severity: getSeverity(breakdown.wall)
    },
    {
      id: "opening-zone",
      title: "환기 / 개구부",
      detail:
        breakdown.openingControl < 45
          ? "긴 슬롯이나 무방비 개구부는 차폐면의 연속성을 끊고 고주파 누설을 키웁니다."
          : protectedOpeningPlans.has(design.openingPattern)
            ? "환기가 필요해도 허니컴이나 WBC 같은 보호된 구조를 쓰면 약점을 줄일 수 있습니다."
            : "개구부 제어 상태는 비교적 안정적입니다.",
      severity: getSeverity(breakdown.openingControl)
    },
    {
      id: "entry-zone",
      title: "관통판 / 서비스",
      detail: entryDetail,
      severity: getSeverity(breakdown.entryControl)
    },
    {
      id: "panel-joint-zone",
      title: "패널 조인트",
      detail:
        breakdown.panelJointIntegrity < 50
          ? "패널 조인트의 연속성이 약해 벽체보다 조인트가 먼저 병목이 되고 있습니다."
          : design.panelJointPlan === "continuous-welded"
            ? "고정 패널 조인트를 연속 용접으로 처리해 벽체 연속성이 강하게 유지됩니다."
            : "패널 조인트는 기본 이상으로 관리되고 있습니다.",
      severity: getSeverity(breakdown.panelJointIntegrity)
    },
    {
      id: "door-zone",
      title: "출입문 둘레",
      detail:
        breakdown.doorIntegrity < 50
          ? "출입문은 반복 개폐와 접촉 불량 때문에 누설 hotspot이 되기 쉽습니다."
          : design.doorPlan === "dense-bolted-conductive-gasket"
            ? "도전성 가스켓과 촘촘한 체결이 문 둘레 접촉 일관성을 높여 줍니다."
            : "출입문 처리도 기본 이상이지만 최상위 조합은 아닙니다.",
      severity: getSeverity(breakdown.doorIntegrity)
    },
    {
      id: "bond-zone",
      title: "본딩 / 접지",
      detail:
        breakdown.bondingQuality < 45
          ? "본딩과 접지 경로가 불안정하면 다른 개선 요소의 효과도 충분히 살아나기 어렵습니다."
          : singlePointBondingPlans.has(design.bondingPlan)
            ? "기준 접지점을 정리한 본딩 구조가 전체 경계 관리에 유리하게 작동합니다."
            : "본딩 / 접지 수준은 비교적 안정적입니다.",
      severity: getSeverity(breakdown.bondingQuality)
    }
  ];

  const breakdownEntries = Object.entries(breakdown) as Array<[keyof ScoreBreakdown, number]>;
  const [weakestKey] = [...breakdownEntries].sort((a, b) => a[1] - b[1])[0];
  const [strongestKey] = [...breakdownEntries].sort((a, b) => b[1] - a[1])[0];
  const criticalCount = hotspots.filter((item) => item.severity === "critical").length;

  const riskHeadline =
    mission.status === "fail"
      ? "미션 필수 조건이 아직 충족되지 않아 현재 설계를 통과로 보긴 어렵습니다."
      : mission.status === "warn"
        ? "필수 조건은 맞췄지만 점수가 권장 통과선에 미치지 못했습니다."
        : criticalCount >= 2
          ? "여러 병목이 동시에 겹쳐 차폐실 전체가 불안정합니다."
          : criticalCount === 1
            ? "한 개의 지배적인 취약점이 전체 설계 상한을 강하게 막고 있습니다."
            : total >= 75
              ? "보호된 서비스와 연속성 관리가 균형 있게 잡힌 상위권 차폐실 설계입니다."
              : "기본 방향은 좋지만 한두 군데를 더 손봐야 상위권 점수로 올라갑니다.";

  const bestMoveMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체 재질 선택이 안정적이어서 기본 차폐 틀이 흔들리지 않습니다.",
    openingControl: "환기 / 개구부를 보호된 방식으로 줄여 고주파 취약점을 낮췄습니다.",
    entryControl: "관통부를 관통판 구조와 서비스로 나눠 보호해 큰 누설 경로를 줄였습니다.",
    panelJointIntegrity: "패널 조인트의 연속성을 높여 벽체 성능이 실제로 살아나게 만들었습니다.",
    doorIntegrity: "출입문 둘레 체결과 가스켓 처리 방향이 좋습니다.",
    bondingQuality: "본딩 / 접지 경로를 정리해 전체 경계 관리가 안정적입니다."
  };

  const nextUpgradeMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체는 구리 두께 경쟁보다 강철 2~3 mm 또는 복합패널처럼 구조와 연속성을 함께 잡는 방향이 더 교육적입니다.",
    openingControl: "긴 슬롯이나 일반 개구부를 줄이고 허니컴 또는 WBC 환기구로 바꿔 보세요.",
    entryControl:
      "관통판 구조와 통과 서비스를 분리해 보세요. 전원선은 필터 경로로, 금속 신호선은 필터 또는 광으로, 비전도 서비스는 WBC 통로로 나누는 편이 좋습니다.",
    panelJointIntegrity: "고정 패널 조인트는 촘촘한 체결을 넘어 연속 용접 쪽으로 올려 보는 것이 좋습니다.",
    doorIntegrity: "출입문은 촘촘한 체결만으로 끝내지 말고 도전성 가스켓까지 같이 적용해 보세요.",
    bondingQuality: "단일 기준 접지점과 구리 브레이드 본딩 쪽으로 정리해 보세요."
  };

  return {
    total,
    conceptualBands,
    breakdown,
    hotspots,
    mission,
    riskHeadline,
    bestMove:
      mission.status === "pass"
        ? `${missions[missionId].title} 미션 조건과 권장 통과선을 모두 충족했습니다.`
        : bestMoveMap[strongestKey],
    nextUpgrade: missionOutcome.nextUpgrade ?? nextUpgradeMap[weakestKey],
    valueAssessment: buildValueAssessment(design, total, mission, weakestKey)
  };
}
