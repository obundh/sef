import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useState } from "react";
import { HomeScreen } from "@/features/home/HomeScreen";
import { LearningOverviewScreen } from "@/features/home/LearningOverviewScreen";

const SimulatorWorkspace = lazy(async () => {
  const module = await import("@/features/simulator/components/SimulatorWorkspace");
  return { default: module.SimulatorWorkspace };
});

type AppScreen = "home" | "overview" | "simulator";

export function App() {
  const [screen, setScreen] = useState<AppScreen>("home");

  return (
    <AnimatePresence mode="wait">
      {screen === "home" ? (
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <HomeScreen
            onOpenOverview={() => setScreen("overview")}
            onOpenSimulator={() => setScreen("simulator")}
          />
        </motion.div>
      ) : screen === "overview" ? (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <LearningOverviewScreen
            onBackHome={() => setScreen("home")}
            onOpenSimulator={() => setScreen("simulator")}
          />
        </motion.div>
      ) : (
        <motion.div
          key="simulator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense
            fallback={
              <div className="mx-auto flex min-h-screen w-full max-w-[1640px] items-center justify-center px-4 py-6 lg:px-6">
                <div className="cyber-clip border-l-[3px] border-[var(--primary)] bg-[var(--card)]/90 px-6 py-5 text-sm font-bold uppercase tracking-widest text-[var(--primary)] shadow-panel neon-glow">
                  시뮬레이터를 불러오는 중입니다...
                </div>
              </div>
            }
          >
            <SimulatorWorkspace onBackHome={() => setScreen("home")} />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
