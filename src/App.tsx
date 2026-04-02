import React, { useState, useEffect } from "react";
import { WorksheetConfig } from "./types";
import { generateSeed, decodeConfig } from "./lib/utils";
import WorksheetControls from "./components/WorksheetControls";
import WorksheetPreview from "./components/WorksheetPreview";
import { Menu, FileText } from "lucide-react";

const DEFAULT_CONFIG: WorksheetConfig = {
  version: "1.0.0",
  seed: generateSeed(),
  layout: {
    problemsPerRow: 3,
    fontSize: 20,
    spacing: 20,
    title: "", // Empty for auto-generation
    showAnswers: false,
    showSeed: false,
    showConfigKey: false,
    showQRCode: false,
    paginationMode: "pages",
    problemsPerPage: 20,
    pageCount: 1,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load initial config from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const mode = params.get("mode");
    
    if (key) {
      const decoded = decodeConfig(key);
      if (decoded) {
        // If mode=answers is present, show answers automatically and close sidebar
        if (mode === "answers") {
          setShowAnswers(true);
          setIsSidebarOpen(false);
        }
        setConfig(decoded);
      }
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
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900 print:h-auto print:overflow-visible">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl md:hidden print:hidden"
      >
        {isSidebarOpen ? <FileText size={24} /> : <Menu size={24} />}
      </button>

      {/* Left Panel: Controls */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-full md:w-96 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 print:hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <WorksheetControls config={config} onChange={setConfig} onPrint={handlePrint} />
      </aside>

      {/* Right Panel: Preview */}
      <main className="flex-1 overflow-hidden relative print:h-auto print:overflow-visible print:block print:w-full">
        <WorksheetPreview config={config} showAnswers={showAnswers} />
        
        {/* Floating Print Toggle for UI convenience */}
        <div className={`fixed bottom-6 right-6 z-50 flex gap-2 print:hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto" : "opacity-100"}`}>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-6 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transition-all ${
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
