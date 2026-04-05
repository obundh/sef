export type GradeTier = "S" | "A" | "B" | "C" | "D" | "E";

export interface OptionGradeSummary {
  shielding: GradeTier;
  value: GradeTier;
  build: GradeTier;
  note?: string;
}

export const optionGrades: Record<string, OptionGradeSummary> = {
  aluminum: { shielding: "B", value: "B", build: "A" },
  steel: { shielding: "A", value: "A", build: "B" },
  copper: { shielding: "B", value: "D", build: "C" },
  stainless: { shielding: "B", value: "C", build: "B" },
  plastic: { shielding: "E", value: "D", build: "A" },
  "composite-panel": { shielding: "S", value: "B", build: "C" },

  "1": { shielding: "C", value: "A", build: "A" },
  "2": { shielding: "B", value: "S", build: "A" },
  "3": { shielding: "A", value: "C", build: "B" },

  sealed: {
    shielding: "S",
    value: "A",
    build: "A",
    note: "미션에 따라 필수 개구부가 있으면 정답이 아닐 수 있습니다."
  },
  "wbc-vent-one": { shielding: "S", value: "B", build: "C" },
  "honeycomb-one": { shielding: "A", value: "A", build: "B" },
  "honeycomb-two": { shielding: "B", value: "C", build: "C" },
  "two-round": { shielding: "D", value: "C", build: "A" },
  "four-round": { shielding: "E", value: "D", build: "A" },
  "slot-array": { shielding: "E", value: "D", build: "A" },

  none: {
    shielding: "S",
    value: "A",
    build: "A",
    note: "미션에서 서비스 인입이 필요하면 점수가 달라질 수 있습니다."
  },
  "single-filtered": { shielding: "A", value: "A", build: "B" },
  "integrated-filter-panel-one": { shielding: "S", value: "B", build: "C" },
  "single-raw": { shielding: "D", value: "C", build: "A" },
  "multi-raw": { shielding: "E", value: "D", build: "A" },

  "filtered-power": { shielding: "A", value: "B", build: "B" },
  "filtered-signal": { shielding: "A", value: "B", build: "B" },
  "fiber-signal": { shielding: "S", value: "B", build: "B" },
  "wbc-nonconductive": { shielding: "A", value: "C", build: "C" },

  "continuous-welded": { shielding: "S", value: "C", build: "D" },
  "dense-bolted": { shielding: "B", value: "A", build: "B" },
  "basic-bolted": { shielding: "D", value: "B", build: "A" },

  "dense-bolted-conductive-gasket": { shielding: "S", value: "B", build: "C" },
  "dense-bolted-no-gasket": { shielding: "B", value: "A", build: "B" },
  "basic-bolted-no-gasket": { shielding: "D", value: "B", build: "A" },

  "single-point-braided": { shielding: "S", value: "B", build: "C" },
  "single-point-multipoint": { shielding: "A", value: "B", build: "C" },
  "single-point-basic": { shielding: "A", value: "A", build: "B" },
  multipoint: { shielding: "B", value: "B", build: "B" },
  basic: { shielding: "C", value: "A", build: "A" },
  none_bonding: { shielding: "E", value: "D", build: "A" }
};

export function getOptionGradeSummary(optionId: string, contextStep?: string): OptionGradeSummary | null {
  if (contextStep === "bonding" && optionId === "none") {
    return optionGrades.none_bonding;
  }

  return optionGrades[optionId] ?? null;
}
