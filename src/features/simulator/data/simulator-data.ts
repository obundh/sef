import type {
  BondingPlan,
  CablePlan,
  ChoiceOption,
  DoorPlan,
  EntryAddonId,
  MaterialId,
  MaterialOption,
  OpeningPattern,
  PanelJointPlan,
  SimulatorDesign,
  StepDefinition
} from "@/features/simulator/lib/types";

export const initialDesign: SimulatorDesign = {
  materialId: null,
  thicknessMm: 1,
  openingPattern: "sealed",
  cablePlan: "none",
  entryAddons: {
    filteredPower: false,
    filteredSignal: false,
    fiberSignal: false,
    wbcNonconductive: false
  },
  panelJointPlan: "basic-bolted",
  doorPlan: "basic-bolted-no-gasket",
  bondingPlan: "none"
};

export const simulatorSteps: StepDefinition[] = [
  {
    id: "material",
    title: "1단계. 차폐실 외피 기본 설정",
    shortLabel: "차폐실 외피 기본 설정",
    description:
      "차폐실의 기본 외피 재질과 두께를 정합니다. EMP 차폐 설계에서는 재료만이 아니라 이후의 조인트, 출입문, 개구부, 관통부 관리가 함께 맞아야 합니다.",
    criteria: [
      "강철과 복합패널은 저주파 대응과 구조 안정성 측면에서 교육용 상위 선택지입니다.",
      "구리와 알루미늄은 장점이 있지만 자동 정답이 되지 않도록 설계되어 있습니다.",
      "벽체 점수는 출발점이고, 전체 상한은 조인트와 개구부, 관통부가 더 강하게 좌우합니다."
    ]
  },
  {
    id: "panelJoint",
    title: "2단계. 패널 조인트 처리",
    shortLabel: "패널 조인트 처리",
    description:
      "고정 패널 사이의 조인트를 어떤 방식으로 연결할지 정합니다. 고정 패널에서는 연속 용접이 최상위 개념입니다.",
    criteria: [
      "패널 조인트는 넓은 벽체보다 먼저 병목이 되기 쉬운 불연속부입니다.",
      "체결 밀도를 높이면 좋아지지만, 연속 용접보다 더 높은 단계로 보지는 않습니다.",
      "외피를 먼저 만들고 그 외피의 연속성을 어떻게 유지하는지 배우는 단계입니다."
    ]
  },
  {
    id: "door",
    title: "3단계. 출입문 처리",
    shortLabel: "출입문 처리",
    description:
      "출입문은 용접으로 닫을 수 없으므로 체결 밀도와 도전성 가스켓의 조합으로 성능이 갈립니다. 반복 개폐되는 위치라 hotspot이 되기 쉽습니다.",
    criteria: [
      "도전성 가스켓은 체결을 대체하는 것이 아니라 접촉면의 전기적 연속성을 높이는 보조 수단입니다.",
      "볼트가 많아 보여도 가스켓이 없으면 최상위 설계로 보지 않습니다.",
      "패널 조인트와 출입문을 따로 보는 것이 실제 차폐실 구조를 이해하는 데 더 자연스럽습니다."
    ]
  },
  {
    id: "openings",
    title: "4단계. 환기 / 개구부 계획",
    shortLabel: "환기 / 개구부 계획",
    description:
      "외피에 의도적으로 생기는 약점부 중 하나인 환기와 개구부를 계획합니다. 필요한 기능을 어떻게 보호된 방식으로 넣을지 판단하는 단계입니다.",
    criteria: [
      "긴 슬롯과 큰 개구부는 차폐면의 연속성을 약화시키고 resonance와 leakage를 키웁니다.",
      "허니컴 환기구는 보호된 개구부의 기본 개념이고, WBC 환기구는 더 높은 성능의 보호형 환기 개념입니다.",
      "좋은 환기구도 개수가 많아지면 누설 경로가 함께 늘어납니다."
    ]
  },
  {
    id: "entry",
    title: "5단계. 케이블 / 비전도 관통부 구성",
    shortLabel: "케이블 / 비전도 관통부 구성",
    description:
      "관통부는 관통판 구조와 실제 통과 서비스로 나눠 생각해야 합니다. 광섬유는 관통판의 종류가 아니라 서비스 경로이고, 필터 관통판은 전원선이나 금속 신호선의 보호 방식입니다.",
    criteria: [
      "관통판 구조와 통과 서비스를 분리해 보는 것이 실제 설계 사고에 더 가깝습니다.",
      "무처리 전도성 관통은 하나만 있어도 지배적인 약점이 될 수 있습니다.",
      "전원선, 금속 신호선, 광 통신, 비전도 서비스는 같은 관통부에서도 서로 다른 보호 개념으로 다뤄야 합니다."
    ]
  },
  {
    id: "bonding",
    title: "6단계. 본딩 / 접지 체계",
    shortLabel: "본딩 / 접지 체계",
    description:
      "본딩 방식과 기준 접지 구조를 정합니다. 전기적 연속성과 전류 경로를 마감하는 단계로, 앞선 선택의 효과를 실제로 살릴지 무너뜨릴지 결정합니다.",
    criteria: [
      "부적절한 본딩과 접지는 다른 개선 요소의 효과를 깨뜨릴 수 있습니다.",
      "단일 기준 접지점은 불필요한 접지 경로를 줄이는 교육용 모델입니다.",
      "구리 브레이드 본딩은 구조물 간 강한 연속성을 보여 주는 고급 옵션입니다."
    ]
  },
  {
    id: "review",
    title: "7단계. 최종 검토",
    shortLabel: "최종 검토",
    description:
      "선택 결과를 weakest-link 기반 학습 점수, hotspot, 대역별 개념 성능으로 확인합니다.",
    criteria: [
      "좋은 벽체 하나보다 보호된 개구부, 보호된 관통부, 좋은 조인트, 좋은 본딩의 조합이 더 중요합니다.",
      "완전히 막는 방보다 필요한 서비스만 보호된 방식으로 들이는 방이 더 현실적인 정답일 수 있습니다.",
      "한 개의 큰 약점이 전체 성능 상한을 얼마나 강하게 제한하는지 확인해 보세요."
    ]
  }
];

export const materials: Record<MaterialId, MaterialOption> = {
  aluminum: {
    id: "aluminum",
    label: "알루미늄",
    description:
      "가볍고 가공이 쉬운 기본 옵션입니다. 고주파 측면에서는 강점이 있지만 EMP 지향 최상위 정답군으로 보지는 않습니다.",
    boxFill: "#7dd3fc",
    stroke: "#38bdf8",
    wallBase: 60,
    lowBandBias: 1,
    highBandBias: 4,
    costIndex: 40,
    weightIndex: 28
  },
  steel: {
    id: "steel",
    label: "강철",
    description:
      "저주파 대응과 구조 강성이 좋아 EMP 지향 교육용 상위 정답군으로 들어갑니다.",
    boxFill: "#94a3b8",
    stroke: "#cbd5e1",
    wallBase: 74,
    lowBandBias: 9,
    highBandBias: 2,
    costIndex: 46,
    weightIndex: 54
  },
  copper: {
    id: "copper",
    label: "구리",
    description:
      "전도도는 매우 좋지만 무조건 정답은 아닙니다. 조인트와 개구부 관리가 같이 따라줘야 합니다.",
    boxFill: "#f59e0b",
    stroke: "#fbbf24",
    wallBase: 69,
    lowBandBias: 2,
    highBandBias: 6,
    costIndex: 68,
    weightIndex: 59
  },
  stainless: {
    id: "stainless",
    label: "스테인리스",
    description:
      "내구성과 유지보수성은 좋지만 EMP 지향 최고점 루트에서는 비용 대비 이점이 다소 제한적입니다.",
    boxFill: "#e2e8f0",
    stroke: "#f8fafc",
    wallBase: 64,
    lowBandBias: 4,
    highBandBias: 2,
    costIndex: 56,
    weightIndex: 48
  },
  plastic: {
    id: "plastic",
    label: "플라스틱",
    description: "차폐층이 없는 교육용 함정 카드입니다.",
    boxFill: "#c084fc",
    stroke: "#d8b4fe",
    wallBase: 16,
    lowBandBias: -8,
    highBandBias: -8,
    costIndex: 20,
    weightIndex: 10
  },
  "composite-panel": {
    id: "composite-panel",
    label: "복합패널",
    description:
      "강철 외피와 도전성 내피를 조합한 차폐 패널 개념입니다. 실무형 상위 옵션으로 취급합니다.",
    boxFill: "#67e8f9",
    stroke: "#7dd3fc",
    wallBase: 79,
    lowBandBias: 8,
    highBandBias: 5,
    costIndex: 61,
    weightIndex: 44
  }
};

export const thicknessOptions: ChoiceOption<"1" | "2" | "3">[] = [
  {
    id: "1",
    label: "1 mm",
    description: "가벼운 기본 패널 두께입니다.",
    scoreDelta: 0
  },
  {
    id: "2",
    label: "2 mm",
    description: "벽체 기본 성능이 올라가지만 자동 정답은 아닙니다.",
    scoreDelta: 6
  },
  {
    id: "3",
    label: "3 mm",
    description: "벽체 점수는 더 오르지만 무게와 비용 부담이 커집니다.",
    scoreDelta: 10
  }
];

export const openingOptions: ChoiceOption<OpeningPattern>[] = [
  {
    id: "sealed",
    label: "개구부 없음",
    description: "자유 모드 기준으로 가장 보수적인 표면입니다.",
    scoreDelta: 20
  },
  {
    id: "two-round",
    label: "원형 2개",
    description: "구멍 수가 적어 보여도 보호되지 않은 개구부입니다.",
    scoreDelta: 8
  },
  {
    id: "four-round",
    label: "원형 4개",
    description: "개구부 수가 늘어날수록 벽면 연속성 관리가 어려워집니다.",
    scoreDelta: 0
  },
  {
    id: "slot-array",
    label: "슬롯 배열",
    description: "길게 이어진 슬롯은 resonance와 leakage를 만들기 쉬운 함정 카드입니다.",
    scoreDelta: -18
  },
  {
    id: "honeycomb-one",
    label: "허니컴 환기구 1개",
    description: "환기가 필요할 때 비교적 보호된 방식으로 선택할 수 있는 옵션입니다.",
    scoreDelta: 16
  },
  {
    id: "honeycomb-two",
    label: "허니컴 환기구 2개",
    description: "허니컴 자체는 좋지만 개수가 늘어나면 누설 경로도 같이 늘어납니다.",
    scoreDelta: 12
  },
  {
    id: "wbc-vent-one",
    label: "WBC 환기구 1개",
    description:
      "길이와 경로 관리가 더 강조된 고성능 보호형 환기 개념입니다. 필요한 환기를 넣으면서도 약점 확대를 줄입니다.",
    scoreDelta: 18
  }
];

export const cableOptions: ChoiceOption<CablePlan>[] = [
  {
    id: "none",
    label: "관통판 없음",
    description: "전도성 서비스가 없는 경우에만 가장 단순한 경계가 됩니다.",
    scoreDelta: 16
  },
  {
    id: "single-filtered",
    label: "필터 관통판 1개",
    description: "전원선이나 금속 신호선을 필터 경로로 들이는 기본 보호형 관통판입니다.",
    scoreDelta: 12
  },
  {
    id: "integrated-filter-panel-one",
    label: "전원·신호 통합 필터 관통판 1개",
    description: "전원과 금속 신호선을 같은 서비스 엔트리 패널에서 정리하는 상위 옵션입니다.",
    scoreDelta: 16
  },
  {
    id: "single-raw",
    label: "무처리 관통 1개",
    description: "전도성 선로가 필터 없이 경계를 통과하는 취약한 관통 구조입니다.",
    scoreDelta: -8
  },
  {
    id: "multi-raw",
    label: "무처리 다중 관통",
    description: "여러 전도성 선로를 무처리로 들여오는 가장 취약한 관통 구조입니다.",
    scoreDelta: -20
  }
];

export const entryAddonOptions: ChoiceOption<EntryAddonId>[] = [
  {
    id: "filtered-power",
    label: "전원선 인입",
    description: "전원선이 실제로 관통부를 통과해야 함을 표시합니다.",
    scoreDelta: 0
  },
  {
    id: "filtered-signal",
    label: "금속 신호선 인입",
    description: "금속 케이블 기반 신호선이 관통부를 통과해야 함을 표시합니다.",
    scoreDelta: 0
  },
  {
    id: "fiber-signal",
    label: "광섬유 통신 인입",
    description: "통신은 광 경로로 분리해 들일 수 있습니다.",
    scoreDelta: 0
  },
  {
    id: "wbc-nonconductive",
    label: "WBC 비전도 서비스",
    description: "비전도 서비스 경로를 WBC 기반 통로로 따로 확보합니다.",
    scoreDelta: 0
  }
];

export const panelJointOptions: ChoiceOption<PanelJointPlan>[] = [
  {
    id: "basic-bolted",
    label: "기본 체결 패널 조인트",
    description: "패널 조인트를 최소 수준의 체결만으로 연결한 상태입니다.",
    scoreDelta: 3
  },
  {
    id: "dense-bolted",
    label: "촘촘한 체결 패널 조인트",
    description: "볼트 간격을 줄여 패널 조인트의 구조적 일관성을 높입니다.",
    scoreDelta: 13
  },
  {
    id: "continuous-welded",
    label: "연속 용접 패널 조인트",
    description: "고정 패널 조인트의 최상위 처리 방법으로 가정하는 옵션입니다.",
    scoreDelta: 22
  }
];

export const doorOptions: ChoiceOption<DoorPlan>[] = [
  {
    id: "basic-bolted-no-gasket",
    label: "기본 체결, 가스켓 없음",
    description: "출입문 프레임이 최소 수준으로만 체결되고 도전성 가스켓이 없는 상태입니다.",
    scoreDelta: 1
  },
  {
    id: "dense-bolted-no-gasket",
    label: "촘촘한 체결, 가스켓 없음",
    description: "체결 밀도는 높지만 가스켓이 없어 최상위 설계로 보지는 않습니다.",
    scoreDelta: 10
  },
  {
    id: "dense-bolted-conductive-gasket",
    label: "촘촘한 체결 + 도전성 가스켓",
    description: "볼트 압착과 도전성 가스켓을 함께 적용한 출입문 상위 조합입니다.",
    scoreDelta: 19
  }
];

export const bondingOptions: ChoiceOption<BondingPlan>[] = [
  {
    id: "none",
    label: "본딩 없음",
    description: "전기적 연속성과 접지 경로가 크게 불안정해집니다.",
    scoreDelta: -10
  },
  {
    id: "basic",
    label: "기본 본딩",
    description: "최소 수준의 본딩 스트랩과 접지 경로만 갖춘 상태입니다.",
    scoreDelta: 8
  },
  {
    id: "multipoint",
    label: "다점 본딩",
    description: "구조물 여러 지점에 본딩 경로를 두는 개선안입니다.",
    scoreDelta: 14
  },
  {
    id: "single-point-basic",
    label: "단일 기준 접지점 + 기본 본딩",
    description: "불안정한 접지 경로를 줄이면서 최소 본딩을 유지합니다.",
    scoreDelta: 16
  },
  {
    id: "single-point-multipoint",
    label: "단일 기준 접지점 + 다점 본딩",
    description: "기준 접지점을 정리하면서도 구조 본딩은 여러 지점으로 구성합니다.",
    scoreDelta: 18
  },
  {
    id: "single-point-braided",
    label: "단일 기준 접지점 + 구리 브레이드 본딩",
    description: "구리 브레이드 본딩을 사용하는 고급 마감 옵션입니다.",
    scoreDelta: 20
  }
];

export const optionLearningNotes: Record<string, { pros: string; cons: string }> = {
  aluminum: {
    pros: "가볍고 가공이 쉬워 기본 차폐 패널 재료로 접근하기 좋습니다.",
    cons: "EMP 지향 최상위 루트에서는 강철이나 복합패널보다 우선순위가 낮습니다."
  },
  steel: {
    pros: "저주파 대응과 구조 강성 측면에서 유리합니다.",
    cons: "무게 부담이 크고 개구부나 조인트가 약하면 벽체 강점이 무너집니다."
  },
  copper: {
    pros: "전도도가 높아 초보자에게 매력적으로 보입니다.",
    cons: "조인트와 개구부 관리가 약하면 자동 정답이 되지 않습니다."
  },
  stainless: {
    pros: "내구성과 유지보수성이 좋습니다.",
    cons: "비용 대비 차폐 효율은 상황에 따라 애매할 수 있습니다."
  },
  plastic: {
    pros: "가볍고 값이 쌉니다.",
    cons: "차폐실 벽체로는 사실상 오답에 가깝습니다."
  },
  "composite-panel": {
    pros: "강철 계열 구조성과 도전성 내피 개념을 함께 가져갈 수 있습니다.",
    cons: "비용과 제작 복잡도가 상대적으로 올라갑니다."
  },
  "1": {
    pros: "가볍고 시작하기 쉽습니다.",
    cons: "벽체 자체 여유가 적어 다른 병목 관리가 더 중요해집니다."
  },
  "2": {
    pros: "무게와 성능의 균형이 비교적 좋습니다.",
    cons: "두께만으로 상위 설계가 되지는 않습니다."
  },
  "3": {
    pros: "벽체 기본 점수는 더 올라갑니다.",
    cons: "무게와 비용이 크게 늘고, 조인트가 약하면 투자 대비 효과가 줄어듭니다."
  },
  sealed: {
    pros: "가장 보수적인 개구부 상태입니다.",
    cons: "서버실이나 사람이 들어가는 차폐실에서는 필요한 기능을 만족하지 못할 수 있습니다."
  },
  "two-round": {
    pros: "구멍 수가 적어 직관적으로 안전해 보입니다.",
    cons: "보호되지 않은 개구부라는 점은 그대로 남습니다."
  },
  "four-round": {
    pros: "여러 서비스 경로를 쉽게 만들 수 있습니다.",
    cons: "개구부 수가 늘어나 벽체 연속성 관리가 어려워집니다."
  },
  "slot-array": {
    pros: "통풍이나 배선 공간을 넓게 만들기 쉽습니다.",
    cons: "긴 슬롯은 resonance와 leakage 측면에서 대표적인 함정입니다."
  },
  "honeycomb-one": {
    pros: "환기를 넣으면서도 일반 개구부보다 보호된 구조를 만들 수 있습니다.",
    cons: "압력 손실과 셀 치수 관리가 중요합니다."
  },
  "honeycomb-two": {
    pros: "환기량은 더 확보할 수 있습니다.",
    cons: "좋은 구조라도 개수가 늘면 누설 경로도 함께 늘어납니다."
  },
  "wbc-vent-one": {
    pros: "길이 확보형 보호 환기 개념으로 상위 선택지에 가깝습니다.",
    cons: "구조가 좋더라도 결국 개구부를 만든다는 사실 자체는 남습니다."
  },
  none: {
    pros: "저장실 같은 시나리오에서는 가장 단순하고 강한 경계가 됩니다.",
    cons: "전원이나 통신을 실제로 들여와야 한다면 보호된 관통부를 따로 설계해야 합니다."
  },
  "single-filtered": {
    pros: "전원선이나 금속 신호선을 보호된 방식으로 들이는 기본 관통판 역할을 합니다.",
    cons: "서비스 종류가 많아지면 통합 관통판보다 여유가 적습니다."
  },
  "integrated-filter-panel-one": {
    pros: "전원과 금속 신호선을 한 서비스 엔트리 패널에서 정리하기 좋습니다.",
    cons: "구조가 복잡하고 비용이 올라갑니다."
  },
  "single-raw": {
    pros: "구조는 단순해 보입니다.",
    cons: "무처리 전도성 관통 하나만으로도 지배적인 누설 경로가 될 수 있습니다."
  },
  "multi-raw": {
    pros: "서비스를 많이 들이기 쉽습니다.",
    cons: "관통부 관리가 무너져 큰 감점을 받습니다."
  },
  "filtered-power": {
    pros: "전원은 필터 경로로 따로 관리해야 한다는 점을 학습할 수 있습니다.",
    cons: "필터된 전원선도 관통판 구조가 약하면 충분히 보호되지 않습니다."
  },
  "filtered-signal": {
    pros: "금속 신호선도 필터를 거쳐 들이면 일반 케이블보다 누설 위험을 줄일 수 있습니다.",
    cons: "필터 전원과 신호선이 함께 많아지면 단순 관통판보다 통합 패널이 더 적합할 수 있습니다."
  },
  "fiber-signal": {
    pros: "통신을 광 경로로 분리하면 전도성 통신선보다 위험을 크게 줄일 수 있습니다.",
    cons: "광 통신만으로 전원 인입 문제까지 해결되지는 않습니다."
  },
  "wbc-nonconductive": {
    pros: "비전도 서비스 경로를 일반 케이블과 분리해 보호된 통로로 추가할 수 있습니다.",
    cons: "추가 관통부 자체는 늘어나므로 정말 필요한 경우에만 쓰는 편이 좋습니다."
  },
  "basic-bolted": {
    pros: "제작과 해체가 쉽습니다.",
    cons: "패널 연속성이 약해 병목이 되기 쉽습니다."
  },
  "dense-bolted": {
    pros: "기본 체결보다 조인트 일관성이 좋아집니다.",
    cons: "볼트가 많아 보여도 연속 용접보다 상위 해법은 아닙니다."
  },
  "continuous-welded": {
    pros: "고정 패널 조인트의 연속성을 가장 강하게 확보합니다.",
    cons: "제작, 수정, 유지보수 난이도가 올라갑니다."
  },
  "basic-bolted-no-gasket": {
    pros: "구조가 단순합니다.",
    cons: "문 둘레 접촉 연속성이 약해 hotspot이 되기 쉽습니다."
  },
  "dense-bolted-no-gasket": {
    pros: "체결 밀도가 올라가 문 프레임 압착은 좋아집니다.",
    cons: "도전성 가스켓이 없으면 최상위 설계로 보기 어렵습니다."
  },
  "dense-bolted-conductive-gasket": {
    pros: "체결 압착과 도전성 가스켓을 함께 써 문 둘레 접촉 일관성을 높입니다.",
    cons: "제작 정밀도와 유지 관리가 따라와야 합니다."
  },
  basic: {
    pros: "최소한의 연속성과 접지 경로를 확보할 수 있습니다.",
    cons: "기준 접지 구조가 없으면 경로 관리가 애매해질 수 있습니다."
  },
  multipoint: {
    pros: "여러 구조 지점의 본딩을 강화할 수 있습니다.",
    cons: "기준점 관리가 없으면 경로가 복잡해질 수 있습니다."
  },
  "single-point-basic": {
    pros: "기준 접지점을 정리하면서 기본 본딩을 확보합니다.",
    cons: "구조 연속성이 매우 중요한 경우 더 강한 본딩이 필요할 수 있습니다."
  },
  "single-point-multipoint": {
    pros: "기준점 정리와 다점 본딩의 장점을 함께 노릴 수 있습니다.",
    cons: "시공과 설명이 조금 더 복잡해집니다."
  },
  "single-point-braided": {
    pros: "구리 브레이드로 구조물 사이 연속성을 강하게 보여 줄 수 있습니다.",
    cons: "비용과 부품 수가 올라갑니다."
  }
};
