export type SimulatorStepId =
  | "material"
  | "openings"
  | "entry"
  | "panelJoint"
  | "door"
  | "bonding"
  | "review";

export type MissionId = "server-room" | "storage-room" | "occupied-room";

export type MaterialId =
  | "aluminum"
  | "steel"
  | "copper"
  | "stainless"
  | "plastic"
  | "composite-panel";

export type OpeningPattern =
  | "sealed"
  | "two-round"
  | "four-round"
  | "slot-array"
  | "honeycomb-one"
  | "honeycomb-two"
  | "wbc-vent-one";

export type CablePlan =
  | "none"
  | "single-filtered"
  | "single-raw"
  | "multi-raw"
  | "integrated-filter-panel-one";

export type EntryAddonId =
  | "filtered-power"
  | "filtered-signal"
  | "fiber-signal"
  | "wbc-nonconductive";

export interface EntryAddons {
  filteredPower: boolean;
  filteredSignal: boolean;
  fiberSignal: boolean;
  wbcNonconductive: boolean;
}

export type PanelJointPlan = "basic-bolted" | "dense-bolted" | "continuous-welded";

export type DoorPlan =
  | "basic-bolted-no-gasket"
  | "dense-bolted-no-gasket"
  | "dense-bolted-conductive-gasket";

export type BondingPlan =
  | "none"
  | "basic"
  | "multipoint"
  | "single-point-basic"
  | "single-point-multipoint"
  | "single-point-braided";

export type Severity = "good" | "warn" | "critical";
export type MissionStatus = "pass" | "warn" | "fail";

export interface MaterialOption {
  id: MaterialId;
  label: string;
  description: string;
  boxFill: string;
  stroke: string;
  wallBase: number;
  lowBandBias: number;
  highBandBias: number;
  costIndex: number;
  weightIndex: number;
}

export interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  description: string;
  scoreDelta: number;
}

export interface StepDefinition {
  id: SimulatorStepId;
  title: string;
  shortLabel: string;
  description: string;
  criteria: string[];
}

export interface MissionDefinition {
  id: MissionId;
  title: string;
  summary: string;
  objective: string;
  requirements: string[];
  scoreThreshold: number;
  successMessage: string;
  failureMessage: string;
}

export interface SimulatorDesign {
  materialId: MaterialId | null;
  thicknessMm: 1 | 2 | 3;
  openingPattern: OpeningPattern;
  cablePlan: CablePlan;
  entryAddons: EntryAddons;
  panelJointPlan: PanelJointPlan;
  doorPlan: DoorPlan;
  bondingPlan: BondingPlan;
}

export interface HotspotItem {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
}

export interface MissionCheck {
  id: string;
  label: string;
  satisfied: boolean;
}

export interface MissionEvaluation {
  missionId: MissionId;
  title: string;
  summary: string;
  objective: string;
  status: MissionStatus;
  message: string;
  scoreThreshold: number;
  conditionsMet: boolean;
  scoreQualified: boolean;
  requirementChecks: MissionCheck[];
}

export interface ScoreBreakdown {
  wall: number;
  openingControl: number;
  entryControl: number;
  panelJointIntegrity: number;
  doorIntegrity: number;
  bondingQuality: number;
}

export interface ValueAssessment {
  costIndex: number;
  weightIndex: number;
  complexityIndex: number;
  efficiencyScore: number;
  rating: "excellent" | "good" | "balanced" | "poor";
  headline: string;
  summary: string;
  nextMove: string;
}

export interface ScoreResult {
  total: number;
  conceptualBands: {
    low: number;
    mid: number;
    high: number;
  };
  breakdown: ScoreBreakdown;
  hotspots: HotspotItem[];
  mission: MissionEvaluation;
  riskHeadline: string;
  bestMove: string;
  nextUpgrade: string;
  valueAssessment: ValueAssessment;
}
