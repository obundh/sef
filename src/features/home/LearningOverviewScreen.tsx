import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
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
import {
  getBondingImageSrc,
  getCableImageSrc,
  getDoorImageSrc,
  getEntryAddonImageSrc,
  getMaterialImageSrc,
  getOpeningImageSrc,
  getPanelJointImageSrc
} from "@/features/simulator/lib/choice-images";
import type { SimulatorStepId } from "@/features/simulator/lib/types";

interface LearningOverviewScreenProps {
  onBackHome: () => void;
  onOpenSimulator: () => void;
}

interface ExplanationItem {
  id: string;
  label: string;
  description: string;
  pros: string;
  cons: string;
  imageSrc?: string | null;
}

interface ExplanationGroup {
  title: string;
  items: ExplanationItem[];
}

interface ExplanationSection {
  id: SimulatorStepId;
  title: string;
  description: string;
  criteria: string[];
  groups: ExplanationGroup[];
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

function getLearningNote(stepId: SimulatorStepId, optionId: string) {
  if (stepId === "bonding" && optionId === "none") {
    return {
      pros: "구조는 단순해 보입니다.",
      cons: "본딩과 접지 경로가 약하면 다른 개선 요소의 효과도 함께 무너집니다."
    };
  }

  return optionLearningNotes[optionId] ?? { pros: "", cons: "" };
}

function buildItems(
  stepId: SimulatorStepId,
  options: Array<{ id: string; label: string; description: string }>,
  imageResolver?: (id: string) => string | null
): ExplanationItem[] {
  return options.map((option) => {
    const note = getLearningNote(stepId, option.id);

    return {
      id: option.id,
      label: option.label,
      description: option.description,
      pros: note.pros,
      cons: note.cons,
      imageSrc: imageResolver?.(option.id) ?? null
    };
  });
}

function getStep(stepId: SimulatorStepId) {
  return simulatorSteps.find((step) => step.id === stepId) ?? simulatorSteps[0];
}

const sections: ExplanationSection[] = [
  {
    id: "material",
    title: getStep("material").title,
    description: getStep("material").description,
    criteria: getStep("material").criteria,
    groups: [
      {
        title: "벽체 재질",
        items: buildItems(
          "material",
          orderOptions(Object.values(materials), materialDisplayOrder),
          (id) => getMaterialImageSrc(id as keyof typeof materials)
        )
      },
      {
        title: "벽체 두께",
        items: buildItems("material", thicknessOptions)
      }
    ]
  },
  {
    id: "panelJoint",
    title: getStep("panelJoint").title,
    description: getStep("panelJoint").description,
    criteria: getStep("panelJoint").criteria,
    groups: [
      {
        title: "패널 조인트 처리",
        items: buildItems(
          "panelJoint",
          orderOptions(panelJointOptions, panelJointDisplayOrder),
          (id) => getPanelJointImageSrc(id as Parameters<typeof getPanelJointImageSrc>[0])
        )
      }
    ]
  },
  {
    id: "door",
    title: getStep("door").title,
    description: getStep("door").description,
    criteria: getStep("door").criteria,
    groups: [
      {
        title: "출입문 처리",
        items: buildItems(
          "door",
          orderOptions(doorOptions, doorDisplayOrder),
          (id) => getDoorImageSrc(id as Parameters<typeof getDoorImageSrc>[0])
        )
      }
    ]
  },
  {
    id: "openings",
    title: getStep("openings").title,
    description: getStep("openings").description,
    criteria: getStep("openings").criteria,
    groups: [
      {
        title: "환기 / 개구부 계획",
        items: buildItems(
          "openings",
          orderOptions(openingOptions, openingDisplayOrder),
          (id) => getOpeningImageSrc(id as Parameters<typeof getOpeningImageSrc>[0])
        )
      }
    ]
  },
  {
    id: "entry",
    title: getStep("entry").title,
    description: getStep("entry").description,
    criteria: getStep("entry").criteria,
    groups: [
      {
        title: "관통부 기본 구조",
        items: buildItems(
          "entry",
          orderOptions(cableOptions, cableDisplayOrder),
          (id) => getCableImageSrc(id as Parameters<typeof getCableImageSrc>[0])
        )
      },
      {
        title: "통과 서비스 구성",
        items: buildItems(
          "entry",
          orderOptions(entryAddonOptions, entryAddonDisplayOrder),
          (id) => getEntryAddonImageSrc(id as Parameters<typeof getEntryAddonImageSrc>[0])
        )
      }
    ]
  },
  {
    id: "bonding",
    title: getStep("bonding").title,
    description: getStep("bonding").description,
    criteria: getStep("bonding").criteria,
    groups: [
      {
        title: "본딩 / 접지 체계",
        items: buildItems(
          "bonding",
          orderOptions(bondingOptions, bondingDisplayOrder),
          (id) => getBondingImageSrc(id as Parameters<typeof getBondingImageSrc>[0])
        )
      }
    ]
  }
];

function ExplanationCard({ item }: { item: ExplanationItem }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
      {item.imageSrc && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/8 bg-[#07101d]">
          <img src={item.imageSrc} alt={item.label} className="h-36 w-full object-cover" />
        </div>
      )}

      <div className="text-base font-medium text-white">{item.label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{item.description}</div>

      <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/8 px-3 py-3 text-sm leading-6 text-slate-200">
        <span className="font-medium text-emerald-200">장점:</span> {item.pros}
      </div>

      <div className="mt-2 rounded-2xl border border-amber-400/15 bg-amber-400/8 px-3 py-3 text-sm leading-6 text-slate-200">
        <span className="font-medium text-amber-200">주의:</span> {item.cons}
      </div>
    </div>
  );
}

export function LearningOverviewScreen({
  onBackHome,
  onOpenSimulator
}: LearningOverviewScreenProps) {
  const reviewStep = getStep("review");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 lg:px-6">
      <header className="mb-6 rounded-[32px] border border-white/10 bg-[var(--card)]/90 px-6 py-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-3">버튼 1 설명 모음</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">
              선택지 설명
              <br />
              한눈에 보기
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
              시뮬레이터에 들어가는 재질, 조인트, 출입문, 개구부, 관통부, 본딩 선택지를
              단계별로 정리했습니다. 각 카드에는 설명, 장점, 주의점이 함께 들어 있어 학생이
              왜 그 선택이 유리하거나 불리한지 먼저 읽고 들어갈 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="lg" className="rounded-2xl" onClick={onBackHome}>
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
            <Button size="lg" className="rounded-2xl" onClick={onOpenSimulator}>
              시뮬레이터로 이동
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-4">
        {sections.map((section) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                    <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  {section.criteria.map((criterion) => (
                    <div
                      key={criterion}
                      className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2 text-sm leading-6 text-slate-300"
                    >
                      {criterion}
                    </div>
                  ))}
                </div>

                {section.groups.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <div className="text-sm font-medium text-white">{group.title}</div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {group.items.map((item) => (
                        <ExplanationCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.section>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>{reviewStep.title}</CardTitle>
            <CardDescription>{reviewStep.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviewStep.criteria.map((criterion) => (
              <div
                key={criterion}
                className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm leading-6 text-slate-300"
              >
                {criterion}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
