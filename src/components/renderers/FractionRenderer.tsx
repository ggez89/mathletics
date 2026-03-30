import React from "react";
import { ProblemData } from "../../types";

export default function FractionRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { n1, d1, n2, d2, operation } = data;

  const Fraction = ({ n, d }: { n: number; d: number }) => (
    <div className="flex flex-col items-center justify-center min-w-[1.5rem]">
      <div className="border-b border-black w-full text-center pb-0.5">{n}</div>
      <div className="pt-0.5">{d}</div>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <Fraction n={n1} d={d1} />
      <span className="text-xl font-bold">{operation}</span>
      <Fraction n={n2} d={d2} />
      <span className="text-xl">=</span>
      <div className="min-w-[4rem] border-b border-black h-10 flex items-end justify-center">
        {showAnswer && <span className="text-red-600 font-bold">{answer}</span>}
      </div>
    </div>
  );
}
