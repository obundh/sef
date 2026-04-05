import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useState } from "react";
import { HomeScreen } from "@/features/home/HomeScreen";

const SimulatorWorkspace = lazy(async () => {
  const module = await import("@/features/simulator/components/SimulatorWorkspace");
  return { default: module.SimulatorWorkspace };
});

type AppScreen = "home" | "simulator";

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
          <HomeScreen onOpenSimulator={() => setScreen("simulator")} />
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
                <div className="rounded-3xl border border-white/10 bg-[var(--card)]/90 px-6 py-5 text-sm text-slate-300 shadow-panel">
                  시뮬레이터를 불러오는 중입니다.
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
