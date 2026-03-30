import React, { useState, useEffect } from "react";
import { WorksheetConfig } from "./types";
import { generateSeed } from "./lib/utils";
import WorksheetControls from "./components/WorksheetControls";
import WorksheetPreview from "./components/WorksheetPreview";

const DEFAULT_CONFIG: WorksheetConfig = {
  version: "1.0.0",
  seed: generateSeed(),
  layout: {
    problemsPerRow: 2,
    fontSize: 16,
    spacing: 20,
    title: "", // Empty for auto-generation
    showAnswers: false,
    showSeed: false,
  },
  problemSets: [
    {
      type: "arithmetic",
      weight: 1,
      params: { 
        minVal: 1, 
        maxVal: 10, 
        maxAnswer: 20, 
        operation: "+", 
        format: "inline", 
        nonNegative: true,
        disallowOne: true 
      },
    },
  ],
  count: 20,
};

export default function App() {
  const [config, setConfig] = useState<WorksheetConfig>(DEFAULT_CONFIG);
  const [showAnswers, setShowAnswers] = useState(false);

  // Load initial config from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) {
      // We could handle this here if we want to support sharing via URL
    }
  }, []);

  const handlePrint = (answers: boolean) => {
    setShowAnswers(answers);
    // Use a slightly longer timeout and ensure we're on the main thread
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      {/* Left Panel: Controls */}
      <aside className="w-96 flex-shrink-0 print:hidden">
        <WorksheetControls config={config} onChange={setConfig} onPrint={handlePrint} />
      </aside>

      {/* Right Panel: Preview */}
      <main className="flex-1 overflow-hidden relative">
        <WorksheetPreview config={config} showAnswers={showAnswers} />
        
        {/* Floating Print Toggle for UI convenience */}
        <div className="absolute top-6 right-6 flex gap-2 print:hidden">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg transition-all ${
              showAnswers ? "bg-red-600 text-white" : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            {showAnswers ? "Showing Answers" : "Show Answers"}
          </button>
        </div>
      </main>
    </div>
  );
}
