import React, { useMemo, useState, useEffect, useRef } from "react";
import { calculateAutoProblemsPerPage } from "../lib/utils";
import seedrandom from "seedrandom";
import { WorksheetConfig, Problem } from "../types";
import { weightedRandom, encodeConfig, generateTitle } from "../lib/utils";
import ProblemRenderer from "./ProblemRenderer";
import { Plus, Minus, X, Divide } from "lucide-react";
import * as fractionModule from "../modules/fraction";
import * as longDivisionModule from "../modules/longDivision";
import * as arithmeticModule from "../modules/arithmetic";

const PROBLEM_MODULES: { [key: string]: any } = {
  fraction: fractionModule,
  longDivision: longDivisionModule,
  arithmetic: arithmeticModule,
};

interface WorksheetPreviewProps {
  config: WorksheetConfig;
  showAnswers: boolean;
}

export default function WorksheetPreview({ config, showAnswers }: WorksheetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const padding = window.innerWidth < 768 ? 32 : 96; // p-4 vs p-12
        const availableWidth = containerWidth - padding;
        const pageWidth = 816; // 8.5in * 96dpi
        
        if (availableWidth < pageWidth) {
          setScale(availableWidth / pageWidth);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const autoProblemsPerPage = useMemo(() => {
    const calculatedPerPage = calculateAutoProblemsPerPage(config);

    if (config.layout.paginationMode !== "pages") {
      return Math.min(config.layout.problemsPerPage, calculatedPerPage);
    }
    
    return calculatedPerPage;
  }, [config.layout.paginationMode, config.layout.fontSize, config.layout.spacing, config.layout.problemsPerRow, config.layout.problemsPerPage, config.problemSets]);

  const problems = useMemo(() => {
    const rng = seedrandom(config.seed);
    const generated: Problem[] = [];

    if (!config.problemSets || config.problemSets.length === 0) return [];

    const weights = config.problemSets.map((s) => s.weight || 0);
    const totalCount = config.layout.paginationMode === "pages" 
      ? config.layout.pageCount * autoProblemsPerPage 
      : config.count;

    for (let i = 0; i < totalCount; i++) {
      const selectedSet = weightedRandom(config.problemSets, weights, rng);
      const module = PROBLEM_MODULES[selectedSet.type];
      if (module) {
        generated.push(module.generate(rng, selectedSet.params));
      }
    }

    return generated;
  }, [config.seed, config.count, config.problemSets, config.layout.paginationMode, config.layout.pageCount, autoProblemsPerPage]);

  const displayTitle = useMemo(() => {
    return config.layout.title || generateTitle(config);
  }, [config.layout.title, config.problemSets, config.count]);

  const base64Key = useMemo(() => encodeConfig(config), [config]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${config.layout.problemsPerRow}, 1fr)`,
    gap: `${config.layout.spacing}px`,
    fontSize: `${config.layout.fontSize}px`,
  };

  // Chunk problems into pages
  const pages = useMemo(() => {
    const chunks = [];
    const ppp = autoProblemsPerPage || 20;
    for (let i = 0; i < problems.length; i += ppp) {
      chunks.push(problems.slice(i, i + ppp));
    }
    // Ensure at least one page if count is 0
    if (chunks.length === 0) chunks.push([]);
    return chunks;
  }, [problems, autoProblemsPerPage]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto p-4 md:p-12 bg-gray-200 flex flex-col items-center gap-8 md:gap-12 no-scrollbar print:p-0 print:bg-white print:overflow-visible print:h-auto print:gap-0 print:block"
    >
      {pages.map((pageProblems, pageIndex) => (
        <div 
          key={pageIndex}
          className="worksheet-page-wrapper origin-top transition-transform duration-300 print:transform-none print:mb-0 print:block"
          style={{ 
            transform: `scale(${scale})`,
            marginBottom: scale < 1 ? `calc(${(1 - scale) * -1056}px + 2rem)` : "0"
          }}
        >
          <div 
            className="w-[8.5in] min-h-[11in] bg-white shadow-2xl px-8 pt-8 pb-12 flex flex-col print:shadow-none print:w-[8.5in] print:h-[11in] print:min-h-[11in] print:px-8 print:pt-8 print:pb-12 print:border-0 print:break-after-page print:mx-auto"
          >
            <header className="mb-8 space-y-4">
            <div className="flex justify-between items-end border-b-4 border-black pb-4">
              <div className="flex-1 min-w-0 pr-12">
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-2 gap-0.5 p-1 bg-white border-2 border-black rounded shadow-sm shrink-0">
                    <Plus size={16} strokeWidth={3} className="text-black" />
                    <Minus size={16} strokeWidth={3} className="text-black" />
                    <X size={16} strokeWidth={3} className="text-black" />
                    <Divide size={16} strokeWidth={3} className="text-black" />
                  </div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none break-words">
                    {displayTitle}
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-3 h-5 ml-[68px]">
                  {showAnswers && (
                    <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                      Answer Key
                    </span>
                  )}
                  {config.layout.showSeed && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Seed: <span className="text-black font-mono">{config.seed}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-4">
                <div className="flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                  <span>Name:</span>
                  <div className="w-48 border-b-2 border-black h-5"></div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                  <span>Score:</span>
                  <div className="w-16 border-b-2 border-black h-5 flex items-center justify-end pr-1">
                    <span className="text-black font-normal">/ {problems.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1" style={gridStyle}>
            {pageProblems.map((problem, index) => (
              <div key={problem.id} className="break-inside-avoid">
                <ProblemRenderer
                  problem={problem}
                  showAnswers={showAnswers}
                  number={pageIndex * autoProblemsPerPage + index + 1}
                />
              </div>
            ))}
          </main>

          <footer className="mt-auto pt-8 flex justify-between items-end text-[9px] text-gray-400 font-mono">
            <div className="flex-1">
              {config.layout.showConfigKey && (
                <div className="max-w-[80%] break-all">
                  <span className="font-bold uppercase text-gray-300 block mb-1">Config Key:</span>
                  {base64Key}
                </div>
              )}
            </div>
            <div className="text-right whitespace-nowrap">
              {pages.length > 1 && (
                <div className="text-gray-500 font-bold text-[11px]">PAGE {pageIndex + 1} OF {pages.length}</div>
              )}
            </div>
          </footer>
        </div>
      </div>
    ))}
    </div>
  );
}
