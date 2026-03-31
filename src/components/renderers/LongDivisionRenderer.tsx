import React from "react";
import { ProblemData } from "../../types";

export default function LongDivisionRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { dividend, divisor } = data;
  const formatNum = (n: number) => n.toString().replace("-", "−");

  return (
    <div className="flex flex-col items-start gap-1 font-mono">
      <div className="flex items-end">
        <div className="pr-1 pb-1">{formatNum(divisor)}</div>
        <div className="relative px-2 py-1 min-w-[5rem]">
          {/* Full Bracket SVG */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" 
            viewBox="0 0 100 40" 
            preserveAspectRatio="none"
          >
            <path 
              d="M 5 40 Q 18 20 5 0 L 100 0" 
              fill="none" 
              stroke="black" 
              strokeWidth="2" 
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="relative z-10 pl-4 flex flex-col items-end">
            {showAnswer && (
              <div className="absolute -top-8 right-0 text-red-600 font-bold z-20 whitespace-nowrap">
                {answer}
              </div>
            )}
            <div>{formatNum(dividend)}</div>
          </div>
        </div>
      </div>
      {/* Blank space for long division work */}
      <div className="h-12 w-full border-b border-dashed border-gray-300"></div>
    </div>
  );
}
