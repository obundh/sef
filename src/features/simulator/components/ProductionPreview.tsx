import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  bondingOptions,
  cableOptions,
  doorOptions,
  entryAddonOptions,
  materials,
  openingOptions,
  panelJointOptions
} from "@/features/simulator/data/simulator-data";
import { getVisibleEntryAddonIds } from "@/features/simulator/lib/entry-config";
import type { SimulatorDesign, SimulatorStepId } from "@/features/simulator/lib/types";

interface ProductionPreviewProps {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
}

interface RoomGeometry {
  faceX: number;
  faceY: number;
  faceWidth: number;
  faceHeight: number;
  depthX: number;
  depthY: number;
}

const baseGeometry = {
  faceY: 148,
  faceWidth: 192,
  faceHeight: 118,
  depthX: 68,
  depthY: 38
} as const;

const frontGeometry: RoomGeometry = {
  faceX: 130,
  ...baseGeometry
};

const rearGeometry: RoomGeometry = {
  faceX: 198,
  ...baseGeometry
};

const stepFocusMap: Record<SimulatorStepId, string> = {
  material: "벽체 재질과 두께가 전체 구조의 기본 성격을 만듭니다.",
  openings: "정면도에서 환기구와 개구부가 차폐 연속성을 얼마나 깨는지 확인합니다.",
  entry: "후면도에서 관통판이 보호된 POE인지, 무처리 누설 경로인지 확인합니다.",
  panelJoint: "고정 패널 조인트는 연속 용접이 가능한 구간이라 문과 따로 평가합니다.",
  door: "출입문은 체결 밀도와 도전성 가스켓의 조합이 핵심입니다.",
  bonding: "후면도에서 단일 기준 접지점과 본딩 스트랩 구성을 비교합니다.",
  review: "정면과 후면 2.5D 제작 공간을 함께 보며 weakest-link 병목을 검토합니다."
};

function getLabel<T extends { id: string; label: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.label ?? id;
}

function getEntrySummary(design: SimulatorDesign) {
  const baseLabel = getLabel(cableOptions, design.cablePlan);
  const addonLabels = getVisibleEntryAddonIds(design).map((id) =>
    getLabel(entryAddonOptions, id)
  );

  if (addonLabels.length === 0) {
    return baseLabel;
  }

  return design.cablePlan === "none" ? addonLabels.join(" + ") : [baseLabel, ...addonLabels].join(" + ");
}

function GridBackdrop() {
  return (
    <g opacity="0.55">
      {Array.from({ length: 14 }).map((_, index) => (
        <line
          key={`v-${index}`}
          x1={24 + index * 36}
          y1="40"
          x2={24 + index * 36}
          y2="356"
          stroke="rgba(148,163,184,0.08)"
        />
      ))}
      {Array.from({ length: 9 }).map((_, index) => (
        <line
          key={`h-${index}`}
          x1="24"
          y1={48 + index * 34}
          x2="496"
          y2={48 + index * 34}
          stroke="rgba(148,163,184,0.08)"
        />
      ))}
    </g>
  );
}

function toPoints(points: Array<[number, number]>) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function getFrontTopPoints(geometry: RoomGeometry) {
  return toPoints([
    [geometry.faceX, geometry.faceY],
    [geometry.faceX + geometry.faceWidth, geometry.faceY],
    [geometry.faceX + geometry.faceWidth + geometry.depthX, geometry.faceY - geometry.depthY],
    [geometry.faceX + geometry.depthX, geometry.faceY - geometry.depthY]
  ]);
}

function getFrontSidePoints(geometry: RoomGeometry) {
  return toPoints([
    [geometry.faceX + geometry.faceWidth, geometry.faceY],
    [geometry.faceX + geometry.faceWidth, geometry.faceY + geometry.faceHeight],
    [
      geometry.faceX + geometry.faceWidth + geometry.depthX,
      geometry.faceY + geometry.faceHeight - geometry.depthY
    ],
    [geometry.faceX + geometry.faceWidth + geometry.depthX, geometry.faceY - geometry.depthY]
  ]);
}

function getRearTopPoints(geometry: RoomGeometry) {
  return toPoints([
    [geometry.faceX, geometry.faceY],
    [geometry.faceX + geometry.faceWidth, geometry.faceY],
    [geometry.faceX + geometry.faceWidth - geometry.depthX, geometry.faceY - geometry.depthY],
    [geometry.faceX - geometry.depthX, geometry.faceY - geometry.depthY]
  ]);
}

function getRearSidePoints(geometry: RoomGeometry) {
  return toPoints([
    [geometry.faceX, geometry.faceY],
    [geometry.faceX, geometry.faceY + geometry.faceHeight],
    [geometry.faceX - geometry.depthX, geometry.faceY + geometry.faceHeight - geometry.depthY],
    [geometry.faceX - geometry.depthX, geometry.faceY - geometry.depthY]
  ]);
}

function EmptyScene({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/8 bg-[#07101d]">
      <svg viewBox="0 0 520 390" className="h-full w-full" role="img" aria-label={title}>
        <rect x="1" y="1" width="518" height="388" rx="28" fill="#050c18" stroke="rgba(148,163,184,0.18)" />
        <GridBackdrop />
        <polygon
          points={getFrontTopPoints(frontGeometry)}
          fill="rgba(15,23,42,0.72)"
          stroke="rgba(148,163,184,0.32)"
          strokeDasharray="8 8"
        />
        <polygon
          points={getFrontSidePoints(frontGeometry)}
          fill="rgba(15,23,42,0.5)"
          stroke="rgba(148,163,184,0.26)"
          strokeDasharray="8 8"
        />
        <rect
          x={frontGeometry.faceX}
          y={frontGeometry.faceY}
          width={frontGeometry.faceWidth}
          height={frontGeometry.faceHeight}
          rx="14"
          fill="rgba(15,23,42,0.45)"
          stroke="rgba(148,163,184,0.26)"
          strokeDasharray="8 8"
        />
        <text x="260" y="176" fill="#e2e8f0" fontSize="20" textAnchor="middle">
          {title}
        </text>
        <text x="260" y="204" fill="#94a3b8" fontSize="12" textAnchor="middle">
          {hint}
        </text>
      </svg>
    </div>
  );
}

function renderHoneycombVent(x: number, y: number, width: number, height: number, highlighted: boolean) {
  const columns = width <= 28 ? 2 : width <= 40 ? 3 : 4;
  const rows = height <= 28 ? 3 : 4;
  const padX = 6;
  const padY = 6;
  const usableWidth = width - padX * 2;
  const usableHeight = height - padY * 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="6"
        fill="rgba(8,17,33,0.92)"
        stroke={highlighted ? "#67e8f9" : "#cbd5e1"}
        strokeWidth={highlighted ? "2.4" : "1.4"}
      />
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((__, column) => (
          <circle
            key={`${row}-${column}`}
            cx={x + padX + column * (usableWidth / Math.max(columns - 1, 1))}
            cy={y + padY + row * (usableHeight / Math.max(rows - 1, 1))}
            r="2.4"
            fill={highlighted ? "#67e8f9" : "#94a3b8"}
            opacity="0.9"
          />
        ))
      )}
    </g>
  );
}

function renderWbcVent(x: number, y: number, highlighted: boolean) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="54"
        height="34"
        rx="8"
        fill="rgba(8,17,33,0.94)"
        stroke={highlighted ? "#67e8f9" : "#cbd5e1"}
        strokeWidth={highlighted ? "2.6" : "1.5"}
      />
      {[10, 24, 38].map((offset) => (
        <path
          key={offset}
          d={`M ${x + offset} ${y + 10} L ${x + offset + 8} ${y + 17} L ${x + offset} ${y + 24}`}
          stroke="#58d3c2"
          strokeWidth="2"
          fill="none"
        />
      ))}
    </g>
  );
}

function renderFrontOpening(
  openingPattern: SimulatorDesign["openingPattern"],
  geometry: RoomGeometry,
  highlighted: boolean
) {
  const baseX = geometry.faceX + 128;
  const baseY = geometry.faceY + 16;

  switch (openingPattern) {
    case "two-round":
      return (
        <>
          <circle cx={baseX + 20} cy={baseY + 8} r="8.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
          <circle cx={baseX + 46} cy={baseY + 8} r="8.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
        </>
      );
    case "four-round":
      return (
        <>
          <circle cx={baseX + 16} cy={baseY} r="7.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
          <circle cx={baseX + 40} cy={baseY} r="7.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
          <circle cx={baseX + 16} cy={baseY + 22} r="7.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
          <circle cx={baseX + 40} cy={baseY + 22} r="7.5" fill="#081121" stroke={highlighted ? "#67e8f9" : "#cbd5e1"} />
        </>
      );
    case "slot-array":
      return (
        <>
          <rect x={baseX - 4} y={baseY - 8} width="54" height="6" rx="3" fill="#081121" stroke={highlighted ? "#fb7185" : "#cbd5e1"} />
          <rect x={baseX - 4} y={baseY + 6} width="54" height="6" rx="3" fill="#081121" stroke={highlighted ? "#fb7185" : "#cbd5e1"} />
          <rect x={baseX - 4} y={baseY + 20} width="54" height="6" rx="3" fill="#081121" stroke={highlighted ? "#fb7185" : "#cbd5e1"} />
        </>
      );
    case "honeycomb-one":
      return renderHoneycombVent(baseX - 6, baseY - 10, 54, 34, highlighted);
    case "honeycomb-two":
      return (
        <>
          {renderHoneycombVent(baseX - 6, baseY - 12, 24, 30, highlighted)}
          {renderHoneycombVent(baseX + 24, baseY - 12, 24, 30, highlighted)}
        </>
      );
    case "wbc-vent-one":
      return renderWbcVent(baseX - 8, baseY - 12, highlighted);
    default:
      return (
        <text x={baseX + 20} y={baseY + 6} fill="#64748b" fontSize="11" textAnchor="middle">
          sealed wall
        </text>
      );
  }
}

function renderPanelJointFasteners(plan: SimulatorDesign["panelJointPlan"], geometry: RoomGeometry) {
  if (plan === "continuous-welded") {
    return null;
  }

  const verticalCount = plan === "dense-bolted" ? 6 : 4;
  const horizontalCount = plan === "dense-bolted" ? 8 : 5;
  const leftX = geometry.faceX + 12;
  const rightX = geometry.faceX + geometry.faceWidth - 12;
  const topY = geometry.faceY + 10;
  const bottomY = geometry.faceY + geometry.faceHeight - 10;

  return (
    <>
      {Array.from({ length: verticalCount }).map((_, index) => (
        <circle
          key={`left-${index}`}
          cx={leftX}
          cy={topY + index * ((bottomY - topY) / Math.max(verticalCount - 1, 1))}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {Array.from({ length: verticalCount }).map((_, index) => (
        <circle
          key={`right-${index}`}
          cx={rightX}
          cy={topY + index * ((bottomY - topY) / Math.max(verticalCount - 1, 1))}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {Array.from({ length: horizontalCount }).map((_, index) => (
        <circle
          key={`top-${index}`}
          cx={leftX + index * ((rightX - leftX) / Math.max(horizontalCount - 1, 1))}
          cy={topY}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {Array.from({ length: horizontalCount }).map((_, index) => (
        <circle
          key={`bottom-${index}`}
          cx={leftX + index * ((rightX - leftX) / Math.max(horizontalCount - 1, 1))}
          cy={bottomY}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
    </>
  );
}

function renderDoorHardware(
  doorPlan: SimulatorDesign["doorPlan"],
  doorRect: { x: number; y: number; width: number; height: number },
  highlighted: boolean
) {
  const topFastenerCount =
    doorPlan === "dense-bolted-conductive-gasket"
      ? 6
      : doorPlan === "dense-bolted-no-gasket"
        ? 5
        : 3;
  const sideFastenerCount = doorPlan === "basic-bolted-no-gasket" ? 3 : 5;
  const innerLeft = doorRect.x + 4;
  const innerRight = doorRect.x + doorRect.width - 4;
  const innerTop = doorRect.y + 4;
  const innerBottom = doorRect.y + doorRect.height - 4;

  return (
    <>
      {Array.from({ length: topFastenerCount }).map((_, index) => (
        <circle
          key={`door-top-${index}`}
          cx={innerLeft + index * ((innerRight - innerLeft) / Math.max(topFastenerCount - 1, 1))}
          cy={innerTop}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {Array.from({ length: sideFastenerCount }).map((_, index) => (
        <circle
          key={`door-left-${index}`}
          cx={innerLeft}
          cy={innerTop + 10 + index * ((innerBottom - innerTop - 20) / Math.max(sideFastenerCount - 1, 1))}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {Array.from({ length: sideFastenerCount }).map((_, index) => (
        <circle
          key={`door-right-${index}`}
          cx={innerRight}
          cy={innerTop + 10 + index * ((innerBottom - innerTop - 20) / Math.max(sideFastenerCount - 1, 1))}
          r="2.4"
          fill="#d6dee9"
        />
      ))}
      {doorPlan === "dense-bolted-conductive-gasket" && (
        <rect
          x={doorRect.x + 3}
          y={doorRect.y + 3}
          width={doorRect.width - 6}
          height={doorRect.height - 6}
          rx="8"
          fill="none"
          stroke={highlighted ? "#86efac" : "#4ade80"}
          strokeWidth={highlighted ? "2.8" : "2.2"}
        />
      )}
    </>
  );
}

function FrontRoomView({
  design,
  activeStep
}: {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
}) {
  const material = design.materialId ? materials[design.materialId] : null;

  if (!material) {
    return (
      <EmptyScene
        title="정면 제작 공간"
        hint="벽체를 선택하면 정면 2.5D 차폐실 구조가 생성됩니다."
      />
    );
  }

  const geometry = frontGeometry;
  const highlightWall = activeStep === "material";
  const highlightOpenings = activeStep === "openings";
  const highlightPanelJoint = activeStep === "panelJoint";
  const highlightDoor = activeStep === "door";
  const panelJointStroke =
    design.panelJointPlan === "continuous-welded"
      ? "#58d3c2"
      : highlightPanelJoint
        ? "#fbbf24"
        : "rgba(226,232,240,0.18)";
  const doorRect = {
    x: geometry.faceX + 22,
    y: geometry.faceY + 18,
    width: 44,
    height: 82
  };

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/8 bg-[#07101d]">
      <svg viewBox="0 0 520 390" className="h-full w-full" role="img" aria-label="차폐실 정면 2.5D 미리보기">
        <defs>
          <linearGradient id="front-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.28" />
            <stop offset="100%" stopColor="#081121" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="front-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.16" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id="front-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10213d" stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="518" height="388" rx="28" fill="#050c18" stroke="rgba(148,163,184,0.18)" />
        <GridBackdrop />
        <ellipse cx="260" cy="314" rx="154" ry="22" fill="rgba(2,8,23,0.82)" />

        <polygon
          points={getFrontTopPoints(geometry)}
          fill="url(#front-top)"
          stroke="rgba(226,232,240,0.18)"
        />
        <polygon
          points={getFrontSidePoints(geometry)}
          fill="url(#front-side)"
          stroke="rgba(226,232,240,0.14)"
        />
        <rect
          x={geometry.faceX}
          y={geometry.faceY}
          width={geometry.faceWidth}
          height={geometry.faceHeight}
          rx="14"
          fill="url(#front-face)"
          stroke={highlightWall ? material.stroke : "rgba(226,232,240,0.16)"}
          strokeWidth={highlightWall ? "2.8" : "2"}
        />

        <line
          x1={geometry.faceX + geometry.faceWidth / 3}
          y1={geometry.faceY}
          x2={geometry.faceX + geometry.faceWidth / 3}
          y2={geometry.faceY + geometry.faceHeight}
          stroke={panelJointStroke}
          strokeWidth="2"
          strokeDasharray={design.panelJointPlan === "continuous-welded" ? undefined : "8 8"}
        />
        <line
          x1={geometry.faceX + (geometry.faceWidth / 3) * 2}
          y1={geometry.faceY}
          x2={geometry.faceX + (geometry.faceWidth / 3) * 2}
          y2={geometry.faceY + geometry.faceHeight}
          stroke={panelJointStroke}
          strokeWidth="2"
          strokeDasharray={design.panelJointPlan === "continuous-welded" ? undefined : "8 8"}
        />
        <line
          x1={geometry.faceX}
          y1={geometry.faceY + geometry.faceHeight / 2}
          x2={geometry.faceX + geometry.faceWidth}
          y2={geometry.faceY + geometry.faceHeight / 2}
          stroke={panelJointStroke}
          strokeWidth="2"
          strokeDasharray={design.panelJointPlan === "continuous-welded" ? undefined : "8 8"}
        />
        <rect
          x={geometry.faceX}
          y={geometry.faceY}
          width={geometry.faceWidth}
          height={geometry.faceHeight}
          rx="14"
          fill="none"
          stroke={panelJointStroke}
          strokeWidth={design.panelJointPlan === "continuous-welded" ? "2.8" : "1.6"}
          strokeDasharray={design.panelJointPlan === "continuous-welded" ? undefined : "6 8"}
        />
        {renderPanelJointFasteners(design.panelJointPlan, geometry)}

        <rect
          x={doorRect.x}
          y={doorRect.y}
          width={doorRect.width}
          height={doorRect.height}
          rx="8"
          fill="rgba(8,17,33,0.92)"
          stroke={highlightDoor ? "#fbbf24" : "#dbeafe"}
          strokeWidth={highlightDoor ? "2.4" : "1.5"}
        />
        <circle cx={doorRect.x + doorRect.width - 7} cy={doorRect.y + doorRect.height / 2} r="3.1" fill="#dbeafe" />
        {renderDoorHardware(design.doorPlan, doorRect, highlightDoor)}

        {renderFrontOpening(design.openingPattern, geometry, highlightOpenings)}

        <text x="26" y="30" fill="#5eead4" fontSize="11" letterSpacing="1.6">
          FRONT PERSPECTIVE
        </text>
      </svg>
    </div>
  );
}

function renderCablePanel(
  cablePlan: SimulatorDesign["cablePlan"],
  panelRect: { x: number; y: number; width: number; height: number },
  highlighted: boolean
) {
  const centerY = panelRect.y + panelRect.height / 2;
  const leftX = panelRect.x + 16;

  switch (cablePlan) {
    case "single-filtered":
      return (
        <>
          <circle cx={leftX} cy={centerY} r="8.5" fill="#081121" stroke="#cbd5e1" />
          <path d={`M ${leftX + 8} ${centerY} L ${panelRect.x + 60} ${centerY}`} stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" />
          <rect x={panelRect.x + 60} y={centerY - 9} width="18" height="18" rx="4" fill="#12361f" stroke="#4ade80" />
        </>
      );
    case "single-raw":
      return (
        <>
          <circle cx={leftX} cy={centerY} r="9" fill="#081121" stroke="#f97316" strokeWidth={highlighted ? "2.2" : "1.5"} />
          <path d={`M ${leftX + 8} ${centerY} L ${panelRect.x + 78} ${centerY}`} stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
        </>
      );
    case "multi-raw":
      return (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <circle
              key={`multi-raw-${index}`}
              cx={panelRect.x + 14 + index * 18}
              cy={centerY}
              r="8"
              fill="#081121"
              stroke="#fb7185"
              strokeWidth={highlighted ? "2.2" : "1.4"}
            />
          ))}
          <path d={`M ${panelRect.x + 54} ${centerY} L ${panelRect.x + 80} ${centerY}`} stroke="#fb7185" strokeWidth="4.5" strokeLinecap="round" />
        </>
      );
    case "integrated-filter-panel-one":
      return (
        <>
          <rect
            x={panelRect.x + 8}
            y={centerY - 17}
            width="58"
            height="34"
            rx="8"
            fill="rgba(8,17,33,0.94)"
            stroke={highlighted ? "#4ade80" : "#cbd5e1"}
            strokeWidth={highlighted ? "2.4" : "1.4"}
          />
          <rect x={panelRect.x + 14} y={centerY - 9} width="15" height="18" rx="4" fill="#12361f" stroke="#4ade80" />
          <rect x={panelRect.x + 36} y={centerY - 9} width="22" height="18" rx="4" fill="#12361f" stroke="#4ade80" />
          <path d={`M ${panelRect.x + 66} ${centerY} L ${panelRect.x + 84} ${centerY}`} stroke="#4ade80" strokeWidth="4.5" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <text x={panelRect.x + panelRect.width / 2} y={centerY + 4} fill="#64748b" fontSize="11" textAnchor="middle">
          no POE
        </text>
      );
  }
}

function renderEntryAddons(
  design: SimulatorDesign,
  panelRect: { x: number; y: number; width: number; height: number },
  highlighted: boolean
) {
  const addonIds = getVisibleEntryAddonIds(design);

  if (addonIds.length === 0) {
    return null;
  }

  const addonMap = {
    "filtered-power": { label: "P", stroke: "#4ade80" },
    "filtered-signal": { label: "S", stroke: "#fbbf24" },
    "fiber-signal": { label: "F", stroke: "#67e8f9" },
    "wbc-nonconductive": { label: "W", stroke: "#58d3c2" }
  } as const;

  return (
    <g>
      {addonIds.map((addonId, index) => {
        const item = addonMap[addonId];
        const x = panelRect.x + index * 28;
        const y = panelRect.y + panelRect.height + 10;

        return (
          <g key={addonId}>
            <rect
              x={x}
              y={y}
              width="24"
              height="16"
              rx="8"
              fill="rgba(8,17,33,0.94)"
              stroke={item.stroke}
              strokeWidth={highlighted ? "2.2" : "1.5"}
            />
            <text
              x={x + 12}
              y={y + 11}
              fill="#e2e8f0"
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function renderBonding(
  bondingPlan: SimulatorDesign["bondingPlan"],
  geometry: RoomGeometry,
  highlighted: boolean
) {
  const busX = geometry.faceX + 104;
  const busY = geometry.faceY + geometry.faceHeight - 22;
  const stroke = bondingPlan === "single-point-braided" ? "#c08457" : "#4ade80";
  const strokeWidth = bondingPlan === "single-point-braided" ? 7 : 4.5;
  const singlePoint = bondingPlan.startsWith("single-point");

  if (bondingPlan === "none") {
    return (
      <path
        d={`M ${geometry.faceX + 42} ${geometry.faceY + geometry.faceHeight - 36} L ${busX + 24} ${busY + 5}`}
        stroke="rgba(148,163,184,0.32)"
        strokeWidth="3.2"
        strokeDasharray="7 7"
        strokeLinecap="round"
      />
    );
  }

  const lugs =
    bondingPlan === "basic" || bondingPlan === "single-point-basic"
      ? [geometry.faceX + 48]
      : bondingPlan === "multipoint" || bondingPlan === "single-point-multipoint"
        ? [geometry.faceX + 40, geometry.faceX + 62, geometry.faceX + 84]
        : [geometry.faceX + 48, geometry.faceX + 74];

  return (
    <>
      <rect x={busX} y={busY} width="40" height="10" rx="5" fill="rgba(8,17,33,0.92)" stroke="#cbd5e1" />
      {lugs.map((lugX, index) => (
        <path
          key={`bond-path-${index}`}
          d={`M ${lugX} ${geometry.faceY + geometry.faceHeight - 42} L ${singlePoint ? busX + 20 : busX + 6 + index * 12} ${busY + 5}`}
          stroke={stroke}
          strokeWidth={highlighted ? strokeWidth + 1 : strokeWidth}
          strokeLinecap="round"
        />
      ))}
      {singlePoint && (
        <circle
          cx={busX + 20}
          cy={busY + 5}
          r="6"
          fill="rgba(8,17,33,0.96)"
          stroke={highlighted ? "#fbbf24" : "#e2e8f0"}
          strokeWidth={highlighted ? "2.4" : "1.5"}
        />
      )}
      {lugs.map((lugX, index) => (
        <circle
          key={`bond-lug-${index}`}
          cx={lugX}
          cy={geometry.faceY + geometry.faceHeight - 42}
          r="4.5"
          fill="#081121"
          stroke="#cbd5e1"
        />
      ))}
    </>
  );
}

function RearRoomView({
  design,
  activeStep
}: {
  design: SimulatorDesign;
  activeStep: SimulatorStepId;
}) {
  const material = design.materialId ? materials[design.materialId] : null;

  if (!material) {
    return (
      <EmptyScene
        title="후면 제작 공간"
        hint="관통판과 본딩은 후면 2.5D 시점에서 확인합니다."
      />
    );
  }

  const geometry = rearGeometry;
  const highlightWall = activeStep === "material";
  const highlightEntry = activeStep === "entry";
  const highlightBonding = activeStep === "bonding";
  const panelRect = {
    x: geometry.faceX + 22,
    y: geometry.faceY + 18,
    width: 84,
    height: 50
  };

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/8 bg-[#07101d]">
      <svg viewBox="0 0 520 390" className="h-full w-full" role="img" aria-label="차폐실 후면 2.5D 미리보기">
        <defs>
          <linearGradient id="rear-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.24" />
            <stop offset="100%" stopColor="#081121" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="rear-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.12" />
            <stop offset="100%" stopColor="#020817" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id="rear-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={material.boxFill} stopOpacity="0.14" />
            <stop offset="100%" stopColor="#10213d" stopOpacity="0.74" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="518" height="388" rx="28" fill="#050c18" stroke="rgba(148,163,184,0.18)" />
        <GridBackdrop />
        <ellipse cx="260" cy="314" rx="154" ry="22" fill="rgba(2,8,23,0.82)" />

        <polygon
          points={getRearTopPoints(geometry)}
          fill="url(#rear-top)"
          stroke="rgba(226,232,240,0.18)"
        />
        <polygon
          points={getRearSidePoints(geometry)}
          fill="url(#rear-side)"
          stroke="rgba(226,232,240,0.14)"
        />
        <rect
          x={geometry.faceX}
          y={geometry.faceY}
          width={geometry.faceWidth}
          height={geometry.faceHeight}
          rx="14"
          fill="url(#rear-face)"
          stroke={highlightWall ? material.stroke : "rgba(226,232,240,0.16)"}
          strokeWidth={highlightWall ? "2.8" : "2"}
        />

        <rect
          x={panelRect.x}
          y={panelRect.y}
          width={panelRect.width}
          height={panelRect.height}
          rx="10"
          fill="rgba(8,17,33,0.88)"
          stroke={highlightEntry ? "#fbbf24" : "#cbd5e1"}
          strokeWidth={highlightEntry ? "2.4" : "1.4"}
        />
        {renderCablePanel(design.cablePlan, panelRect, highlightEntry)}
        {renderEntryAddons(design, panelRect, highlightEntry)}

        <text x={geometry.faceX + 18} y={geometry.faceY + geometry.faceHeight - 18} fill="#94a3b8" fontSize="11">
          bonding / ground bar
        </text>
        {renderBonding(design.bondingPlan, geometry, highlightBonding)}
        <text x="26" y="30" fill="#5eead4" fontSize="11" letterSpacing="1.6">
          REAR PERSPECTIVE
        </text>
      </svg>
    </div>
  );
}

function PreviewPane({
  title,
  subtitle,
  badges,
  children
}: {
  title: string;
  subtitle: string;
  badges: string[];
  children: ReactNode;
}) {
  return (
    <motion.div
      layout
      className="rounded-[24px] border border-white/8 bg-[#07101d] p-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--primary)]">
            {subtitle}
          </div>
          <div className="mt-1 text-sm font-medium text-white">{title}</div>
        </div>
      </div>

      {children}

      <div className="mt-3 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Badge key={badge} className="border-white/10 bg-white/6 text-[11px] text-slate-200">
            {badge}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

export function ProductionPreview({ design, activeStep }: ProductionPreviewProps) {
  const materialLabel = design.materialId ? materials[design.materialId].label : "미선택";
  const openingLabel = getLabel(openingOptions, design.openingPattern);
  const panelJointLabel = getLabel(panelJointOptions, design.panelJointPlan);
  const doorLabel = getLabel(doorOptions, design.doorPlan);
  const cableLabel = getEntrySummary(design);
  const bondingLabel = getLabel(bondingOptions, design.bondingPlan);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-3">제작 공간 미리보기</Badge>
            <CardTitle>차폐실 정면 / 후면 2.5D</CardTitle>
            <CardDescription>{stepFocusMap[activeStep]}</CardDescription>
          </div>
          <Badge>mobile first preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-[28px] border border-white/10 bg-[#07101d] p-3 sm:p-4">
          <div className="mb-3 text-sm leading-6 text-slate-300">
            정면은 출입문, 전면 개구부, 전면 조인트만 보여주고 후면은 관통판과 본딩 기준점만
            보여주도록 분리했습니다. 같은 차폐실을 바라보되 앞면 요소와 뒷면 요소가 섞이지 않게
            좌표를 다시 정리했습니다.
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <PreviewPane
              title="정면 시점"
              subtitle="Front perspective"
              badges={[
                `벽체 ${materialLabel}`,
                `개구부 ${openingLabel}`,
                `패널 조인트 ${panelJointLabel}`,
                `출입문 ${doorLabel}`
              ]}
            >
              <FrontRoomView design={design} activeStep={activeStep} />
            </PreviewPane>

            <PreviewPane
              title="후면 시점"
              subtitle="Rear perspective"
              badges={[`관통판 ${cableLabel}`, `본딩 ${bondingLabel}`, `벽체 ${materialLabel}`]}
            >
              <RearRoomView design={design} activeStep={activeStep} />
            </PreviewPane>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
