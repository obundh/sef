import {
  Cable,
  CircleGauge,
  Drill,
  Grip,
  Package2,
  Shield,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { simulatorSteps } from "@/features/simulator/data/simulator-data";
import type { SimulatorStepId } from "@/features/simulator/lib/types";
import { cn } from "@/lib/utils";

interface StepNavigatorProps {
  activeStep: SimulatorStepId;
  onStepChange: (step: SimulatorStepId) => void;
}

const iconMap = {
  material: Package2,
  openings: Drill,
  entry: Cable,
  panelJoint: Grip,
  door: Shield,
  bonding: Zap,
  review: CircleGauge
} as const;

export function StepNavigator({ activeStep, onStepChange }: StepNavigatorProps) {
  const activeIndex = simulatorSteps.findIndex((step) => step.id === activeStep);

  return (
    <Card>
      <CardHeader className="pb-4">
        <Badge className="w-fit">Step Flow</Badge>
        <CardTitle>단계 진행</CardTitle>
        <CardDescription>
          모바일에서는 가로 스크롤로 빠르게 이동하고, 각 단계명은 실제 선택 패널 제목과 같은 이름으로
          맞춰 두었습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
          {simulatorSteps.map((step, index) => {
            const Icon = iconMap[step.id];
            const isActive = step.id === activeStep;
            const isComplete = index < activeIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "flex min-h-[84px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition xl:w-full",
                  isActive
                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/10"
                    : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    isActive
                      ? "border-[var(--primary)]/40 bg-[#0a1823]"
                      : "border-white/10 bg-[#081121]",
                    isComplete && !isActive ? "border-emerald-400/30 bg-emerald-500/8" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5",
                      isActive ? "text-[var(--primary)]" : "text-slate-300",
                      isComplete && !isActive ? "text-emerald-300" : ""
                    )}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Step {index + 1}
                  </div>
                  <div className="whitespace-normal text-[13px] font-medium leading-5 text-white sm:text-sm">
                    {step.shortLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
