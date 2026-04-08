import React from "react";
import { ProblemData } from "../../types";

export default function StackedRenderer({ data, showAnswer, answer }: { data: ProblemData; showAnswer: boolean; answer: string }) {
  const { a, b, operation, steps } = data;
  
  const sA = a.toString();
  const sB = b.toString();
  const sAns = answer.toString();
  const maxLen = Math.max(sA.length, sB.length, sAns.length);
  
  const padA = sA.padStart(maxLen, " ");
  const padB = sB.padStart(maxLen, " ");
  const padAns = sAns.padStart(maxLen, " ");

  const isAddition = operation === "+" || operation === "Addition";
  const isSubtraction = operation === "-" || operation === "−" || operation === "Subtraction";
  const isMultiplication = operation === "×" || operation === "Multiplication";

  const stepColors = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c"];

  // Adjust steps to match maxLen padding
  const offset = maxLen - sA.length;
  const paddedBorrows = steps?.borrows ? [
    ...Array(offset).fill(null),
    ...steps.borrows
  ] : null;

  const paddedCarries = steps?.carries ? [
    ...Array(maxLen - (steps.carries?.length || 0)).fill(0),
    ...steps.carries
  ] : null;

  const showPartialProducts = showAnswer && isMultiplication && steps?.partialProducts && steps.partialProducts.length > 0;

  return (
    <div className="inline-block font-mono text-right">
      <div 
        className="grid gap-x-0 items-end" 
        style={{ 
          gridTemplateColumns: `2.5rem repeat(${maxLen}, 1.5ch)`,
          lineHeight: 1
        }}
      >
        {/* Row 0: Carry/Borrow (Only for Add/Sub) */}
        {!isMultiplication && (
          <>
            <div className="h-6"></div>
            {Array.from({ length: maxLen }).map((_, i) => {
              let content = null;
              if (showAnswer) {
                if (isAddition && paddedCarries) {
                  const c = paddedCarries[i];
                  if (c > 0) content = <span className="text-red-500 font-bold text-lg">{c}</span>;
                } else if (isSubtraction && paddedBorrows) {
                  const step = paddedBorrows[i];
                  if (step?.borrowedFrom) {
                    content = <span className="text-red-500 font-bold text-base">{step.current}</span>;
                  }
                }
              }
              return (
                <div key={i} className="flex items-end justify-center h-6">
                  {content}
                </div>
              );
            })}
          </>
        )}

        {/* Row 1: Top Number */}
        <div className="h-8"></div>
        {padA.split("").map((char, i) => {
          const step = paddedBorrows?.[i];
          const hasSmallOne = showAnswer && isSubtraction && step?.isBorrowed && step.current >= 10;
          const isSlashed = showAnswer && isSubtraction && step?.borrowedFrom;
          
          return (
            <div key={i} className="relative h-8 flex items-center justify-center text-2xl">
              {isSlashed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[2px] bg-red-500 rotate-45" />
                </div>
              )}
              {hasSmallOne && (
                <span className="absolute -left-1 top-0 text-[16px] text-red-500 font-bold">1</span>
              )}
              {char}
            </div>
          );
        })}

        {/* Row 2: Bottom Number & Operation */}
        <div className="h-8 flex items-center justify-start text-2xl border-b-2 border-black">
          <span className="pl-1">{operation}</span>
        </div>
        {padB.split("").map((char, i) => {
          let color = "inherit";
          if (showAnswer && isMultiplication && char !== " ") {
            const digitIndexFromRight = sB.length - 1 - (i - (maxLen - sB.length));
            if (digitIndexFromRight >= 0) {
              color = stepColors[digitIndexFromRight % stepColors.length];
            }
          }
          return (
            <div key={i} className="h-8 flex items-center justify-center text-2xl border-b-2 border-black" style={{ color }}>
              {char}
            </div>
          );
        })}

        {/* Partial Products (Multiplication only) */}
        {showPartialProducts && steps.partialProducts.map((pp: any, ppIdx: number) => {
          const ppStr = pp.value.toString();
          const ppPad = ppStr.padStart(maxLen, " ");
          const isLast = ppIdx === steps.partialProducts.length - 1;
          return (
            <React.Fragment key={ppIdx}>
              <div className={`h-8 ${isLast ? "border-b-2 border-black" : ""}`}></div>
              {ppPad.split("").map((char, i) => (
                <div key={i} className={`h-8 flex items-center justify-center text-2xl ${isLast ? "border-b-2 border-black" : ""}`} style={{ color: pp.color }}>
                  {char === " " ? "" : char}
                </div>
              ))}
            </React.Fragment>
          );
        })}

        {/* Row 3: Answer */}
        <div className="h-10"></div>
        {padAns.split("").map((char, i) => (
          <div key={i} className="h-10 flex items-center justify-center">
            {showAnswer && char !== " " && (
              <span className={`${isMultiplication ? "text-black" : "text-red-600"} font-bold text-2xl`}>
                {char}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
