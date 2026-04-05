import {
  exportPayloadSchema,
  missionlessExportPayloadSchema,
  previousExportPayloadSchema,
  olderExportPayloadSchema,
  legacyExportPayloadSchema,
  migratePreviousDesign,
  migrateLegacyDesign,
  getDefaultMissionId
} from "@/features/simulator/lib/schema";
import type { MissionId, SimulatorDesign } from "@/features/simulator/lib/types";

export function exportDesignJson(design: SimulatorDesign, missionId: MissionId) {
  return JSON.stringify(
    {
      version: 6,
      exportedAt: new Date().toISOString(),
      missionId,
      design
    },
    null,
    2
  );
}

export function parseDesignJson(json: string): { design: SimulatorDesign; missionId: MissionId } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON 형식을 읽지 못했습니다.");
  }

  const current = exportPayloadSchema.safeParse(parsed);

  if (current.success) {
    return {
      design: current.data.design,
      missionId: current.data.missionId
    };
  }

  const previous = previousExportPayloadSchema.safeParse(parsed);

  if (previous.success) {
    return {
      design: migratePreviousDesign(previous.data.design),
      missionId: previous.data.missionId
    };
  }

  const older = olderExportPayloadSchema.safeParse(parsed);

  if (older.success) {
    return {
      design: migratePreviousDesign(older.data.design),
      missionId: older.data.missionId
    };
  }

  const missionless = missionlessExportPayloadSchema.safeParse(parsed);

  if (missionless.success) {
    return {
      design: migratePreviousDesign(missionless.data.design),
      missionId: getDefaultMissionId()
    };
  }

  const legacy = legacyExportPayloadSchema.safeParse(parsed);

  if (legacy.success) {
    return {
      design: migrateLegacyDesign(legacy.data.design),
      missionId: getDefaultMissionId()
    };
  }

  throw new Error("설계 JSON 형식이 올바르지 않습니다.");
}
