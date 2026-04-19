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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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
                  "group flex min-h-[84px] items-center gap-3 cyber-clip border-l-2 px-3 py-3 text-left transition-all duration-200 xl:w-full",
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary)]/15 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border",
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)]/20 shadow-[inset_0_0_10px_rgba(0,240,255,0.4)]"
                      : "border-[var(--border)] bg-[var(--muted)]/50 group-hover:border-[var(--primary)]/50",
                    isComplete && !isActive ? "border-[var(--success)]/40 bg-[var(--success)]/10" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5",
                      isActive ? "text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--primary)]/70",
                      isComplete && !isActive ? "text-[var(--success)]" : ""
                    )}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.2em] font-orbitron text-[var(--muted-foreground)] group-hover:text-[var(--primary)]/70">
                    Step {index + 1}
                  </div>
                  <div className="whitespace-normal text-[13px] font-bold tracking-wider leading-5 text-[var(--foreground)] sm:text-sm group-hover:text-[var(--primary)]">
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
