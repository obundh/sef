import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpenText,
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
  }
] as const;

export function HomeScreen({ onOpenOverview, onOpenSimulator }: HomeScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 lg:px-6">
      <header className="mb-6 cyber-clip border-l-[3px] border-[var(--primary)] bg-[var(--card)]/80 px-6 py-6 shadow-panel backdrop-blur relative before:absolute before:inset-0 before:border before:border-[var(--border)] before:pointer-events-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between relative z-10">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 cyber-clip border-l-[3px] border-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold tracking-widest uppercase text-[var(--primary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              React 19 + SVG room simulator
            </div>
            <h1 className="text-3xl font-orbitron font-bold tracking-wider text-[var(--foreground)] lg:text-5xl uppercase">
              차폐실 설계를
              <br />
              단계별로 학습
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-[var(--foreground)]/70 lg:text-base">
              메인에서 버튼 2개로 시작합니다. 1번 버튼은 선택지 설명 모음(학습 개요), 2번 버튼은 실제 제작형
              시뮬레이터로 연결됩니다. 학생이 금속 두께만이 아니라 조인트, 출입문, 개구부,
              관통부, 본딩이 왜 더 큰 병목이 되는지 비교하면서 배우는 구조입니다.
            </p>
          </div>

          <Button size="lg" onClick={onOpenSimulator}>
            시뮬레이터 열기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-2">
        {panels.map((panel, index) => {
          const Icon = panel.icon;
          const isOverview = index === 0;
          const isSimulator = index === 1;

          return (
            <motion.button
              key={panel.id}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={isSimulator ? onOpenSimulator : onOpenOverview}
              className="text-left w-full h-full"
            >
              <Card
                className={`h-full transition-all duration-300 ${
                  isSimulator
                    ? "border-[var(--primary)] bg-[var(--card)] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:border-[var(--primary)]"
                    : isOverview
                      ? "border-[var(--border)] bg-[var(--card)] hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:border-[var(--primary)]/50"
                      : ""
                }`}
              >
                <CardHeader>
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center border ${isSimulator ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[inset_0_0_10px_rgba(0,212,255,0.2)]' : 'border-[var(--border)] bg-[var(--muted)]/50'} cyber-clip`}>
                    <Icon
                      className={`h-6 w-6 text-[var(--primary)] ${isSimulator ? 'drop-shadow-[0_0_8px_var(--primary)]' : ''}`}
                    />
                  </div>
                  <CardTitle className="tracking-widest">{panel.title}</CardTitle>
                  <CardDescription className="text-[var(--foreground)]/70">{panel.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="cyber-clip border-l-[3px] border-[var(--primary)]/50 bg-[var(--muted)]/50 p-4 text-sm leading-6 text-[var(--foreground)]/80">
                    {isOverview
                      ? "1번 버튼에는 각 선택지의 핵심 설명, 장점, 주의점이 탭으로 정리되어 있습니다."
                      : "2번 버튼으로 바로 진입합니다. 외피부터 관통부와 본딩까지 선택이 제작 공간과 결과 분석에 즉시 반영됩니다."}
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
