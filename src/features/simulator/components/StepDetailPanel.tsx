import { motion } from "motion/react";
import { Check, Download, RotateCcw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  bondingOptions,
  cableOptions,
  doorOptions,
  entryAddonOptions,
  materials,
  openingOptions,
  panelJointOptions,
  simulatorSteps,
  thicknessOptions
} from "@/features/simulator/data/simulator-data";
import { getStepOptionCostLabel } from "@/features/simulator/data/pricing";
import { getEntryAddonStateKey } from "@/features/simulator/lib/entry-config";
import {
  getOptionGradeSummary,
  type OptionGradeSummary
} from "@/features/simulator/lib/option-grades";
import {
  getBondingImageSrc,
  getCableImageSrc,
  getDoorImageSrc,
  getEntryAddonImageSrc,
  getMaterialImageSrc,
  getOpeningImageSrc,
  getPanelJointImageSrc
} from "@/features/simulator/lib/choice-images";
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
import { cn } from "@/lib/utils";

interface StepDetailPanelProps {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
  onMaterialChange: (materialId: MaterialId) => void;
  onThicknessChange: (thicknessMm: 1 | 2 | 3) => void;
  onOpeningChange: (pattern: OpeningPattern) => void;
  onCableChange: (plan: CablePlan) => void;
  onEntryAddonToggle: (addonId: EntryAddonId, enabled: boolean) => void;
  onPanelJointChange: (plan: PanelJointPlan) => void;
  onDoorChange: (plan: DoorPlan) => void;
  onBondingChange: (plan: BondingPlan) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onExport: () => void;
  onImportRequest: () => void;
}

const materialDisplayOrder = [
  "copper",
  "steel",
  "aluminum",
  "composite-panel",
  "stainless",
  "plastic"
] as const;

const openingDisplayOrder = [
  "sealed",
  "wbc-vent-one",
  "honeycomb-one",
  "honeycomb-two",
  "two-round",
  "four-round",
  "slot-array"
] as const;

const cableDisplayOrder = [
  "none",
  "single-filtered",
  "integrated-filter-panel-one",
  "single-raw",
  "multi-raw"
] as const;

const entryAddonDisplayOrder = [
  "filtered-power",
  "filtered-signal",
  "fiber-signal",
  "wbc-nonconductive"
] as const;

const panelJointDisplayOrder = [
  "continuous-welded",
  "dense-bolted",
  "basic-bolted"
] as const;

const doorDisplayOrder = [
  "dense-bolted-conductive-gasket",
  "dense-bolted-no-gasket",
  "basic-bolted-no-gasket"
] as const;

const bondingDisplayOrder = [
  "none",
  "basic",
  "multipoint",
  "single-point-basic",
  "single-point-braided",
  "single-point-multipoint"
] as const;

function orderOptions<T extends { id: string }>(options: T[], order: readonly string[]) {
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...options].sort((left, right) => {
    const leftRank = rank.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rank.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

function getTierClassName(tier: OptionGradeSummary["shielding"]) {
  if (tier === "S") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
  if (tier === "A") return "border-sky-400/20 bg-sky-500/10 text-sky-100";
  if (tier === "B") return "border-cyan-400/20 bg-cyan-500/10 text-cyan-100";
  if (tier === "C") return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  if (tier === "D") return "border-orange-400/20 bg-orange-500/10 text-orange-100";
  return "border-rose-400/20 bg-rose-500/10 text-rose-100";
}

function OptionTile({
  title,
  selected,
  onClick,
  accentColor = "var(--primary)",
  previewSrc,
  gradeSummary,
  costLabel
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
  accentColor?: string;
  previewSrc?: string | null;
  gradeSummary?: OptionGradeSummary | null;
  costLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-3 text-left transition sm:p-4",
        selected
          ? "border-[var(--primary)]/40 bg-[var(--primary)]/10"
          : "border-white/8 bg-[#091425] hover:border-white/15 hover:bg-[#0d1b31]"
      )}
      style={selected ? { boxShadow: `inset 0 0 0 1px ${accentColor}22` } : undefined}
    >
      {previewSrc && (
        <div className="mb-3 overflow-hidden rounded-xl border border-white/8 bg-[#07101d]">
          <img src={previewSrc} alt={title} className="h-36 w-full object-cover sm:h-28" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-medium leading-6 text-white">{title}</div>
          {costLabel && <div className="mt-1 text-xs text-slate-400">{costLabel}</div>}
        </div>

        {selected && (
          <span className="rounded-full bg-emerald-500/15 p-1 text-emerald-300">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {gradeSummary && (
        <div className="mt-3 flex flex-wrap gap-2">
          <div
            className={`rounded-full border px-2 py-1 text-[11px] font-medium ${getTierClassName(
              gradeSummary.shielding
            )}`}
          >
            차폐 {gradeSummary.shielding}
          </div>
          <div
            className={`rounded-full border px-2 py-1 text-[11px] font-medium ${getTierClassName(
              gradeSummary.value
            )}`}
          >
            가성비 {gradeSummary.value}
          </div>
          <div
            className={`rounded-full border px-2 py-1 text-[11px] font-medium ${getTierClassName(
              gradeSummary.build
            )}`}
          >
            시공성 {gradeSummary.build}
          </div>
        </div>
      )}
    </button>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <div className="mb-3 text-sm font-medium text-slate-200">{title}</div>;
}

export function StepDetailPanel({
  design,
  activeStep,
  onMaterialChange,
  onThicknessChange,
  onOpeningChange,
  onCableChange,
  onEntryAddonToggle,
  onPanelJointChange,
  onDoorChange,
  onBondingChange,
  onNext,
  onPrev,
  onReset,
  onExport,
  onImportRequest
}: StepDetailPanelProps) {
  const step = simulatorSteps.find((item) => item.id === activeStep) ?? simulatorSteps[0];
  const activeIndex = simulatorSteps.findIndex((item) => item.id === activeStep);
  const orderedMaterials = orderOptions(Object.values(materials), materialDisplayOrder);
  const orderedOpenings = orderOptions(openingOptions, openingDisplayOrder);
  const orderedCables = orderOptions(cableOptions, cableDisplayOrder);
  const orderedEntryAddons = orderOptions(entryAddonOptions, entryAddonDisplayOrder);
  const orderedPanelJoints = orderOptions(panelJointOptions, panelJointDisplayOrder);
  const orderedDoors = orderOptions(doorOptions, doorDisplayOrder);
  const orderedBonding = orderOptions(bondingOptions, bondingDisplayOrder);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge className="mb-3">단계 선택</Badge>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={onImportRequest}>
              <Upload className="h-4 w-4" />
              불러오기
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeStep === "material" && (
            <>
              <div>
                <SectionHeading title="벽체 재질" />
                <div className="grid gap-3">
                  {orderedMaterials.map((material) => (
                    <OptionTile
                      key={material.id}
                      title={material.label}
                      selected={design.materialId === material.id}
                      onClick={() => onMaterialChange(material.id)}
                      accentColor={material.stroke}
                      previewSrc={getMaterialImageSrc(material.id)}
                      gradeSummary={getOptionGradeSummary(material.id, activeStep)}
                      costLabel={getStepOptionCostLabel(activeStep, material.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionHeading title="벽체 두께" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {thicknessOptions.map((option) => (
                    <OptionTile
                      key={option.id}
                      title={option.label}
                      selected={design.thicknessMm === Number(option.id)}
                      onClick={() => onThicknessChange(Number(option.id) as 1 | 2 | 3)}
                      gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                      costLabel={getStepOptionCostLabel(activeStep, option.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeStep === "panelJoint" && (
            <div>
              <SectionHeading title="패널 조인트 방식" />
              <div className="grid gap-3">
                {orderedPanelJoints.map((option) => (
                  <OptionTile
                    key={option.id}
                    title={option.label}
                    selected={design.panelJointPlan === option.id}
                    onClick={() => onPanelJointChange(option.id)}
                    previewSrc={getPanelJointImageSrc(option.id)}
                    gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                    costLabel={getStepOptionCostLabel(activeStep, option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeStep === "door" && (
            <div>
              <SectionHeading title="출입문 처리" />
              <div className="grid gap-3">
                {orderedDoors.map((option) => (
                  <OptionTile
                    key={option.id}
                    title={option.label}
                    selected={design.doorPlan === option.id}
                    onClick={() => onDoorChange(option.id)}
                    previewSrc={getDoorImageSrc(option.id)}
                    gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                    costLabel={getStepOptionCostLabel(activeStep, option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeStep === "openings" && (
            <div>
              <SectionHeading title="환기 / 개구부 계획" />
              <div className="grid gap-3">
                {orderedOpenings.map((option) => (
                  <OptionTile
                    key={option.id}
                    title={option.label}
                    selected={design.openingPattern === option.id}
                    onClick={() => onOpeningChange(option.id)}
                    previewSrc={getOpeningImageSrc(option.id)}
                    gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                    costLabel={getStepOptionCostLabel(activeStep, option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeStep === "entry" && (
            <div className="space-y-4">
              <div>
                <SectionHeading title="관통부 기본 구조" />
                <div className="grid gap-3">
                  {orderedCables.map((option) => (
                    <OptionTile
                      key={option.id}
                      title={option.label}
                      selected={design.cablePlan === option.id}
                      onClick={() => onCableChange(option.id)}
                      previewSrc={getCableImageSrc(option.id)}
                      gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                      costLabel={getStepOptionCostLabel(activeStep, option.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SectionHeading title="통과 서비스 구성" />
                <div className="grid gap-3">
                  {orderedEntryAddons.map((option) => {
                    const stateKey = getEntryAddonStateKey(option.id);

                    return (
                      <OptionTile
                        key={option.id}
                        title={option.label}
                        selected={design.entryAddons[stateKey]}
                        onClick={() =>
                          onEntryAddonToggle(option.id, !design.entryAddons[stateKey])
                        }
                        previewSrc={getEntryAddonImageSrc(option.id)}
                        gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                        costLabel={getStepOptionCostLabel(activeStep, option.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeStep === "bonding" && (
            <div>
              <SectionHeading title="본딩 / 접지 체계" />
              <div className="grid gap-3">
                {orderedBonding.map((option) => (
                  <OptionTile
                    key={option.id}
                    title={option.label}
                    selected={design.bondingPlan === option.id}
                    onClick={() => onBondingChange(option.id)}
                    previewSrc={getBondingImageSrc(option.id)}
                    gradeSummary={getOptionGradeSummary(option.id, activeStep)}
                    costLabel={getStepOptionCostLabel(activeStep, option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeStep === "review" && (
            <div className="rounded-3xl border border-[var(--primary)]/30 bg-[var(--primary)]/8 p-5">
              <div className="text-sm font-medium text-white">모든 단계 선택이 완료되었습니다.</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">
                오른쪽 결과 패널에서 총 학습 점수, 약한 구간, 대역별 개념 성능, 추정 비용과
                가성비를 함께 비교할 수 있습니다. 수정이 필요하면 이전 단계로 돌아가 다른
                선택지를 바로 비교해보세요.
              </div>
            </div>
          )}
        </motion.div>

        <div className="sticky bottom-3 z-10 flex gap-3 rounded-3xl border border-white/10 bg-[#07111f]/92 p-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="flex-1"
          >
            이전 단계
          </Button>
          <Button
            onClick={onNext}
            disabled={activeIndex === simulatorSteps.length - 1}
            className="flex-1"
          >
            {activeStep === "bonding"
              ? "최종 결과 보기"
              : activeStep === "review"
                ? "완료"
                : "다음 단계"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
