import { Suspense, lazy, useMemo, useRef } from "react";
import type { ChangeEventHandler } from "react";
import { ChevronLeft, RotateCcw, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ProductionPreview } from "@/features/simulator/components/ProductionPreview";
import { StepDetailPanel } from "@/features/simulator/components/StepDetailPanel";
import { StepNavigator } from "@/features/simulator/components/StepNavigator";
import { missionOptions } from "@/features/simulator/data/missions";
import { exportDesignJson, parseDesignJson } from "@/features/simulator/lib/io";
import { scoreDesign } from "@/features/simulator/lib/scoring";
import { useSimulatorStore } from "@/features/simulator/lib/simulator-store";
import { cn } from "@/lib/utils";

interface SimulatorWorkspaceProps {
  onBackHome: () => void;
}

const ResultPanel = lazy(async () => {
  const module = await import("@/features/simulator/components/ResultPanel");
  return { default: module.ResultPanel };
});

export function SimulatorWorkspace({ onBackHome }: SimulatorWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    missionId,
    design,
    activeStep,
    setMissionId,
    setMaterial,
    setThickness,
    setOpeningPattern,
    setCablePlan,
    setEntryAddon,
    setPanelJointPlan,
    setDoorPlan,
    setBondingPlan,
    setDesign,
    goToStep,
    nextStep,
    previousStep,
    reset
  } = useSimulatorStore();

  const result = useMemo(() => scoreDesign(design, missionId), [design, missionId]);

  const handleExport = () => {
    const blob = new Blob([exportDesignJson(design, missionId)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "emp-shield-room-design.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const nextState = parseDesignJson(text);
      setMissionId(nextState.missionId);
      setDesign(nextState.design);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "설계 JSON을 불러오지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1640px] flex-col px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImport}
      />

      <header className="mb-4 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[var(--card)]/90 px-4 py-4 shadow-panel sm:px-6 sm:py-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={onBackHome}
            aria-label="메인으로"
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Shield className="h-3.5 w-3.5 text-[var(--primary)]" />
              교육용 EMP 차폐실 설계 시뮬레이터
            </div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
              차폐실 제작 과정을 단계별로 조립
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:leading-7">
              모바일에서 한눈에 보이도록 단계 진행, 제작 공간, 선택 카드, 결과 패널을 세로 흐름으로
              정리했습니다. 벽체보다 개구부, 관통판, 조인트, 출입문, 본딩이 전체 병목을 얼마나 크게 바꾸는지
              비교해 볼 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[320px] xl:items-end">
          <Button variant="outline" onClick={reset} className="w-full xl:w-auto">
            <RotateCcw className="h-4 w-4" />
            전체 초기화
          </Button>

          <Card className="border-[var(--primary)]/20 bg-[var(--primary)]/8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">현재 설계 힌트</CardTitle>
              <CardDescription>
                미션 조건과 권장 통과선을 같이 보면서 병목을 줄여 보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-200">
              지금 설계 방향은 <span className="font-medium text-white">{result.riskHeadline}</span>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="mb-4">
        <Card>
          <CardHeader className="pb-4">
            <Badge className="w-fit">Mission Condition</Badge>
            <CardTitle>미션 조건</CardTitle>
            <CardDescription>
              같은 설계라도 미션이 바뀌면 정답 루트가 달라집니다. 무조건 막는 것이 아니라, 필요한 기능을 조건에
              맞게 안전하게 통과시키는 설계를 골라야 합니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              {missionOptions.map((mission) => {
                const isActive = mission.id === missionId;

                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => setMissionId(mission.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      isActive
                        ? "border-[var(--primary)]/40 bg-[var(--primary)]/10"
                        : "border-white/8 bg-[#091425] hover:border-white/15 hover:bg-[#0d1b31]"
                    )}
                  >
                    <div className="mb-2 text-base font-medium text-white">{mission.title}</div>
                    <div className="mb-2 text-sm text-slate-300">{mission.summary}</div>
                    <div className="mb-3 text-sm leading-6 text-slate-400">{mission.objective}</div>
                    <div className="text-xs text-slate-500">권장 통과선 {mission.scoreThreshold}점</div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 text-sm font-medium text-white">현재 미션 요구 사항</div>
                <ul className="space-y-2 text-sm text-slate-300">
                  {result.mission.requirementChecks.map((check) => (
                    <li
                      key={check.id}
                      className={cn(
                        "rounded-2xl border px-3 py-2",
                        check.satisfied
                          ? "border-emerald-400/20 bg-emerald-500/8 text-emerald-100"
                          : "border-rose-400/20 bg-rose-500/8 text-rose-100"
                      )}
                    >
                      {check.satisfied ? "충족" : "미충족"} · {check.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/8 bg-[#091425] p-4">
                <div className="mb-2 text-sm font-medium text-white">미션 판정</div>
                <div
                  className={cn(
                    "mb-3 inline-flex rounded-full border px-3 py-1 text-xs",
                    result.mission.status === "pass"
                      ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
                      : result.mission.status === "warn"
                        ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
                        : "border-rose-400/30 bg-rose-500/12 text-rose-100"
                  )}
                >
                  {result.mission.status === "pass"
                    ? "미션 성공"
                    : result.mission.status === "warn"
                      ? "조건 충족, 점수 미달"
                      : "미션 실패"}
                </div>
                <div className="mb-3 text-sm leading-7 text-slate-300">{result.mission.message}</div>
                <div className="rounded-2xl border border-white/6 bg-[#0c1a2c] px-3 py-2 text-sm text-slate-300">
                  현재 점수 {result.total}점 / 권장 통과선 {result.mission.scoreThreshold}점
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <main className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px] xl:items-start">
        <div className="order-1 xl:col-start-1">
          <StepNavigator activeStep={activeStep} onStepChange={goToStep} />
        </div>

        <div className="order-2 xl:col-start-1">
          <StepDetailPanel
            design={design}
            activeStep={activeStep}
            onMaterialChange={setMaterial}
            onThicknessChange={setThickness}
            onOpeningChange={setOpeningPattern}
            onCableChange={setCablePlan}
            onEntryAddonToggle={setEntryAddon}
            onPanelJointChange={setPanelJointPlan}
            onDoorChange={setDoorPlan}
            onBondingChange={setBondingPlan}
            onNext={nextStep}
            onPrev={previousStep}
            onReset={reset}
            onExport={handleExport}
            onImportRequest={() => fileInputRef.current?.click()}
          />
        </div>

        <div className="order-3 xl:col-start-2 xl:row-span-2">
          <ProductionPreview design={design} activeStep={activeStep} />
        </div>

        <div className="order-4 xl:col-start-3 xl:row-span-2">
          <Suspense
            fallback={
              <div className="rounded-[28px] border border-white/10 bg-[var(--card)]/90 p-6 text-sm text-slate-300 shadow-panel">
                결과 패널을 불러오는 중입니다.
              </div>
            }
          >
            <ResultPanel design={design} activeStep={activeStep} missionId={missionId} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
