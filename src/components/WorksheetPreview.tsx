import React, { useMemo } from "react";
import seedrandom from "seedrandom";
import { WorksheetConfig, Problem } from "../types";
import { weightedRandom, encodeConfig, generateTitle } from "../lib/utils";
import ProblemRenderer from "./ProblemRenderer";
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
  const problems = useMemo(() => {
    const rng = seedrandom(config.seed);
    const generated: Problem[] = [];

    if (!config.problemSets || config.problemSets.length === 0) return [];

    const weights = config.problemSets.map((s) => s.weight || 0);

    for (let i = 0; i < config.count; i++) {
      const selectedSet = weightedRandom(config.problemSets, weights, rng);
      const module = PROBLEM_MODULES[selectedSet.type];
      if (module) {
        generated.push(module.generate(rng, selectedSet.params));
      }
    }

    return generated;
  }, [config.seed, config.count, config.problemSets]);

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

  return (
    <div className="h-full overflow-y-auto p-12 bg-gray-200 flex flex-col items-center no-scrollbar print:p-0 print:bg-white print:overflow-visible">
      {/* Printable Area */}
      <div id="worksheet-content" className="w-[8.5in] min-h-[11in] bg-white shadow-2xl p-12 flex flex-col print:shadow-none print:w-full print:min-h-0 print:p-12 print:border-0">
        <header className="mb-8 space-y-6">
          <div className="flex justify-between items-start border-b-4 border-black pb-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black uppercase tracking-tighter">{displayTitle}</h1>
              {config.layout.showSeed && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Seed: <span className="text-black font-mono">{config.seed}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Name:</span>
                <div className="w-48 border-b-2 border-black h-6"></div>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>Score:</span>
                <div className="w-16 border-b-2 border-black h-6 flex items-center justify-end pr-1">
                  <span className="text-black">/ {config.count}</span>
                </div>
              </div>
              {showAnswers && (
                <span className="mt-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  Answer Key
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1" style={gridStyle}>
          {problems.map((problem, index) => (
            <div key={problem.id} className="break-inside-avoid">
              <ProblemRenderer
                problem={problem}
                showAnswers={showAnswers}
                number={index + 1}
              />
            </div>
          ))}
        </main>

        <footer className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400 font-mono break-all">
          <div className="max-w-[80%]">
            <span className="font-bold uppercase text-gray-300 block mb-1">Config Key:</span>
            {base64Key}
          </div>
          <div className="text-right uppercase font-bold tracking-widest">
            v{config.version}
          </div>
        </footer>
      </div>
    </div>
  );
}
