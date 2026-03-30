import React from "react";
import { ProblemData } from "../../types";

export default function VerticalRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { a, b, operation } = data;
  return (
    <div className="flex flex-col items-end gap-1 font-mono text-xl min-w-[4rem]">
      <div className="pr-1">{a}</div>
      <div className="border-b-2 border-black w-full flex justify-between items-center pb-1">
        <span>{operation}</span>
        <span className="pr-1">{b}</span>
      </div>
      <div className="h-8 flex items-center justify-end w-full">
        {showAnswer && <span className="text-red-600 font-bold pr-1">{answer}</span>}
      </div>
    </div>
  );
}
