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
import {
  formatKrw,
  getDesignCostSummary,
  pricingReference
} from "@/features/simulator/data/pricing";
import { exportDesignJson, parseDesignJson } from "@/features/simulator/lib/io";
import { scoreDesign } from "@/features/simulator/lib/scoring";
import { useSimulatorStore } from "@/features/simulator/lib/simulator-store";

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
    design,
    activeStep,
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

  const result = useMemo(() => scoreDesign(design), [design]);
  const costSummary = useMemo(() => getDesignCostSummary(design), [design]);

  const handleExport = () => {
    const blob = new Blob([exportDesignJson(design)], { type: "application/json" });
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
              차폐실 제작 과정을 단계별로 비교
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:leading-7">
              지금은 예산과 차폐 성능을 같이 봅니다. 각 선택지는 2026년 4월 기준
              금속 시세와 대표 EMI 부품 가격을 바탕으로 만든 교육용 추정 단가가 붙어 있습니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[340px] xl:items-end">
          <Button variant="outline" onClick={reset} className="w-full xl:w-auto">
            <RotateCcw className="h-4 w-4" />
            전체 초기화
          </Button>

          <Card className="border-[var(--primary)]/20 bg-[var(--primary)]/8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">현재 추정 비용</CardTitle>
              <CardDescription>
                {pricingReference.updatedAt} 기준 교육용 추정 단가
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold text-white">{formatKrw(costSummary.totalKrw)}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">{result.riskHeadline}</div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="order-1 lg:col-span-12">
          <StepNavigator activeStep={activeStep} onStepChange={goToStep} />
        </div>

        <div className="order-2 lg:col-span-5 xl:col-span-4">
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

        <div className="order-3 lg:col-span-7 xl:col-span-5">
          <ProductionPreview design={design} activeStep={activeStep} />
        </div>

        <div className="order-4 lg:col-span-12 xl:col-span-3">
          <Suspense
            fallback={
              <div className="rounded-[28px] border border-white/10 bg-[var(--card)]/90 p-6 text-sm text-slate-300 shadow-panel">
                결과 패널을 불러오는 중입니다.
              </div>
            }
          >
            <ResultPanel design={design} activeStep={activeStep} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
