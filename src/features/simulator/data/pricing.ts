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

export interface PricingReference {
  updatedAt: string;
  usdKrw: number;
  model: string;
  note: string;
  sources: Array<{
    label: string;
    url: string;
    detail: string;
  }>;
}

export interface DesignCostSummary {
  wallMaterialKrw: number;
  thicknessKrw: number;
  openingKrw: number;
  entryBaseKrw: number;
  entryAddonsKrw: number;
  panelJointKrw: number;
  doorKrw: number;
  bondingKrw: number;
  totalKrw: number;
}

// Educational estimate basis:
// - Small shielded room model around 2.4m x 2.4m x 2.4m
// - Fabricated sheet/panel + common hardware + assembly premium
// - Not a vendor quotation and excludes full site construction labor
export const pricingReference: PricingReference = {
  updatedAt: "2026-04-18",
  usdKrw: 1500,
  model: "소형 차폐실 1실 기준 교육용 추정 단가",
  note:
    "금속 시세와 대표 EMI 부품 가격을 바탕으로 패널 제작, 하드웨어, 기본 조립 프리미엄을 합산한 교육용 추정치입니다. 실제 견적은 실 크기, 수량, 시공 위치, 인증 범위에 따라 크게 달라질 수 있습니다.",
  sources: [
    {
      label: "TradingEconomics Copper",
      url: "https://tradingeconomics.com/commodity/copper",
      detail: "2026-04-17 기준 구리 약 6.08 USD/lb"
    },
    {
      label: "TradingEconomics Aluminum",
      url: "https://tradingeconomics.com/commodity/aluminum",
      detail: "2026-04-10 기준 알루미늄 약 3,511.25 USD/t"
    },
    {
      label: "TradingEconomics HRC Steel",
      url: "https://tradingeconomics.com/commodity/hrc-steel",
      detail: "2026-04-10 기준 열연강판 약 1,085.05 USD/t"
    },
    {
      label: "DigiKey Honeycomb Vent",
      url: "https://www.digikey.com/en/product-highlight/t/te-connectivity-amp/emi-shielding-honeycomb-ventilation-panels",
      detail: "대표 허니컴 벤트 예시 가격 약 33.47~45.54 USD"
    },
    {
      label: "DigiKey EMI Gasket",
      url: "https://www.digikey.com/en/product-highlight/p/parker-chomerics/soft-shield-3500-emi-shielding-gaskets",
      detail: "대표 EMI 가스켓 예시 가격 약 4.70~8.40 USD"
    },
    {
      label: "Mouser Feedthrough Filters",
      url: "https://www.mouser.com/c/passive-components/filters/emi-feedthrough-filters/",
      detail: "피드스루 필터 예시 가격 약 9.95~46.20 USD"
    },
    {
      label: "DigiKey Grounding Braid",
      url: "https://www.digikey.com/en/products/filter/grounding-braid-straps/494",
      detail: "브레이드 접지 스트랩 예시 가격 약 7.25~20.52 USD"
    }
  ]
};

const materialPackageKrw: Record<MaterialId, number> = {
  aluminum: 2_700_000,
  steel: 2_400_000,
  copper: 6_800_000,
  stainless: 3_400_000,
  plastic: 600_000,
  "composite-panel": 4_600_000
};

const thicknessSurchargeKrw: Record<1 | 2 | 3, number> = {
  1: 0,
  2: 900_000,
  3: 1_900_000
};

const openingCostKrw: Record<OpeningPattern, number> = {
  sealed: 0,
  "two-round": 200_000,
  "four-round": 380_000,
  "slot-array": 260_000,
  "honeycomb-one": 650_000,
  "honeycomb-two": 1_200_000,
  "wbc-vent-one": 1_600_000
};

const cableBaseCostKrw: Record<CablePlan, number> = {
  none: 0,
  "single-filtered": 900_000,
  "integrated-filter-panel-one": 1_800_000,
  "single-raw": 180_000,
  "multi-raw": 450_000
};

const entryAddonCostKrw: Record<keyof SimulatorDesign["entryAddons"], number> = {
  filteredPower: 350_000,
  filteredSignal: 280_000,
  fiberSignal: 420_000,
  wbcNonconductive: 380_000
};

const panelJointCostKrw: Record<PanelJointPlan, number> = {
  "basic-bolted": 700_000,
  "dense-bolted": 1_400_000,
  "continuous-welded": 2_900_000
};

const doorCostKrw: Record<DoorPlan, number> = {
  "basic-bolted-no-gasket": 900_000,
  "dense-bolted-no-gasket": 1_700_000,
  "dense-bolted-conductive-gasket": 2_600_000
};

const bondingCostKrw: Record<BondingPlan, number> = {
  none: 0,
  basic: 180_000,
  multipoint: 420_000,
  "single-point-basic": 520_000,
  "single-point-multipoint": 760_000,
  "single-point-braided": 980_000
};

function getEntryAddonStateKey(addonId: EntryAddonId): keyof SimulatorDesign["entryAddons"] {
  switch (addonId) {
    case "filtered-power":
      return "filteredPower";
    case "filtered-signal":
      return "filteredSignal";
    case "fiber-signal":
      return "fiberSignal";
    case "wbc-nonconductive":
      return "wbcNonconductive";
  }
}

export function formatKrw(value: number, options?: { compact?: boolean; signed?: boolean }) {
  const compact = options?.compact ?? false;
  const signed = options?.signed ?? false;
  const signPrefix = signed && value > 0 ? "+" : "";

  if (compact) {
    if (value >= 1_000_000) {
      const million = Math.round(value / 100_000) / 10;
      return `${signPrefix}${million.toLocaleString("ko-KR")}백만원`;
    }

    if (value >= 10_000) {
      return `${signPrefix}${Math.round(value / 10_000).toLocaleString("ko-KR")}만원`;
    }
  }

  return `${signPrefix}${value.toLocaleString("ko-KR")}원`;
}

export function getMaterialPackageCostKrw(materialId: MaterialId | null) {
  return materialId ? materialPackageKrw[materialId] : 0;
}

export function getThicknessSurchargeKrw(thicknessMm: 1 | 2 | 3) {
  return thicknessSurchargeKrw[thicknessMm];
}

export function getDesignCostSummary(design: SimulatorDesign): DesignCostSummary {
  const entryAddonsKrw =
    (design.entryAddons.filteredPower ? entryAddonCostKrw.filteredPower : 0) +
    (design.entryAddons.filteredSignal ? entryAddonCostKrw.filteredSignal : 0) +
    (design.entryAddons.fiberSignal ? entryAddonCostKrw.fiberSignal : 0) +
    (design.entryAddons.wbcNonconductive ? entryAddonCostKrw.wbcNonconductive : 0);

  const summary: DesignCostSummary = {
    wallMaterialKrw: getMaterialPackageCostKrw(design.materialId),
    thicknessKrw: getThicknessSurchargeKrw(design.thicknessMm),
    openingKrw: openingCostKrw[design.openingPattern],
    entryBaseKrw: cableBaseCostKrw[design.cablePlan],
    entryAddonsKrw,
    panelJointKrw: panelJointCostKrw[design.panelJointPlan],
    doorKrw: doorCostKrw[design.doorPlan],
    bondingKrw: bondingCostKrw[design.bondingPlan],
    totalKrw: 0
  };

  summary.totalKrw =
    summary.wallMaterialKrw +
    summary.thicknessKrw +
    summary.openingKrw +
    summary.entryBaseKrw +
    summary.entryAddonsKrw +
    summary.panelJointKrw +
    summary.doorKrw +
    summary.bondingKrw;

  return summary;
}

export function getStepOptionCostKrw(stepId: SimulatorStepId, optionId: string) {
  if (stepId === "material") {
    if (optionId === "1" || optionId === "2" || optionId === "3") {
      return thicknessSurchargeKrw[Number(optionId) as 1 | 2 | 3];
    }

    return materialPackageKrw[optionId as MaterialId] ?? 0;
  }

  if (stepId === "openings") {
    return openingCostKrw[optionId as OpeningPattern] ?? 0;
  }

  if (stepId === "entry") {
    if (optionId in cableBaseCostKrw) {
      return cableBaseCostKrw[optionId as CablePlan];
    }

    const stateKey = getEntryAddonStateKey(optionId as EntryAddonId);
    return entryAddonCostKrw[stateKey] ?? 0;
  }

  if (stepId === "panelJoint") {
    return panelJointCostKrw[optionId as PanelJointPlan] ?? 0;
  }

  if (stepId === "door") {
    return doorCostKrw[optionId as DoorPlan] ?? 0;
  }

  if (stepId === "bonding") {
    return bondingCostKrw[optionId as BondingPlan] ?? 0;
  }

  return 0;
}

export function getStepOptionCostLabel(stepId: SimulatorStepId, optionId: string) {
  const amount = getStepOptionCostKrw(stepId, optionId);

  if (stepId === "material" && (optionId === "2" || optionId === "3")) {
    return `추가 ${formatKrw(amount, { compact: true, signed: true })}`;
  }

  if (stepId === "material" && optionId === "1") {
    return "기본 두께";
  }

  if (stepId === "entry" && optionId.startsWith("filtered-")) {
    return `추가 ${formatKrw(amount, { compact: true, signed: true })}`;
  }

  if (stepId === "entry" && (optionId === "fiber-signal" || optionId === "wbc-nonconductive")) {
    return `추가 ${formatKrw(amount, { compact: true, signed: true })}`;
  }

  if (amount === 0) {
    return "추가 비용 없음";
  }

  return `약 ${formatKrw(amount, { compact: true })}`;
}
