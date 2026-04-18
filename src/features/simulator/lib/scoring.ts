import {
  bondingOptions,
  cableOptions,
  doorOptions,
  materials,
  openingOptions,
  panelJointOptions,
  thicknessOptions
} from "@/features/simulator/data/simulator-data";
import { getDesignCostSummary } from "@/features/simulator/data/pricing";
import {
  hasAnyEntry,
  hasFiberSignal,
  hasProtectedEntry,
  hasProtectedMetalSignal,
  hasProtectedPower,
  hasUnsafeEntry,
  hasWbcNonconductive,
  isIntegratedEntryBase
} from "@/features/simulator/lib/entry-config";
import type {
  HotspotItem,
  MissionEvaluation,
  MissionId,
  PerformanceGrade,
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

function findDelta<T extends { id: string; scoreDelta: number }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.scoreDelta ?? 0;
}

function getPerformanceGrade(total: number): PerformanceGrade {
  if (total >= 90) {
    return {
      tier: "S",
      label: "매우 우수",
      description: "개구부, 관통부, 조인트, 문, 본딩이 모두 안정적으로 정리된 상위권 설계입니다."
    };
  }

  if (total >= 80) {
    return {
      tier: "A",
      label: "우수",
      description: "전반적으로 강한 설계이며 일부 약점만 보완하면 더 안정적입니다."
    };
  }

  if (total >= 70) {
    return {
      tier: "B",
      label: "양호",
      description: "기본 방향은 좋지만 병목 구간이 아직 남아 있습니다."
    };
  }

  if (total >= 60) {
    return {
      tier: "C",
      label: "보완 필요",
      description: "핵심 방향은 맞지만 취약 구간이 총점을 분명히 깎고 있습니다."
    };
  }

  if (total >= 50) {
    return {
      tier: "D",
      label: "취약",
      description: "부분 개선보다 병목부터 다시 손보는 편이 좋습니다."
    };
  }

  return {
    tier: "E",
    label: "매우 취약",
    description: "현재 구성은 차폐 경계가 약해 전반적인 재구성이 필요합니다."
  };
}

function getSeverity(score: number): Severity {
  if (score < 40) return "critical";
  if (score < 65) return "warn";
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

  if (isIntegratedEntryBase(design.cablePlan) && hasProtectedPower(design) && hasProtectedMetalSignal(design)) {
    delta += 4;
  }

  if (!isIntegratedEntryBase(design.cablePlan) && hasProtectedPower(design) && hasProtectedMetalSignal(design)) {
    delta -= 2;
  }

  if (hasUnsafeEntry(design)) {
    delta -= 6;
  }

  return delta;
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

function getGenericBudgetMode(): MissionEvaluation {
  return {
    missionId: "occupied-room" as MissionId,
    title: "예산 모드",
    summary: "미션 조건 없이 가격과 차폐 점수만 비교",
    objective: "현재는 각 단계별 교육용 추정 단가를 기준으로 설계를 비교합니다.",
    status: "pass",
    message: "미션 제약은 꺼져 있습니다. 지금은 가격과 차폐 성능의 균형만 봅니다.",
    scoreThreshold: 0,
    conditionsMet: true,
    scoreQualified: true,
    requirementChecks: []
  };
}

function buildValueAssessment(
  design: SimulatorDesign,
  total: number,
  weakestKey: keyof ScoreBreakdown
): ValueAssessment {
  const costSummary = getDesignCostSummary(design);
  const material = design.materialId ? materials[design.materialId] : null;

  const costIndex = clamp((costSummary.totalKrw / 16_000_000) * 100);
  const weightIndex = clamp(
    (material?.weightIndex ?? 0) +
      (design.thicknessMm === 2 ? 10 : design.thicknessMm === 3 ? 22 : 0) +
      (design.openingPattern === "honeycomb-two" ? 6 : design.openingPattern === "wbc-vent-one" ? 8 : 0) +
      (design.cablePlan === "integrated-filter-panel-one" ? 4 : design.cablePlan === "single-filtered" ? 2 : 0) +
      (design.panelJointPlan === "continuous-welded" ? 4 : design.panelJointPlan === "dense-bolted" ? 2 : 0) +
      (design.doorPlan === "dense-bolted-conductive-gasket" ? 2 : 0) +
      (design.bondingPlan === "single-point-braided" ? 4 : singlePointBondingPlans.has(design.bondingPlan) ? 2 : 0)
  );

  const complexityIndex = clamp(
    (design.openingPattern === "wbc-vent-one" ? 18 : protectedOpeningPlans.has(design.openingPattern) ? 10 : 3) +
      (design.cablePlan === "integrated-filter-panel-one" ? 18 : design.cablePlan === "single-filtered" ? 10 : design.cablePlan === "multi-raw" ? 4 : 2) +
      (design.entryAddons.filteredPower ? 5 : 0) +
      (design.entryAddons.filteredSignal ? 5 : 0) +
      (design.entryAddons.fiberSignal ? 6 : 0) +
      (design.entryAddons.wbcNonconductive ? 6 : 0) +
      (design.panelJointPlan === "continuous-welded" ? 18 : design.panelJointPlan === "dense-bolted" ? 8 : 3) +
      (design.doorPlan === "dense-bolted-conductive-gasket" ? 12 : design.doorPlan === "dense-bolted-no-gasket" ? 6 : 2) +
      (design.bondingPlan === "single-point-braided" ? 10 : design.bondingPlan === "single-point-multipoint" ? 8 : design.bondingPlan === "single-point-basic" ? 6 : design.bondingPlan === "multipoint" ? 5 : design.bondingPlan === "basic" ? 3 : 0)
  );

  const burdenScore = costIndex * 0.52 + weightIndex * 0.18 + complexityIndex * 0.3;
  const efficiencyScore = clamp(total * 0.72 + (100 - burdenScore) * 0.28);

  let rating: ValueAssessment["rating"] = "poor";
  if (efficiencyScore >= 78) {
    rating = "excellent";
  } else if (efficiencyScore >= 66) {
    rating = "good";
  } else if (efficiencyScore >= 54) {
    rating = "balanced";
  }

  const headline =
    rating === "excellent"
      ? "성능을 꽤 확보하면서도 과투자가 심하지 않은 가성비 좋은 설계입니다."
      : rating === "good"
        ? "성능과 비용의 균형이 비교적 잘 잡혀 있습니다."
        : rating === "balanced"
          ? "성능은 괜찮지만 몇몇 선택이 비용 대비 효율을 조금 깎고 있습니다."
          : "차폐 성능 대비 비용이나 복잡도가 큰 편이라 가성비가 낮습니다.";

  const summary = `총 추정 비용은 약 ${Math.round(costSummary.totalKrw / 10_000).toLocaleString("ko-KR")}만원 수준으로 계산했습니다. 비용 지수 ${costIndex}, 무게 지수 ${weightIndex}, 시공 복잡도 ${complexityIndex}를 함께 봅니다.`;

  const nextMoveMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체를 더 비싼 재료로 올리기보다 조인트와 개구부를 같이 손보는 쪽이 보통 더 효율적입니다.",
    openingControl: "큰 개구부나 과한 환기 수를 줄이고 허니컴 1개나 WBC 1개 같은 보호된 최소 개구부로 정리해 보세요.",
    entryControl: "무처리 관통을 줄이고 필터 관통판과 서비스 분리 구성으로 바꾸는 편이 비용 대비 효과가 큽니다.",
    panelJointIntegrity: "벽체를 더 두껍게 하기보다 패널 조인트를 기본 체결에서 촘촘한 체결 이상으로 올리는 편이 먼저입니다.",
    doorIntegrity: "문 둘레 체결과 가스켓을 보강하는 쪽이 전체 체감 성능을 빠르게 올립니다.",
    bondingQuality: "본딩과 기준 접지를 정리하는 비용은 비교적 작지만 전체 설계 안정성에 미치는 영향은 큽니다."
  };

  return {
    costIndex,
    weightIndex,
    complexityIndex,
    efficiencyScore,
    rating,
    headline,
    summary,
    nextMove: nextMoveMap[weakestKey]
  };
}

export function scoreDesign(design: SimulatorDesign, _missionId?: MissionId): ScoreResult {
  const material = design.materialId ? materials[design.materialId] : null;
  const wallBase = material?.wallBase ?? 0;
  const thicknessDelta = findDelta(thicknessOptions, String(design.thicknessMm));
  const openingDelta = findDelta(openingOptions, design.openingPattern);
  const panelJointDelta = findDelta(panelJointOptions, design.panelJointPlan);
  const doorDelta = findDelta(doorOptions, design.doorPlan);
  const bondingDelta = findDelta(bondingOptions, design.bondingPlan);

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

  const total = clamp(
    Math.min(
      weightedAverage + getProtectedServiceBonus(design) + getContinuityBonus(design),
      weakest + weakestLinkCapOffset
    )
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

  const breakdownEntries = Object.entries(breakdown) as Array<[keyof ScoreBreakdown, number]>;
  const [weakestKey] = [...breakdownEntries].sort((a, b) => a[1] - b[1])[0];
  const [strongestKey] = [...breakdownEntries].sort((a, b) => b[1] - a[1])[0];

  const entryDetail =
    breakdown.entryControl < 45
      ? "무처리 도체 관통이 남아 있어 보호된 서비스가 일부 있더라도 현재는 관통부가 지배적인 누설 경로입니다."
      : hasUnsafeEntry(design)
        ? "보호된 서비스가 일부 있더라도 무처리 관통 경로가 남아 있어 전체 관통부 성능 상한을 끌어내립니다."
        : hasProtectedPower(design) &&
            (hasProtectedMetalSignal(design) || hasFiberSignal(design)) &&
            hasWbcNonconductive(design)
          ? "전원, 통신, 비전도 서비스가 각자 맞는 보호 경로로 분리돼 관통부 관리가 안정적입니다."
          : hasProtectedPower(design) && (hasProtectedMetalSignal(design) || hasFiberSignal(design))
            ? "전원과 통신이 모두 보호된 경로로 들어와 관통부 구성은 비교적 좋은 편입니다."
            : hasFiberSignal(design)
              ? "광통신 경로는 좋지만 금속 신호나 전원 쪽은 별도 보호가 더 필요할 수 있습니다."
              : hasWbcNonconductive(design)
                ? "비전도 서비스 경로는 보호됐지만 다른 도체 경로는 따로 점검해야 합니다."
                : hasProtectedEntry(design)
                  ? "관통부는 기본적인 보호 구성을 갖췄습니다."
                  : "관통부 제어가 약하거나 아직 단순한 상태입니다.";

  const hotspots: HotspotItem[] = [
    {
      id: "wall-zone",
      title: "벽체 재질 / 두께",
      detail:
        breakdown.wall < 45
          ? "벽체 자체가 약해 다른 보강 요소를 붙여도 기본 점수가 낮게 형성됩니다."
          : "벽체 기본 성능은 충분한 편입니다. 이제 조인트와 개구부 관리가 더 중요해집니다.",
      severity: getSeverity(breakdown.wall)
    },
    {
      id: "opening-zone",
      title: "환기 / 개구부",
      detail:
        breakdown.openingControl < 45
          ? "긴 슬롯이나 무방비 개구부는 차폐면의 연속성을 끊고 고주파 누설을 키웁니다."
          : protectedOpeningPlans.has(design.openingPattern)
            ? "환기가 필요해도 허니컴이나 WBC 같은 보호된 개구부를 쓰면 리스크를 줄일 수 있습니다."
            : "개구부 상태는 비교적 안정적입니다.",
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
          ? "패널 조인트 연속성이 약해 벽체보다 조인트가 먼저 병목이 됩니다."
          : design.panelJointPlan === "continuous-welded"
            ? "고정 패널 조인트를 연속 용접으로 처리해 벽체 연속성이 강합니다."
            : "패널 조인트는 기본 이상으로 관리되고 있습니다.",
      severity: getSeverity(breakdown.panelJointIntegrity)
    },
    {
      id: "door-zone",
      title: "출입문 둘레",
      detail:
        breakdown.doorIntegrity < 50
          ? "문은 반복 개폐와 접촉 불량 때문에 누설 hotspot이 되기 쉽습니다."
          : design.doorPlan === "dense-bolted-conductive-gasket"
            ? "촘촘한 체결과 도전성 가스켓이 문 둘레 접촉 일관성을 높여 줍니다."
            : "출입문 처리 수준은 무난하지만 최상위 조합은 아닙니다.",
      severity: getSeverity(breakdown.doorIntegrity)
    },
    {
      id: "bond-zone",
      title: "본딩 / 접지",
      detail:
        breakdown.bondingQuality < 45
          ? "본딩과 접지 경로가 약하면 다른 개선 요소의 효과가 충분히 살아나기 어렵습니다."
          : singlePointBondingPlans.has(design.bondingPlan)
            ? "기준 접지점과 본딩 경로가 정리돼 전체 경계 관리에 도움이 됩니다."
            : "본딩 / 접지 상태는 기본 이상입니다.",
      severity: getSeverity(breakdown.bondingQuality)
    }
  ];

  const strongChoiceMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체 기본 성능이 안정적이라 전체 설계의 바탕이 단단합니다.",
    openingControl: "개구부를 과하게 키우지 않고 보호된 방식으로 정리한 점이 좋습니다.",
    entryControl: "관통부를 보호된 방식으로 나눠 잡아 누설 리스크를 줄였습니다.",
    panelJointIntegrity: "패널 조인트를 벽체의 일부처럼 관리한 점이 강점입니다.",
    doorIntegrity: "문 둘레 체결과 접촉 관리 방향이 좋습니다.",
    bondingQuality: "본딩과 접지 경로를 함께 본 점이 전체 안정성에 크게 기여합니다."
  };

  const nextUpgradeMap: Record<keyof ScoreBreakdown, string> = {
    wall: "벽체를 더 비싼 재료로 바꾸기보다 조인트와 개구부까지 함께 손보는 쪽이 보통 더 효과적입니다.",
    openingControl: "큰 개구부나 긴 슬롯을 줄이고 허니컴 1개 또는 WBC 1개 같은 보호된 최소 개구부로 정리해 보세요.",
    entryControl: "무처리 관통을 줄이고 필터 관통판과 서비스 분리 방식으로 바꾸면 점수가 크게 올라갑니다.",
    panelJointIntegrity: "기본 체결보다 촘촘한 체결, 가능하면 연속 용접 쪽으로 올리는 편이 좋습니다.",
    doorIntegrity: "문 둘레 체결 밀도와 도전성 가스켓 적용이 가장 직접적인 개선 포인트입니다.",
    bondingQuality: "본딩과 기준 접지 정리는 비교적 작은 비용으로 전체 안정성을 올리기 좋은 구간입니다."
  };

  const riskHeadline =
    hotspots.filter((item) => item.severity === "critical").length >= 2
      ? "여러 병목이 동시에 남아 있어 차폐 경계 전체가 불안정합니다."
      : hotspots.some((item) => item.severity === "critical")
        ? "한 개의 지배적 약점이 전체 점수를 강하게 제한하고 있습니다."
        : total >= 75
          ? "주요 취약점이 비교적 잘 제어된 안정적인 설계입니다."
          : "기본 방향은 좋지만 몇몇 병목을 더 줄이면 훨씬 좋아집니다.";

  return {
    total,
    performanceGrade: getPerformanceGrade(total),
    conceptualBands,
    breakdown,
    hotspots,
    mission: getGenericBudgetMode(),
    riskHeadline,
    bestMove: strongChoiceMap[strongestKey],
    nextUpgrade: nextUpgradeMap[weakestKey],
    valueAssessment: buildValueAssessment(design, total, weakestKey)
  };
}
