import React from "react";
import { ProblemData } from "../../types";

export default function TimeRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { h, m, mode, scenarioText, numberStyle, showTicks } = data;

  const renderClockFace = () => {
    const numbers = [];
    if (numberStyle === "all") {
      for (let i = 1; i <= 12; i++) {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = 50 + 36 * Math.cos(angle);
        const y = 50 + 36 * Math.sin(angle);
        numbers.push(
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[10px] font-bold fill-black"
          >
            {i}
          </text>
        );
      }
    } else if (numberStyle === "major") {
      [12, 3, 6, 9].forEach((i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = 50 + 36 * Math.cos(angle);
        const y = 50 + 36 * Math.sin(angle);
        numbers.push(
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[12px] font-bold fill-black"
          >
            {i}
          </text>
        );
      });
    }

    const ticks = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const isHour = i % 5 === 0;
      if (!isHour && !showTicks) continue;

      const length = isHour ? 6 : 3;
      const x1 = 50 + 48 * Math.cos(angle);
      const y1 = 50 + 48 * Math.sin(angle);
      const x2 = 50 + (48 - length) * Math.cos(angle);
      const y2 = 50 + (48 - length) * Math.sin(angle);
      ticks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth={isHour ? 1.5 : 0.5}
        />
      );
    }

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-[1.5in] h-[1.5in] print:w-[1.5in] print:h-[1.5in]"
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeWidth="2" />
        {ticks}
        {numbers}
        <circle cx="50" cy="50" r="2.5" fill="black" />
        {mode === "identify" && renderHands(h, m)}
        {showAnswer && mode === "draw" && renderHands(h, m, true)}
      </svg>
    );
  };

  const renderHands = (h: number, m: number, isAnswer = false) => {
    const mAngle = (m * 6 - 90) * (Math.PI / 180);
    const hAngle = ((h % 12) * 30 + m * 0.5 - 90) * (Math.PI / 180);

    // Tip positions (the very point of the arrow)
    const mX = 50 + 30 * Math.cos(mAngle);
    const mY = 50 + 30 * Math.sin(mAngle);
    const hX = 50 + 20 * Math.cos(hAngle);
    const hY = 50 + 20 * Math.sin(hAngle);

    // Line end positions (stop slightly before the tip to keep it pointy)
    const mLineX = 50 + 24 * Math.cos(mAngle);
    const mLineY = 50 + 24 * Math.sin(mAngle);
    const hLineX = 50 + 14 * Math.cos(hAngle);
    const hLineY = 50 + 14 * Math.sin(hAngle);

    const color = isAnswer ? "#dc2626" : "black"; // red-600 for answers

    return (
      <g strokeLinejoin="miter">
        {/* Minute Hand */}
        <line
          x1="50"
          y1="50"
          x2={mLineX}
          y2={mLineY}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="butt"
        />
        <path
          d={`M ${mX} ${mY} L ${50 + 24 * Math.cos(mAngle - 0.12)} ${50 + 24 * Math.sin(mAngle - 0.12)} L ${50 + 24 * Math.cos(mAngle + 0.12)} ${50 + 24 * Math.sin(mAngle + 0.12)} Z`}
          fill={color}
        />
        {/* Hour Hand */}
        <line
          x1="50"
          y1="50"
          x2={hLineX}
          y2={hLineY}
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="butt"
        />
        <path
          d={`M ${hX} ${hY} L ${50 + 14 * Math.cos(hAngle - 0.25)} ${50 + 14 * Math.sin(hAngle - 0.25)} L ${50 + 14 * Math.cos(hAngle + 0.25)} ${50 + 14 * Math.sin(hAngle + 0.25)} Z`}
          fill={color}
        />
      </g>
    );
  };

  const formatTimeText = (h: number, m: number) => {
    // Simple h:mm for now, but could be expanded to "Quarter to..."
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {renderClockFace()}
      <div className="text-center min-h-[1.5rem]">
        {mode === "identify" ? (
          <div className="flex flex-col items-center gap-1">
            <div className="w-24 border-b-2 border-black h-6 flex items-center justify-center">
              {showAnswer && <span className="text-red-600 font-bold">{answer}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-lg">
              {scenarioText ? scenarioText : "Draw the hands for:"}
            </p>
            <p className="text-2xl font-black">{formatTimeText(h, m)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
