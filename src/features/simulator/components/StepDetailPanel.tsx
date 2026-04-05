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
  optionLearningNotes,
  panelJointOptions,
  simulatorSteps,
  thicknessOptions
} from "@/features/simulator/data/simulator-data";
import { getEntryAddonStateKey } from "@/features/simulator/lib/entry-config";
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

function OptionTile({
  title,
  selected,
  onClick,
  accentColor = "var(--primary)",
  previewSrc
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
  accentColor?: string;
  previewSrc?: string | null;
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
          <img src={previewSrc} alt={title} className="h-28 w-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-white sm:text-base">{title}</div>
        {selected && (
          <span className="rounded-full bg-emerald-500/15 p-1 text-emerald-300">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </button>
  );
}

function getLearningNote(stepId: SimulatorStepId, optionId: string) {
  if (stepId === "bonding" && optionId === "none") {
    return {
      pros: "구조가 단순하게 보입니다.",
      cons: "본딩과 접지 경로가 약하면 다른 개선 효과도 함께 무너집니다."
    };
  }

  return optionLearningNotes[optionId];
}

function LearningOverviewSection({
  title,
  items,
  activeStep
}: {
  title: string;
  items: Array<{ id: string; label: string }>;
  activeStep: SimulatorStepId;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="space-y-2">
        {items.map((item) => {
          const note = getLearningNote(activeStep, item.id);

          if (!note) {
            return null;
          }

          return (
            <div key={item.id} className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3">
              <div className="mb-2 text-sm font-medium text-white">{item.label}</div>
              <div className="text-sm leading-6 text-slate-300">
                <span className="text-emerald-300">장점:</span> {note.pros}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-300">
                <span className="text-amber-300">주의:</span> {note.cons}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
            <Badge className="mb-3">단계 제어</Badge>
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
              <div className="grid gap-3">
                {orderedMaterials.map((material) => (
                  <OptionTile
                    key={material.id}
                    title={material.label}
                    selected={design.materialId === material.id}
                    onClick={() => onMaterialChange(material.id)}
                    accentColor={material.stroke}
                    previewSrc={getMaterialImageSrc(material.id)}
                  />
                ))}
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">벽체 두께 선택</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {thicknessOptions.map((option) => (
                    <OptionTile
                      key={option.id}
                      title={option.label}
                      selected={design.thicknessMm === Number(option.id)}
                      onClick={() => onThicknessChange(Number(option.id) as 1 | 2 | 3)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeStep === "panelJoint" && (
            <div className="grid gap-3">
              {orderedPanelJoints.map((option) => (
                <OptionTile
                  key={option.id}
                  title={option.label}
                  selected={design.panelJointPlan === option.id}
                  onClick={() => onPanelJointChange(option.id)}
                  previewSrc={getPanelJointImageSrc(option.id)}
                />
              ))}
            </div>
          )}

          {activeStep === "door" && (
            <div className="grid gap-3">
              {orderedDoors.map((option) => (
                <OptionTile
                  key={option.id}
                  title={option.label}
                  selected={design.doorPlan === option.id}
                  onClick={() => onDoorChange(option.id)}
                  previewSrc={getDoorImageSrc(option.id)}
                />
              ))}
            </div>
          )}

          {activeStep === "openings" && (
            <div className="grid gap-3">
              {orderedOpenings.map((option) => (
                <OptionTile
                  key={option.id}
                  title={option.label}
                  selected={design.openingPattern === option.id}
                  onClick={() => onOpeningChange(option.id)}
                  previewSrc={getOpeningImageSrc(option.id)}
                />
              ))}
            </div>
          )}

          {activeStep === "entry" && (
            <div className="space-y-4">
              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">관통부 기본 구조</div>
                <div className="grid gap-3">
                  {orderedCables.map((option) => (
                    <OptionTile
                      key={option.id}
                      title={option.label}
                      selected={design.cablePlan === option.id}
                      onClick={() => onCableChange(option.id)}
                      previewSrc={getCableImageSrc(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-200">통과 서비스 구성</div>
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
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeStep === "bonding" && (
            <div className="grid gap-3">
              {orderedBonding.map((option) => (
                <OptionTile
                  key={option.id}
                  title={option.label}
                  selected={design.bondingPlan === option.id}
                  onClick={() => onBondingChange(option.id)}
                  previewSrc={getBondingImageSrc(option.id)}
                />
              ))}
            </div>
          )}

          {activeStep === "review" && (
            <div className="rounded-3xl border border-[var(--primary)]/30 bg-[var(--primary)]/8 p-5">
              <div className="text-sm font-medium text-white">모든 단계가 완료되었습니다.</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">
                오른쪽 결과 패널에서 학습 점수, 대역별 개념 성능, hotspot, 다음 개선 포인트를
                확인할 수 있습니다. 필요하면 이전 단계로 돌아가 조인트, 관통부, 본딩 선택을 다시
                비교해 보세요.
              </div>
            </div>
          )}
        </motion.div>

        {activeStep !== "review" && (
          <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
            <div className="mb-3 text-sm font-medium text-white">학습 개요</div>
            <div className="mb-4 space-y-2 text-sm text-slate-300">
              {step.criteria.map((criterion) => (
                <div key={criterion} className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  {criterion}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {activeStep === "material" && (
                <>
                  <LearningOverviewSection
                    title="재질 비교"
                    items={orderedMaterials.map((item) => ({ id: item.id, label: item.label }))}
                    activeStep={activeStep}
                  />
                  <LearningOverviewSection
                    title="두께 비교"
                    items={thicknessOptions.map((item) => ({ id: item.id, label: item.label }))}
                    activeStep={activeStep}
                  />
                </>
              )}

              {activeStep === "panelJoint" && (
                <LearningOverviewSection
                  title="패널 조인트 선택지"
                  items={orderedPanelJoints.map((item) => ({ id: item.id, label: item.label }))}
                  activeStep={activeStep}
                />
              )}

              {activeStep === "door" && (
                <LearningOverviewSection
                  title="출입문 선택지"
                  items={orderedDoors.map((item) => ({ id: item.id, label: item.label }))}
                  activeStep={activeStep}
                />
              )}

              {activeStep === "openings" && (
                <LearningOverviewSection
                  title="환기 / 개구부 선택지"
                  items={orderedOpenings.map((item) => ({ id: item.id, label: item.label }))}
                  activeStep={activeStep}
                />
              )}

              {activeStep === "entry" && (
                <>
                  <LearningOverviewSection
                    title="관통부 기본 구조"
                    items={orderedCables.map((item) => ({ id: item.id, label: item.label }))}
                    activeStep={activeStep}
                  />
                  <LearningOverviewSection
                    title="통과 서비스 구성"
                    items={orderedEntryAddons.map((item) => ({ id: item.id, label: item.label }))}
                    activeStep={activeStep}
                  />
                </>
              )}

              {activeStep === "bonding" && (
                <LearningOverviewSection
                  title="본딩 / 접지 선택지"
                  items={orderedBonding.map((item) => ({ id: item.id, label: item.label }))}
                  activeStep={activeStep}
                />
              )}
            </div>
          </div>
        )}

        <div className="sticky bottom-3 z-10 flex gap-3 rounded-3xl border border-white/10 bg-[#07111f]/92 p-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button variant="secondary" onClick={onPrev} disabled={activeIndex === 0} className="flex-1">
            이전 단계
          </Button>
          <Button onClick={onNext} disabled={activeIndex === simulatorSteps.length - 1} className="flex-1">
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
