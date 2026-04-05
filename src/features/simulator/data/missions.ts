import type { MissionDefinition, MissionId } from "@/features/simulator/lib/types";

export const defaultMissionId: MissionId = "occupied-room";

export const missions: Record<MissionId, MissionDefinition> = {
  "occupied-room": {
    id: "occupied-room",
    title: "사람이 들어가는 차폐실",
    summary: "문 필수, 보호된 환기 필수",
    objective:
      "사람이 출입하고 머무를 수 있는 공간을 만들되, 출입문과 환기 때문에 생기는 불연속부를 관리해야 합니다.",
    requirements: ["출입문 차폐 건전성 확보", "환기를 보호된 방식으로 확보"],
    scoreThreshold: 72,
    successMessage:
      "사람이 사용하는 공간의 운용 조건과 차폐 건전성을 함께 만족한 설계입니다.",
    failureMessage:
      "출입문 처리나 환기 방식이 아직 사람 출입형 차폐실 요구를 충분히 만족하지 못합니다."
  },
  "storage-room": {
    id: "storage-room",
    title: "완전 차폐실",
    summary: "관통 없음 가능, 환기 없음 가능",
    objective:
      "사람이나 장비 서비스가 거의 필요 없는 저장형 공간으로 보고, 개구부와 관통부를 최소화하는 방향으로 설계합니다.",
    requirements: ["관통부를 만들지 않음", "환기 개구부를 만들지 않음"],
    scoreThreshold: 78,
    successMessage:
      "불필요한 서비스 경로를 만들지 않아 완전 차폐실 목적에 잘 맞는 설계입니다.",
    failureMessage:
      "완전 차폐실인데도 불필요한 개구부나 관통부가 남아 있어 차폐 경계가 약해졌습니다."
  },
  "server-room": {
    id: "server-room",
    title: "서버 보호 차폐실",
    summary: "전원 1개 필수, 통신 1개 필수, 환기 필요",
    objective:
      "필수 서비스는 들이되, 보호된 개구부와 보호된 POE로 누설 경로를 최소화해야 합니다.",
    requirements: [
      "전원 1개를 보호된 방식으로 인입",
      "통신 1개를 보호된 방식으로 인입",
      "환기를 보호된 방식으로 확보"
    ],
    scoreThreshold: 76,
    successMessage:
      "필수 서비스와 차폐 연속성을 함께 만족한 서버 보호 차폐실 설계입니다.",
    failureMessage:
      "전원, 통신, 환기 중 하나 이상이 아직 보호된 방식으로 충족되지 않았습니다."
  }
};

export const missionOptions = [
  missions["occupied-room"],
  missions["storage-room"],
  missions["server-room"]
];
