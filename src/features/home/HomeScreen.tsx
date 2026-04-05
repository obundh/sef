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
  onOpenSimulator: () => void;
}

const panels = [
  {
    id: "overview",
    title: "학습 개요",
    icon: BookOpenText,
    detail:
      "학생이 벽체 두께만 키우는 접근에서 벗어나, 출입문 조인트와 관통판, 본딩이 왜 더 큰 병목이 되는지 단계별로 배우는 교육용 시뮬레이터입니다."
  },
  {
    id: "simulator",
    title: "차폐실 시뮬레이터",
    icon: Shield,
    detail:
      "빈 제작 공간에서 시작해 재질, 환기 개구부, 관통판, 출입문 조인트를 고를 때마다 차폐실 정면도와 후면도가 함께 완성됩니다."
  },
  {
    id: "guide",
    title: "기준 메모",
    icon: ClipboardList,
    detail:
      "각 단계마다 어떤 선택이 유리하고 불리한지 plain language로 풀어 설명해, 학생이 설계 의도를 이해하도록 구성했습니다."
  }
] as const;

export function HomeScreen({ onOpenSimulator }: HomeScreenProps) {
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
              메인에서 버튼 3개로 시작하고, 2번째 버튼은 실제 차폐실 제작 시뮬레이터로
              이어집니다. 재질을 고르면 빈 제작 공간에 차폐실 외형이 생기고, 다음 단계에서 환기
              개구부, 케이블 관통판, 출입문 조인트, 본딩 계획이 그대로 반영됩니다.
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
          const isSimulator = index === 1;

          return (
            <motion.button
              key={panel.id}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={isSimulator ? onOpenSimulator : undefined}
              className="text-left"
            >
              <Card
                className={`h-full ${
                  isSimulator
                    ? "border-[var(--primary)]/40 bg-[linear-gradient(180deg,rgba(88,211,194,0.16),rgba(12,23,42,0.96))]"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                    <Icon
                      className={`h-6 w-6 ${
                        isSimulator ? "text-[var(--primary)]" : "text-slate-300"
                      }`}
                    />
                  </div>
                  <CardTitle>{panel.title}</CardTitle>
                  <CardDescription>{panel.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-white/8 bg-[#081121] p-4 text-sm leading-6 text-slate-300">
                    {isSimulator
                      ? "2번 버튼으로 바로 진입합니다. 현재 구현 범위는 단계별 선택, 정면도/후면도 제작 공간 미리보기, 최종 학습 점수 결과입니다."
                      : "이 버튼은 현재 설명용 패널입니다. 실제 상호작용은 2번 시뮬레이터에 연결되어 있습니다."}
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
