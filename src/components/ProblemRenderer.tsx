import React from "react";
import { Problem } from "../types";
import FractionRenderer from "./renderers/FractionRenderer";
import LongDivisionRenderer from "./renderers/LongDivisionRenderer";
import VerticalRenderer from "./renderers/VerticalRenderer";
import InlineRenderer from "./renderers/InlineRenderer";
import TimeRenderer from "./renderers/TimeRenderer";

interface ProblemRendererProps {
  problem: Problem;
  showAnswers: boolean;
  number: number;
}

export const ProblemRenderer: React.FC<ProblemRendererProps> = ({ problem, showAnswers, number }) => {
  const { format, data } = problem.question;
  const { display, value } = problem.answer;

  const renderContent = () => {
    switch (format) {
      case "fraction":
        return <FractionRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "longDivision":
        return <LongDivisionRenderer data={data} showAnswer={showAnswers} answer={display} steps={value?.steps} />;
      case "vertical":
        return <VerticalRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "time":
        return <TimeRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "inline":
      default:
        return <InlineRenderer data={data} showAnswer={showAnswers} answer={display} />;
    }
  };

  return (
    <div className={`flex ${format === "inline" ? "items-center" : "items-start"} gap-2 ${format === "longDivision" ? "py-2 print:py-3" : "py-2 print:py-3"} px-2 border border-transparent hover:border-gray-100 transition-colors`}>
      <div className={`font-bold text-black min-w-[1.5rem] ${format === "longDivision" ? "mt-[1.8rem] h-[1.8rem] flex items-center font-mono text-lg" : format === "inline" ? "flex items-center h-8 font-mono text-lg" : "pt-1"}`}>
        {number}.
      </div>
      <div className="flex-1 flex justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

export default ProblemRenderer;
