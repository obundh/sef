import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpenText,
  ClipboardList,
  Shield,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface HomeScreenProps {
  onOpenOverview: () => void;
  onOpenSimulator: () => void;
}

const panels = [
  {
    id: "overview",
    title: "학습 개요",
    icon: BookOpenText,
    detail:
      "재질, 패널 조인트, 출입문, 개구부, 관통부, 본딩/접지까지 각 선택지가 왜 유리하거나 불리한지 모아 보는 설명 화면입니다."
  },
  {
    id: "simulator",
    title: "차폐실 시뮬레이터",
    icon: Shield,
    detail:
      "빈 제작 공간에서 시작해 외피, 조인트, 문, 개구부, 관통부, 본딩을 단계별로 고르며 차폐실을 완성합니다."
  },
  {
    id: "guide",
    title: "기준 메모",
    icon: ClipboardList,
    detail:
      "미션 조건, weakest-link 사고방식, 보호된 개구부와 관통부의 의미를 짧은 요약으로 다시 보는 보조 영역입니다."
  }
] as const;

export function HomeScreen({ onOpenOverview, onOpenSimulator }: HomeScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 lg:px-6">
      <header className="mb-6 rounded-[32px] border border-white/10 bg-[var(--card)]/90 px-6 py-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              React 19 + SVG room simulator
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-5xl">
              차폐실 설계를
              <br />
              단계별로 학습
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
              메인에서 버튼 3개로 시작하고, 1번 버튼은 선택지 설명 모음, 2번 버튼은 실제 제작형
              시뮬레이터로 연결됩니다. 학생이 금속 두께만이 아니라 조인트, 출입문, 개구부,
              관통부, 본딩이 왜 더 큰 병목이 되는지 비교하면서 배우는 구조입니다.
            </p>
          </div>

          <Button size="lg" className="rounded-2xl" onClick={onOpenSimulator}>
            시뮬레이터 열기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-3">
        {panels.map((panel, index) => {
          const Icon = panel.icon;
          const isOverview = index === 0;
          const isSimulator = index === 1;
          const isInteractive = isOverview || isSimulator;

          return (
            <motion.button
              key={panel.id}
              type="button"
              whileHover={isInteractive ? { y: -4 } : undefined}
              whileTap={isInteractive ? { scale: 0.98 } : undefined}
              onClick={
                isSimulator ? onOpenSimulator : isOverview ? onOpenOverview : undefined
              }
              className={`text-left ${isInteractive ? "" : "cursor-default"}`}
            >
              <Card
                className={`h-full ${
                  isSimulator
                    ? "border-[var(--primary)]/40 bg-[linear-gradient(180deg,rgba(88,211,194,0.16),rgba(12,23,42,0.96))]"
                    : isOverview
                      ? "border-white/15 bg-[linear-gradient(180deg,rgba(148,163,184,0.14),rgba(12,23,42,0.96))]"
                      : ""
                }`}
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                    <Icon
                      className={`h-6 w-6 ${
                        isInteractive ? "text-[var(--primary)]" : "text-slate-300"
                      }`}
                    />
                  </div>
                  <CardTitle>{panel.title}</CardTitle>
                  <CardDescription>{panel.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-white/8 bg-[#081121] p-4 text-sm leading-6 text-slate-300">
                    {isOverview
                      ? "1번 버튼에는 각 선택지의 핵심 설명, 장점, 주의점이 단계별로 정리되어 있습니다."
                      : isSimulator
                        ? "2번 버튼으로 바로 진입합니다. 외피부터 관통부와 본딩까지 선택이 제작 공간과 결과 분석에 즉시 반영됩니다."
                        : "3번 버튼은 현재 요약 메모 성격의 안내 패널입니다."}
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </main>
    </div>
  );
}
