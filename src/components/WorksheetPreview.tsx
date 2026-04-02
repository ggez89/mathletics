import React, { useMemo, useState, useEffect, useRef } from "react";
import { calculateAutoProblemsPerPage } from "../lib/utils";
import seedrandom from "seedrandom";
import { WorksheetConfig, Problem } from "../types";
import { weightedRandomIndex, encodeConfig, generateTitle } from "../lib/utils";
import ProblemRenderer from "./ProblemRenderer";
import { Plus, Minus, X, Divide } from "lucide-react";
import * as fractionModule from "../modules/fraction";
import * as longDivisionModule from "../modules/longDivision";
import * as arithmeticModule from "../modules/arithmetic";
import * as timeModule from "../modules/time";

const PROBLEM_MODULES: { [key: string]: any } = {
  fraction: fractionModule,
  longDivision: longDivisionModule,
  arithmetic: arithmeticModule,
  time: timeModule,
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
    const calculatedPerPage = calculateAutoProblemsPerPage(config, showAnswers);

    if (config.layout.paginationMode !== "pages") {
      return Math.min(config.layout.problemsPerPage, calculatedPerPage);
    }
    
    return calculatedPerPage;
  }, [config.layout.paginationMode, config.layout.fontSize, config.layout.spacing, config.layout.problemsPerRow, config.layout.problemsPerPage, config.problemSets, showAnswers]);

  const problems = useMemo(() => {
    const rng = seedrandom(config.seed);
    const generated: Problem[] = [];

    if (!config.problemSets || config.problemSets.length === 0) return [];

    const weights = config.problemSets.map((s) => s.weight || 0);
    const blankCapacity = calculateAutoProblemsPerPage(config, false);
    const totalCount = config.layout.paginationMode === "pages" 
      ? config.layout.pageCount * blankCapacity 
      : config.count;

    // Track seen problems per problem set to avoid duplicates until exhausted
    const seenProblems = new Map<number, Set<string>>();

    for (let i = 0; i < totalCount; i++) {
      const setIndex = weightedRandomIndex(weights, rng);
      const selectedSet = config.problemSets[setIndex];
      const module = PROBLEM_MODULES[selectedSet.type];
      
      if (module) {
        if (!seenProblems.has(setIndex)) {
          seenProblems.set(setIndex, new Set());
        }
        const seen = seenProblems.get(setIndex)!;

        let problem: Problem | null = null;
        let attempts = 0;
        const MAX_ATTEMPTS = 100;

        while (attempts < MAX_ATTEMPTS) {
          const candidate = module.generate(rng, selectedSet.params);
          // Create a unique key based on the problem data
          // We use JSON.stringify of the data to ensure 1+2 is different from 2+1
          const problemKey = JSON.stringify(candidate.question.data);
          
          if (!seen.has(problemKey)) {
            seen.add(problemKey);
            problem = candidate;
            break;
          }
          attempts++;
        }

        // If we couldn't find a unique problem after MAX_ATTEMPTS, 
        // it's likely we exhausted permutations for this specific set.
        // Reset the seen set for this set and pick the next generated one.
        if (!problem) {
          seen.clear();
          problem = module.generate(rng, selectedSet.params);
          const problemKey = JSON.stringify(problem.question.data);
          seen.add(problemKey);
        }

        generated.push(problem);
      }
    }

    return generated;
  }, [config.seed, config.count, config.problemSets, config.layout.paginationMode, config.layout.pageCount, config.layout.fontSize, config.layout.spacing, config.layout.problemsPerRow]);

  const displayTitle = useMemo(() => {
    return config.layout.title || generateTitle(config);
  }, [config.layout.title, config.problemSets, config.count]);

  const [titleScale, setTitleScale] = useState(1);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustTitleSize = () => {
      if (titleRef.current && titleParentRef.current) {
        const parentWidth = titleParentRef.current.offsetWidth;
        const titleWidth = titleRef.current.scrollWidth;
        
        if (titleWidth > parentWidth && parentWidth > 0) {
          setTitleScale(parentWidth / titleWidth);
        } else {
          setTitleScale(1);
        }
      }
    };

    // Small delay to ensure layout is stable
    const timer = setTimeout(adjustTitleSize, 50);
    window.addEventListener("resize", adjustTitleSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustTitleSize);
    };
  }, [displayTitle, scale]); // Re-run when title or page scale changes

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
            className="relative w-[8.5in] h-[11in] max-h-[11in] bg-white shadow-2xl px-8 pt-8 pb-8 flex flex-col overflow-hidden print:shadow-none print:w-[8.5in] print:h-[11in] print:min-h-[11in] print:px-8 print:pt-8 print:pb-8 print:border-0 print:break-after-page print:mx-auto"
          >
            <header className="mb-6 space-y-4 shrink-0">
            <div className="flex justify-between items-end border-b-4 border-black pb-4">
              <div className="flex-1 min-w-0 pr-24">
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-2 gap-0.5 p-1 bg-white border-2 border-black rounded shadow-sm shrink-0">
                    <Plus size={16} strokeWidth={3} className="text-black" />
                    <Minus size={16} strokeWidth={3} className="text-black" />
                    <X size={16} strokeWidth={3} className="text-black" />
                    <Divide size={16} strokeWidth={3} className="text-black" />
                  </div>
                  <div ref={titleParentRef} className="flex-1 min-w-0 overflow-hidden">
                    <h1 
                      ref={titleRef}
                      className="text-4xl font-black uppercase tracking-tighter leading-none whitespace-nowrap origin-left"
                      style={{ 
                        transform: `scale(${titleScale})`,
                        width: 'max-content'
                      }}
                    >
                      {displayTitle}
                    </h1>
                  </div>
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

          <main className="flex-1 min-h-0 pb-4 overflow-hidden" style={gridStyle}>
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

          <footer className="mt-auto pt-8 flex justify-between items-end text-[9px] text-gray-400 font-mono shrink-0 print:absolute print:bottom-8 print:left-8 print:right-8 print:pt-0 print:text-gray-600">
            <div className="flex-1">
              {config.layout.showConfigKey && (
                <div className="max-w-[80%] break-all mb-2">
                  <span className="font-bold uppercase text-gray-300 block mb-1">Config Key:</span>
                  {base64Key}
                </div>
              )}
              <div className="text-gray-400 text-[11px] print:text-gray-600">https://ggez89.github.io/mathletics/</div>
            </div>
            <div className="text-right whitespace-nowrap">
              {pages.length > 1 && (
                <div className="text-gray-500 font-bold text-[11px] print:text-gray-700">PAGE {pageIndex + 1} OF {pages.length}</div>
              )}
            </div>
          </footer>
        </div>
      </div>
    ))}
    </div>
  );
}
