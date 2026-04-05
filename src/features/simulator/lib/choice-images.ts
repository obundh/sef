import type {
  BondingPlan,
  CablePlan,
  DoorPlan,
  EntryAddonId,
  MaterialId,
  OpeningPattern,
  PanelJointPlan
} from "@/features/simulator/lib/types";

const imageModules = import.meta.glob("../../../../img/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default"
}) as Record<string, string>;

function getImage(filename: string) {
  return imageModules[`../../../../img/${filename}`] ?? null;
}

const materialImageMap: Record<MaterialId, string | null> = {
  aluminum: getImage("벽체-알루미늄.png"),
  steel: getImage("벽체-강철.png"),
  copper: getImage("벽체-구리.png"),
  stainless: getImage("벽체-스테인리스.png"),
  plastic: getImage("벽체-플라스틱.png"),
  "composite-panel": getImage("벽체-복합패널.png")
};

const openingImageMap: Partial<Record<OpeningPattern, string | null>> = {
  "two-round": getImage("개구부-원형2개.png"),
  "four-round": getImage("개구부-원형4개.png"),
  "slot-array": getImage("개구부-슬롯배열.png"),
  "honeycomb-one": getImage("허니컴환기구1개.png"),
  "honeycomb-two": getImage("허니컴환기구1개.png"),
  "wbc-vent-one": getImage("개구부-wbc환기구.png")
};

const cableImageMap: Partial<Record<CablePlan, string | null>> = {
  none: null,
  "single-filtered": getImage("관통판-필터관통구.png"),
  "integrated-filter-panel-one": getImage("관통판-전원신호통합필터관통판.png"),
  "single-raw": getImage("관통판-무처리관통구.png"),
  "multi-raw": getImage("관통판-무처리다중관통구.png")
};

const entryAddonImageMap: Partial<Record<EntryAddonId, string | null>> = {
  "filtered-power": null,
  "filtered-signal": null,
  "fiber-signal": null,
  "wbc-nonconductive": getImage("관통판-WBC비전도관통.png")
};

const panelJointImageMap: Partial<Record<PanelJointPlan, string | null>> = {
  "basic-bolted": getImage("조인트처리-기본체결패널조인트.png"),
  "dense-bolted": getImage("조인트처리-촘촘한체결패널조인트.png"),
  "continuous-welded": getImage("조인트처리-연속용접패널조인트.png")
};

const doorImageMap: Partial<Record<DoorPlan, string | null>> = {
  "basic-bolted-no-gasket": getImage("출입문-기본체결.png"),
  "dense-bolted-no-gasket": getImage("출입문-촘촘한체결.png"),
  "dense-bolted-conductive-gasket": getImage("출입문-촘촘한체결,도전성가스켓.png")
};

const bondingImageMap: Partial<Record<BondingPlan, string | null>> = {
  none: null,
  basic: getImage("본딩접지-기본본딩.png"),
  multipoint: getImage("본딩접지-다점본딩.png"),
  "single-point-basic": getImage("본딩접지-단일기준접지점+기본본딩.png"),
  "single-point-multipoint": getImage("본딩접지-단일기준접지점+다점본딩.png"),
  "single-point-braided": getImage("본딩접지-단일기준접지점+구리브레이드본딩.png")
};

export function getMaterialImageSrc(materialId: MaterialId | null) {
  return materialId ? materialImageMap[materialId] : null;
}

export function getOpeningImageSrc(openingPattern: OpeningPattern) {
  return openingImageMap[openingPattern] ?? null;
}

export function getCableImageSrc(cablePlan: CablePlan) {
  return cableImageMap[cablePlan] ?? null;
}

export function getEntryAddonImageSrc(addonId: EntryAddonId) {
  return entryAddonImageMap[addonId] ?? null;
}

export function getPanelJointImageSrc(panelJointPlan: PanelJointPlan) {
  return panelJointImageMap[panelJointPlan] ?? null;
}

export function getDoorImageSrc(doorPlan: DoorPlan) {
  return doorImageMap[doorPlan] ?? null;
}

export function getBondingImageSrc(bondingPlan: BondingPlan) {
  return bondingImageMap[bondingPlan] ?? null;
}
