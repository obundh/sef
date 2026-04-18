import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  formatKrw,
  getDesignCostSummary,
  pricingReference
} from "@/features/simulator/data/pricing";
import {
  bondingOptions,
  cableOptions,
  doorOptions,
  entryAddonOptions,
  materials,
  openingOptions,
  panelJointOptions,
  simulatorSteps
} from "@/features/simulator/data/simulator-data";
import { getVisibleEntryAddonIds } from "@/features/simulator/lib/entry-config";
import { scoreDesign } from "@/features/simulator/lib/scoring";
import type {
  ScoreBreakdown,
  SimulatorDesign,
  SimulatorStepId,
  ValueAssessment
} from "@/features/simulator/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ResultPanelProps {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
}

const breakdownLabels: Record<keyof ScoreBreakdown, string> = {
  wall: "벽체 차폐 성능",
  openingControl: "개구부 / 환기 제어",
  entryControl: "관통부 / POE 제어",
  panelJointIntegrity: "패널 조인트 건전성",
  doorIntegrity: "출입문 건전성",
  bondingQuality: "본딩 / 접지 품질"
};

function getLabel<T extends { id: string; label: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.label ?? id;
}

function getEntrySummary(design: SimulatorDesign) {
  const baseLabel = getLabel(cableOptions, design.cablePlan);
  const addonLabels = getVisibleEntryAddonIds(design).map((id) =>
    getLabel(entryAddonOptions, id)
  );

  if (addonLabels.length === 0) {
    return baseLabel;
  }

  return design.cablePlan === "none"
    ? addonLabels.join(" + ")
    : [baseLabel, ...addonLabels].join(" + ");
}

function BreakdownRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b1628] p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/6">
        <div
          className="h-2 rounded-full bg-[var(--primary)] transition-[width] duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ValueBadge({ rating }: { rating: ValueAssessment["rating"] }) {
  const className =
    rating === "excellent"
      ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
      : rating === "good"
        ? "border-sky-400/30 bg-sky-500/12 text-sky-100"
        : rating === "balanced"
          ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
          : "border-rose-400/30 bg-rose-500/12 text-rose-100";

  const label =
    rating === "excellent"
      ? "가성비 우수"
      : rating === "good"
        ? "가성비 양호"
        : rating === "balanced"
          ? "가성비 보통"
          : "가성비 낮음";

  return <Badge className={className}>{label}</Badge>;
}

function PerformanceGradeBadge({
  tier,
  label
}: {
  tier: "S" | "A" | "B" | "C" | "D" | "E";
  label: string;
}) {
  const className =
    tier === "S"
      ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
      : tier === "A"
        ? "border-sky-400/30 bg-sky-500/12 text-sky-100"
        : tier === "B"
          ? "border-cyan-400/30 bg-cyan-500/12 text-cyan-100"
          : tier === "C"
            ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
            : tier === "D"
              ? "border-orange-400/30 bg-orange-500/12 text-orange-100"
              : "border-rose-400/30 bg-rose-500/12 text-rose-100";

  return <Badge className={className}>{`${tier} 등급 · ${label}`}</Badge>;
}

export function ResultPanel({ design, activeStep }: ResultPanelProps) {
  const step = simulatorSteps.find((item) => item.id === activeStep) ?? simulatorSteps[0];
  const result = scoreDesign(design);
  const costSummary = getDesignCostSummary(design);
  const materialLabel = design.materialId ? materials[design.materialId].label : "미선택";
  const openingLabel = getLabel(openingOptions, design.openingPattern);
  const cableLabel = getEntrySummary(design);
  const panelJointLabel = getLabel(panelJointOptions, design.panelJointPlan);
  const doorLabel = getLabel(doorOptions, design.doorPlan);
  const bondingLabel = getLabel(bondingOptions, design.bondingPlan);

  const chartData = [
    { band: "저대역 회복력", score: result.conceptualBands.low },
    { band: "중대역 회복력", score: result.conceptualBands.mid },
    { band: "고대역 회복력", score: result.conceptualBands.high }
  ];

  const reviewMode = activeStep === "review";

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-3">{reviewMode ? "최종 결과" : "진행 힌트"}</Badge>
            <CardTitle>
              {reviewMode ? "학습 점수와 비용 분석" : `${step.shortLabel} 단계 메모`}
            </CardTitle>
            <CardDescription>
              {reviewMode
                ? "실제 인증 결과가 아니라 교육용 추정 점수와 교육용 추정 단가입니다."
                : "현재 선택이 어떤 병목과 비용 구조를 만드는지 요약합니다."}
            </CardDescription>
          </div>

          {reviewMode && (
            <div className="rounded-3xl border border-[var(--primary)]/30 bg-[var(--primary)]/8 px-4 py-3 text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">총 학습 점수</div>
              <div className="text-4xl font-semibold text-white">{result.total}</div>
              <div className="mt-2 flex justify-end">
                <PerformanceGradeBadge
                  tier={result.performanceGrade.tier}
                  label={result.performanceGrade.label}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-white">현재 추정 비용</div>
              <div className="text-sm text-slate-400">{pricingReference.model}</div>
            </div>
            <ValueBadge rating={result.valueAssessment.rating} />
          </div>

          <div className="text-2xl font-semibold text-white">{formatKrw(costSummary.totalKrw)}</div>
          <div className="mt-3 text-sm leading-7 text-slate-300">{result.valueAssessment.headline}</div>
        </div>

        {!reviewMode ? (
          <>
            <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
              <div className="text-sm font-medium text-white">현재 설계 요약</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  벽체: {materialLabel} / 두께 {design.thicknessMm} mm
                </li>
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  환기 / 개구부: {openingLabel}
                </li>
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  관통부: {cableLabel}
                </li>
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  패널 조인트: {panelJointLabel}
                </li>
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  출입문: {doorLabel}
                </li>
                <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                  본딩 / 접지: {bondingLabel}
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-amber-400/20 bg-amber-400/8 p-4 text-sm leading-7 text-slate-200">
              현재는 예산 상한 없이, 각 선택지를 순수 차폐 성능과 가격 관점에서 비교합니다.
              나중에 예산 상한을 넣으면 같은 가격 정보로 다시 판정을 붙일 수 있습니다.
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">성능 우선 분석</div>
                  <PerformanceGradeBadge
                    tier={result.performanceGrade.tier}
                    label={result.performanceGrade.label}
                  />
                </div>
                <div className="text-sm leading-7 text-slate-300">{result.riskHeadline}</div>
                <div className="mt-3 rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300">
                  <span className="font-medium text-white">차폐 성능 등급:</span>{" "}
                  {result.performanceGrade.description}
                </div>
                <div className="mt-3 rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300">
                  <span className="font-medium text-white">가장 잘한 선택:</span> {result.bestMove}
                </div>
                <div className="mt-3 rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300">
                  <span className="font-medium text-white">다음 성능 개선:</span> {result.nextUpgrade}
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">가격 / 가성비 분석</div>
                  <ValueBadge rating={result.valueAssessment.rating} />
                </div>
                <div className="text-sm leading-7 text-slate-300">
                  {result.valueAssessment.headline}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    총 추정 비용 <span className="font-medium text-white">{formatKrw(costSummary.totalKrw)}</span>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    비용 지수 <span className="font-medium text-white">{result.valueAssessment.costIndex}</span>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    무게 지수 <span className="font-medium text-white">{result.valueAssessment.weightIndex}</span>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    시공 복잡도 <span className="font-medium text-white">{result.valueAssessment.complexityIndex}</span>
                  </div>
                  <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    가성비 점수 <span className="font-medium text-white">{result.valueAssessment.efficiencyScore}</span>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300">
                  {result.valueAssessment.summary}
                </div>
                <div className="mt-3 rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-3 text-sm text-slate-300">
                  <span className="font-medium text-white">가성비 개선 포인트:</span>{" "}
                  {result.valueAssessment.nextMove}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 text-sm font-medium text-white">현재 설계 요약</div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    벽체: {materialLabel} / 두께 {design.thicknessMm} mm
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    환기 / 개구부: {openingLabel}
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    관통부: {cableLabel}
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    패널 조인트: {panelJointLabel}
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    출입문: {doorLabel}
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    본딩 / 접지: {bondingLabel}
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 text-sm font-medium text-white">단계별 추정 비용</div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    벽체 재질 <span className="float-right font-medium text-white">{formatKrw(costSummary.wallMaterialKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    두께 추가 <span className="float-right font-medium text-white">{formatKrw(costSummary.thicknessKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    환기 / 개구부 <span className="float-right font-medium text-white">{formatKrw(costSummary.openingKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    관통판 기본 <span className="float-right font-medium text-white">{formatKrw(costSummary.entryBaseKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    서비스 추가 <span className="float-right font-medium text-white">{formatKrw(costSummary.entryAddonsKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    패널 조인트 <span className="float-right font-medium text-white">{formatKrw(costSummary.panelJointKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    출입문 <span className="float-right font-medium text-white">{formatKrw(costSummary.doorKrw)}</span>
                  </li>
                  <li className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2">
                    본딩 / 접지 <span className="float-right font-medium text-white">{formatKrw(costSummary.bondingKrw)}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid gap-3">
              {(Object.entries(result.breakdown) as Array<[keyof ScoreBreakdown, number]>).map(
                ([key, score]) => (
                  <BreakdownRow key={key} label={breakdownLabels[key]} score={score} />
                )
              )}
            </div>

            <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
              <div className="mb-4 text-sm font-medium text-white">주파수 대역 개념 성능</div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="band" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#081121",
                        border: "1px solid rgba(148,163,184,0.18)",
                        borderRadius: "16px",
                        color: "#e5eefc"
                      }}
                    />
                    <Bar dataKey="score" fill="#58d3c2" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {result.hotspots.map((item) => (
                <div key={item.id} className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{item.title}</div>
                    <Badge
                      className={
                        item.severity === "critical"
                          ? "border-rose-400/30 bg-rose-500/12 text-rose-200"
                          : item.severity === "warn"
                            ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
                            : "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
                      }
                    >
                      {item.severity === "critical"
                        ? "주요 위험"
                        : item.severity === "warn"
                          ? "중간 우려"
                          : "양호"}
                    </Badge>
                  </div>
                  <div className="text-sm leading-7 text-slate-300">{item.detail}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
