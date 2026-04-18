import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Coins,
  ShieldCheck,
  TriangleAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getStepOptionCostLabel, pricingReference } from "@/features/simulator/data/pricing";
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
import {
  getOptionGradeSummary,
  type GradeTier
} from "@/features/simulator/lib/option-grades";
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
  priceLabel: string;
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

const scoreBreakdownGuide = [
  { label: "벽체 차폐 성능", weight: "20%" },
  { label: "개구부 / 환기 제어", weight: "17%" },
  { label: "관통부 / POE 제어", weight: "20%" },
  { label: "패널 조인트 건전성", weight: "15%" },
  { label: "출입문 건전성", weight: "15%" },
  { label: "본딩 / 접지 품질", weight: "13%" }
] as const;

const scoreGradeGuide = [
  { tier: "S", range: "90-100", label: "매우 우수" },
  { tier: "A", range: "80-89", label: "우수" },
  { tier: "B", range: "70-79", label: "양호" },
  { tier: "C", range: "60-69", label: "보완 필요" },
  { tier: "D", range: "50-59", label: "취약" },
  { tier: "E", range: "0-49", label: "매우 취약" }
] as const;

const strongChoiceGuide = [
  "벽체는 강철이나 복합패널이 상위권입니다. 구리 두께만 올린다고 자동 정답이 되지는 않습니다.",
  "패널 조인트는 연속 용접이 가장 강하고, 촘촘한 체결은 그 아래, 기본 체결은 더 약합니다.",
  "출입문은 촘촘한 체결과 도전성 가스켓을 같이 써야 높은 점수를 받습니다.",
  "환기나 개구부가 필요하면 WBC 환기구 1개나 허니컴 환기구 1개 같은 보호된 최소 개구부가 유리합니다.",
  "관통부는 무처리 구멍보다 필터 관통판, 통합 필터 관통판, 광섬유, WBC 비전도 서비스 조합이 좋습니다.",
  "본딩과 접지는 단일 기준 접지점과 브레이드 또는 다점 본딩 계열이 상위권입니다."
] as const;

const trapGuide = [
  "구리는 전도도가 높아 보여도 조인트와 개구부, 관통부가 약하면 전체 점수는 크게 떨어집니다.",
  "촘촘한 체결 패널 조인트는 좋아 보여도 연속 용접보다 약합니다.",
  "허니컴 환기구도 개수가 많아지면 누설 경로가 늘어납니다.",
  "무처리 관통 1개도 충분히 지배적인 누설 경로가 될 수 있습니다."
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
      pros: "구조가 단순해 보입니다.",
      cons: "본딩과 접지 경로가 부족하면 다른 개선 요소의 효과도 충분히 살아나기 어렵습니다."
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
      priceLabel: getStepOptionCostLabel(stepId, option.id),
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
    title: "1단계. 차폐실 외피 기본 설정",
    description:
      "벽체 재질과 두께를 먼저 정하지만, 실제 총점은 이후 조인트와 개구부, 관통부, 본딩에 크게 좌우됩니다.",
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
    title: "2단계. 패널 조인트 처리",
    description:
      "고정 패널의 이음부는 큰 벽체보다 먼저 병목이 되는 구간입니다. 구조적 연속성과 전기적 연속성을 같이 봐야 합니다.",
    criteria: getStep("panelJoint").criteria,
    groups: [
      {
        title: "패널 조인트 선택지",
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
    title: "3단계. 출입문 처리",
    description:
      "출입문은 용접으로 완전히 닫을 수 없기 때문에 체결 밀도와 가스켓 품질이 성능을 크게 좌우합니다.",
    criteria: getStep("door").criteria,
    groups: [
      {
        title: "출입문 선택지",
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
    title: "4단계. 환기 / 개구부 계획",
    description:
      "개구부는 의도적인 약점부입니다. 필요한 기능만 보호된 방식으로 최소화하는 것이 핵심입니다.",
    criteria: getStep("openings").criteria,
    groups: [
      {
        title: "환기 / 개구부 선택지",
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
    title: "5단계. 케이블 / 비전도 관통부 구성",
    description:
      "관통부는 기본 구조와 통과 서비스 구성을 분리해서 봐야 합니다. 어떤 서비스가 들어오느냐에 따라 보호 방식이 달라집니다.",
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
    title: "6단계. 본딩 / 접지 체계",
    description:
      "마지막 단계는 전류 경로와 전기적 연속성을 정리하는 단계입니다. 저렴해 보여도 빼면 전체 구조가 흔들릴 수 있습니다.",
    criteria: getStep("bonding").criteria,
    groups: [
      {
        title: "본딩 / 접지 선택지",
        items: buildItems(
          "bonding",
          orderOptions(bondingOptions, bondingDisplayOrder),
          (id) => getBondingImageSrc(id as Parameters<typeof getBondingImageSrc>[0])
        )
      }
    ]
  }
];

function getTierClassName(tier: GradeTier) {
  if (tier === "S") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
  if (tier === "A") return "border-sky-400/20 bg-sky-500/10 text-sky-100";
  if (tier === "B") return "border-cyan-400/20 bg-cyan-500/10 text-cyan-100";
  if (tier === "C") return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  if (tier === "D") return "border-orange-400/20 bg-orange-500/10 text-orange-100";
  return "border-rose-400/20 bg-rose-500/10 text-rose-100";
}

function ExplanationCard({
  item,
  stepId
}: {
  item: ExplanationItem;
  stepId: SimulatorStepId;
}) {
  const gradeSummary = getOptionGradeSummary(item.id, stepId);

  return (
    <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
      {item.imageSrc && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/8 bg-[#07101d]">
          <img src={item.imageSrc} alt={item.label} className="h-36 w-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="text-base font-medium text-white">{item.label}</div>
        <Badge className="border-white/10 bg-white/6 text-slate-200">{item.priceLabel}</Badge>
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

      <div className="mt-3 text-sm leading-6 text-slate-300">{item.description}</div>

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
            <Badge className="mb-3">버튼 1 학습 개요</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">
              선택지 설명과
              <br />
              점수 / 가격 기준
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
              각 선택지가 왜 좋은지, 어디가 함정인지, 그리고 대략 어느 정도 비용으로
              잡았는지를 먼저 보고 시뮬레이터로 들어갈 수 있게 정리해두었습니다.
              실제 견적서나 인증 문서가 아니라 교육용 추정 기준입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="lg" className="rounded-2xl" onClick={onBackHome}>
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
            <Button size="lg" className="rounded-2xl" onClick={onOpenSimulator}>
              시뮬레이터로 이동
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>점수 체계</CardTitle>
            <CardDescription>
              이 앱은 단순 평균이 아니라 weakest-link 철학으로 계산합니다. 벽체가 좋아도
              조인트, 출입문, 개구부, 관통부, 본딩 중 한 곳이 약하면 총점이 강하게 제한됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-medium">하위 점수 비중</span>
                </div>
                <div className="space-y-2">
                  {scoreBreakdownGuide.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2 text-sm text-slate-300"
                    >
                      <span>{item.label}</span>
                      <span className="font-medium text-white">{item.weight}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl border border-amber-400/15 bg-amber-400/8 px-3 py-3 text-sm leading-6 text-slate-200">
                  가장 약한 하위 점수가 최종 총점 상한을 강하게 잡습니다. 그래서 재질만
                  올리는 전략보다 불연속부를 줄이는 전략이 더 중요하게 반영됩니다.
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
                <div className="mb-3 text-sm font-medium text-white">차폐 성능 등급</div>
                <div className="grid gap-2 md:grid-cols-3">
                  {scoreGradeGuide.map((item) => (
                    <div
                      key={item.tier}
                      className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-semibold text-white">{item.tier}</span>
                        <span className="text-slate-400">{item.range}</span>
                      </div>
                      <div className="mt-2">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
                <div className="mb-3 text-sm font-medium text-white">대체로 점수가 좋은 선택</div>
                <div className="space-y-2">
                  {strongChoiceGuide.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 px-3 py-3 text-sm leading-6 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <TriangleAlert className="h-4 w-4 text-amber-300" />
                  <span className="font-medium">대표 함정</span>
                </div>
                <div className="space-y-2">
                  {trapGuide.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-amber-400/15 bg-amber-400/8 px-3 py-3 text-sm leading-6 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[var(--primary)]" />
              <div>
                <CardTitle>가격 기준</CardTitle>
                <CardDescription>
                  {pricingReference.updatedAt} 기준 교육용 추정 단가입니다. 실제 견적이 아니라
                  시세와 대표 부품 가격을 묶어 만든 학습용 숫자입니다.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-white/8 bg-[#091425] p-4 text-sm leading-7 text-slate-300">
              <div className="font-medium text-white">{pricingReference.model}</div>
              <div className="mt-2">{pricingReference.note}</div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {pricingReference.sources.map((source) => (
                <div
                  key={source.label}
                  className="rounded-[24px] border border-white/8 bg-[#091425] p-4 text-sm text-slate-300"
                >
                  <div className="font-medium text-white">{source.label}</div>
                  <div className="mt-2 leading-6">{source.detail}</div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm text-[var(--primary)] underline-offset-4 hover:underline"
                  >
                    출처 보기
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                        <ExplanationCard key={item.id} item={item} stepId={section.id} />
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
            <CardTitle>7단계. 최종 검토</CardTitle>
            <CardDescription>
              최종 결과에서는 총 학습 점수, 대역별 개념 성능, hotspot, 비용, 가성비를 함께
              보여줍니다.
            </CardDescription>
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
