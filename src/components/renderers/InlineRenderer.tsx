import React from "react";
import { ProblemData } from "../../types";

export default function InlineRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { a, b, operation } = data;
  return (
    <div className="flex items-center gap-2 font-mono text-xl whitespace-nowrap">
      <span>{a}</span>
      <span>{operation}</span>
      <span>{b}</span>
      <span>=</span>
      <div className="min-w-[4rem] border-b border-black h-8 flex items-end justify-center">
        {showAnswer && <span className="text-red-600 font-bold">{answer}</span>}
      </div>
    </div>
  );
}
