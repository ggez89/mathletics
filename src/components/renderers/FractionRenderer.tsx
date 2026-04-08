import React from "react";
import { ProblemData } from "../../types";

export default function FractionRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { n1, d1, n2, d2, w1, w2, operation, steps } = data;
  const formatNum = (n: number) => n.toString().replace("-", "−");

  const Fraction = ({ n, d, w, color, forceFraction }: { n: number; d: number; w?: number; color?: string; forceFraction?: boolean }) => {
    if (forceFraction) {
      return (
        <div className={`flex items-center justify-center gap-1 ${color || ""}`}>
          <div className="flex flex-col items-center justify-center min-w-[1.5rem]">
            <div className="border-b-2 border-current w-full text-center pb-0.5 text-lg font-bold">{formatNum(n)}</div>
            <div className="pt-0.5 text-lg font-bold">{formatNum(d)}</div>
          </div>
        </div>
      );
    }
    const wholePart = (w || 0) + (d === 1 ? n : 0);
    const showFraction = n > 0 && d > 1;
    const showWhole = wholePart > 0 || !showFraction;

    return (
      <div className={`flex items-center justify-center gap-1 ${color || ""}`}>
        {showWhole && <span className="text-2xl font-bold">{wholePart}</span>}
        {showFraction && (
          <div className="flex flex-col items-center justify-center min-w-[1.5rem]">
            <div className="border-b-2 border-current w-full text-center pb-0.5 text-lg font-bold">{formatNum(n)}</div>
            <div className="pt-0.5 text-lg font-bold">{formatNum(d)}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Problem Row */}
      <div className="flex items-center gap-3">
        <Fraction n={n1} d={d1} w={w1} />
        <span className="font-bold text-xl">{operation}</span>
        <Fraction n={n2} d={d2} w={w2} />
        <span className="text-xl">=</span>
        <div className="min-w-[4rem] border-b-2 border-black h-12"></div>
      </div>

      {/* Solution Row */}
      {showAnswer && steps && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-4 text-red-600 bg-red-50/50 p-3 rounded-lg border border-red-100">
          {/* Step 1: Improper conversion if mixed */}
          {(w1 > 0 || w2 > 0) && (
            <>
              <Fraction n={w1 * d1 + n1} d={d1} color="text-red-600" />
              <span className="font-bold">{operation}</span>
              <Fraction n={w2 * d2 + n2} d={d2} color="text-red-600" />
              <span className="font-bold">=</span>
            </>
          )}

          {/* Step 2: Operation Specifics */}
          {steps.common && (
            <>
              {steps.common.original && (
                <>
                  <Fraction n={steps.common.n1} d={steps.common.resD} color="text-red-600" />
                  <span className="font-bold">{operation}</span>
                  <Fraction n={steps.common.n2} d={steps.common.resD} color="text-red-600" />
                  <span className="font-bold">=</span>
                </>
              )}
              <Fraction n={steps.common.resN} d={steps.common.resD} color="text-red-600" />
            </>
          )}

          {steps.multiply && (
            <Fraction n={steps.multiply.resN} d={steps.multiply.resD} color="text-red-600" />
          )}

          {steps.inverse && (
            <>
              <Fraction n={steps.inverse.n1} d={steps.inverse.d1} color="text-red-600" forceFraction />
              <span className="font-bold">×</span>
              <Fraction n={steps.inverse.n2} d={steps.inverse.d2} color="text-red-600" forceFraction />
              <span className="font-bold">=</span>
              <Fraction n={steps.inverse.resN} d={steps.inverse.resD} color="text-red-600" />
            </>
          )}

          {/* Step 3: Reducing */}
          {steps.reduce && (
            <>
              <span className="font-bold">=</span>
              <div className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="border-b-2 border-current pb-0.5 px-1">{steps.reduce.n} ÷ {steps.reduce.factor}</div>
                  <div className="pt-0.5 px-1">{steps.reduce.d} ÷ {steps.reduce.factor}</div>
                </div>
              </div>
              <span className="font-bold">=</span>
              <Fraction n={steps.reduce.resN} d={steps.reduce.resD} color="text-red-600" />
            </>
          )}

          {/* Step 4: Final Mixed Number */}
          {steps.mixed && (() => {
            // Check if the previous step already showed this whole number
            const prevStep = steps.reduce || steps.common || steps.multiply || steps.inverse;
            if (prevStep && prevStep.resD === 1 && !steps.mixed.n) return false;
            return true;
          })() && (
            <>
              <span className="font-bold">=</span>
              <Fraction n={steps.mixed.n || 0} d={steps.mixed.d || 1} w={steps.mixed.whole} color="text-red-600" />
            </>
          )}
          
          {/* Fallback if no specific steps but we have an answer */}
          {!steps.common && !steps.multiply && !steps.inverse && !steps.reduce && !steps.mixed && (
             <span className="font-bold text-lg">{answer}</span>
          )}
        </div>
      )}
    </div>
  );
}
