import React from "react";
import { ProblemData } from "../../types";

export default function LongDivisionRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { dividend, divisor } = data;
  return (
    <div className="flex flex-col items-start gap-1 font-mono text-lg">
      <div className="flex items-end">
        <div className="pr-2 pb-1">{divisor}</div>
        <div className="relative border-l-2 border-t-2 border-black px-4 py-1 min-w-[5rem]">
          {dividend}
          {showAnswer && (
            <div className="absolute -top-8 left-4 text-red-600 font-bold">
              {answer}
            </div>
          )}
        </div>
      </div>
      {/* Blank space for long division work */}
      <div className="h-24 w-full border-b border-dashed border-gray-300"></div>
    </div>
  );
}
