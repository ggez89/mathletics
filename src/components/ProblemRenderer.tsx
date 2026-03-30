import React from "react";
import { Problem } from "../types";
import FractionRenderer from "./renderers/FractionRenderer";
import LongDivisionRenderer from "./renderers/LongDivisionRenderer";
import VerticalRenderer from "./renderers/VerticalRenderer";
import InlineRenderer from "./renderers/InlineRenderer";

interface ProblemRendererProps {
  problem: Problem;
  showAnswers: boolean;
  number: number;
}

export const ProblemRenderer: React.FC<ProblemRendererProps> = ({ problem, showAnswers, number }) => {
  const { format, data } = problem.question;
  const { display } = problem.answer;

  const renderContent = () => {
    switch (format) {
      case "fraction":
        return <FractionRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "longDivision":
        return <LongDivisionRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "vertical":
        return <VerticalRenderer data={data} showAnswer={showAnswers} answer={display} />;
      case "inline":
      default:
        return <InlineRenderer data={data} showAnswer={showAnswers} answer={display} />;
    }
  };

  return (
    <div className={`flex items-start gap-2 ${format === "longDivision" ? "pt-8 pb-1" : "py-2"} px-2 border border-transparent hover:border-gray-100 transition-colors`}>
      <div className="font-bold text-gray-400 min-w-[1.5rem] pt-1">{number}.</div>
      <div className="flex-1 flex justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

export default ProblemRenderer;
