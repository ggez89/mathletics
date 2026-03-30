import React, { useState } from "react";
import { WorksheetConfig, ProblemDefinition, ParamSchemaItem } from "../types";
import { generateSeed, encodeConfig, decodeConfig, generateTitle, calculateAutoProblemsPerPage } from "../lib/utils";
import { Plus, Trash2, RefreshCw, Printer, Key, Save, FolderOpen, Wand2, ChevronDown, ChevronUp, Minus, X, Divide } from "lucide-react";
import * as fractionModule from "../modules/fraction";
import * as longDivisionModule from "../modules/longDivision";
import * as arithmeticModule from "../modules/arithmetic";

const PROBLEM_MODULES: { [key: string]: any } = {
  fraction: fractionModule,
  longDivision: longDivisionModule,
  arithmetic: arithmeticModule,
};

interface WorksheetControlsProps {
  config: WorksheetConfig;
  onChange: (config: WorksheetConfig) => void;
  onPrint: (showAnswers: boolean) => void;
}

export default function WorksheetControls({ config, onChange, onPrint }: WorksheetControlsProps) {
  const [base64Input, setBase64Input] = useState("");
  const [error, setError] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateLayout = (key: keyof WorksheetConfig["layout"], value: any) => {
    onChange({
      ...config,
      layout: { ...config.layout, [key]: value },
    });
  };

  const addProblemSet = () => {
    const type = "arithmetic";
    const module = PROBLEM_MODULES[type];
    const newSet: ProblemDefinition = {
      type,
      weight: 1,
      params: { ...module.defaultParams },
    };
    onChange({
      ...config,
      problemSets: [...config.problemSets, newSet],
    });
  };

  const removeProblemSet = (index: number) => {
    const newSets = [...config.problemSets];
    newSets.splice(index, 1);
    onChange({ ...config, problemSets: newSets });
  };

  const updateProblemSet = (index: number, updates: Partial<ProblemDefinition>) => {
    const newSets = [...config.problemSets];
    newSets[index] = { ...newSets[index], ...updates };
    // If type changed, reset params
    if (updates.type) {
      newSets[index].params = { ...PROBLEM_MODULES[updates.type].defaultParams };
    }
    onChange({ ...config, problemSets: newSets });
  };

  const updateParams = (setIndex: number, paramName: string, value: any) => {
    const newSets = [...config.problemSets];
    newSets[setIndex].params = { ...newSets[setIndex].params, [paramName]: value };
    onChange({ ...config, problemSets: newSets });
  };

  const handleLoadBase64 = () => {
    const decoded = decodeConfig(base64Input);
    if (decoded) {
      onChange(decoded);
      setBase64Input("");
      setError("");
    } else {
      setError("Invalid Base64 key");
    }
  };

  const handleNewSeed = () => {
    onChange({ ...config, seed: generateSeed() });
  };

  const savePreset = () => {
    const name = prompt("Enter preset name:");
    if (name) {
      const presets = JSON.parse(localStorage.getItem("worksheet_presets") || "{}");
      presets[name] = config;
      localStorage.setItem("worksheet_presets", JSON.stringify(presets));
    }
  };

  const loadPreset = () => {
    const presets = JSON.parse(localStorage.getItem("worksheet_presets") || "{}");
    const names = Object.keys(presets);
    if (names.length === 0) {
      alert("No presets saved.");
      return;
    }
    const name = prompt(`Enter preset name:\n${names.join(", ")}`);
    if (name && presets[name]) {
      onChange(presets[name]);
    }
  };

  const handleRegenerateTitle = () => {
    updateLayout("title", generateTitle(config));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <header className="flex flex-col items-center gap-1 md:gap-3 pb-2 md:pb-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 p-1 bg-white border border-black rounded shadow-sm">
              <Plus size={12} strokeWidth={3} className="text-black" />
              <Minus size={12} strokeWidth={3} className="text-black" />
              <X size={12} strokeWidth={3} className="text-black" />
              <Divide size={12} strokeWidth={3} className="text-black" />
            </div>
            <h1 className="text-xl md:text-2xl font-light tracking-widest text-black uppercase">
              Mathletics
            </h1>
          </div>
          <p className="hidden md:block text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
            Worksheet Generator
          </p>
        </header>

        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPrint(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-md text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Printer size={16} /> Print Worksheet
            </button>
            <button
              onClick={() => onPrint(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-600 text-red-600 rounded-md text-sm font-bold hover:bg-red-50 transition-colors shadow-sm"
            >
              <Printer size={16} /> Print Answers
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Global Settings</h2>
            <button
              onClick={handleNewSeed}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-100 transition-colors"
              title="Regenerate Problems"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Worksheet Title</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.layout.title || generateTitle(config)}
                onChange={(e) => updateLayout("title", e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleRegenerateTitle}
                className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                title="Regenerate Title"
              >
                <Wand2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Pagination Mode</label>
              <select
                value={config.layout.paginationMode}
                onChange={(e) => updateLayout("paginationMode", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              >
                <option value="count">Fixed Problem Count</option>
                <option value="pages">Fixed Page Count</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">
                {config.layout.paginationMode === "pages" ? "Number of Pages" : "Total Problems"}
              </label>
              {config.layout.paginationMode === "pages" ? (
                <input
                  type="number"
                  value={config.layout.pageCount ?? 1}
                  onChange={(e) => updateLayout("pageCount", Math.max(1, parseInt(e.target.value) || 1))}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                />
              ) : (
                <input
                  type="number"
                  value={config.count ?? 0}
                  onChange={(e) => {
                    const newCount = Math.max(1, parseInt(e.target.value) || 1);
                    const maxPerPage = calculateAutoProblemsPerPage(config);
                    onChange({
                      ...config,
                      count: newCount,
                      layout: {
                        ...config.layout,
                        problemsPerPage: Math.min(config.layout.problemsPerPage, newCount, maxPerPage)
                      }
                    });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {config.layout.paginationMode === "count" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Maximum Problems Per Page</label>
                <input
                  type="number"
                  value={config.layout.problemsPerPage ?? 20}
                  max={Math.min(calculateAutoProblemsPerPage(config), config.count)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const maxPerPage = Math.min(calculateAutoProblemsPerPage(config), config.count);
                    updateLayout("problemsPerPage", Math.min(maxPerPage, Math.max(1, val)));
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                />
              </div>
            ) : (
              <div className="space-y-1 opacity-50">
                <label className="text-xs font-semibold text-gray-600">Maximum Problems Per Page</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-xs italic">
                  Auto-calculated
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Problems Per Row</label>
              <input
                type="number"
                value={config.layout.problemsPerRow ?? 1}
                max={config.problemSets.some(s => s.type === "fraction") ? 2 : 3}
                onChange={(e) => {
                  const hasFractions = config.problemSets.some(s => s.type === "fraction");
                  const maxPerRow = hasFractions ? 2 : 3;
                  const newPerRow = Math.min(maxPerRow, Math.max(1, parseInt(e.target.value) || 1));
                  
                  // Recalculate max per page based on new per row
                  const tempConfig = { ...config, layout: { ...config.layout, problemsPerRow: newPerRow } };
                  const maxPerPage = calculateAutoProblemsPerPage(tempConfig);
                  const newPerPage = Math.min(config.layout.problemsPerPage, maxPerPage);
                  
                  onChange({
                    ...config,
                    layout: {
                      ...config.layout,
                      problemsPerRow: newPerRow,
                      problemsPerPage: config.layout.paginationMode === "count" ? newPerPage : config.layout.problemsPerPage
                    }
                  });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Font Size (px)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={config.layout.fontSize ?? 12}
                  onChange={(e) => updateLayout("fontSize", parseInt(e.target.value) || 12)}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => updateLayout("fontSize", (config.layout.fontSize || 12) - 2)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-bold"
                >
                  A-
                </button>
                <button
                  onClick={() => updateLayout("fontSize", (config.layout.fontSize || 12) + 2)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-bold"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Problem Sets</h2>
            <button
              onClick={addProblemSet}
              className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} /> Add Set
            </button>
          </div>

          <div className="space-y-4">
            {config.problemSets?.map((set, setIndex) => (
              <div key={setIndex} className="p-4 bg-white border border-gray-200 rounded-lg space-y-4 shadow-sm">
                <div className="flex justify-between items-center gap-2">
                  <select
                    value={set.type}
                    onChange={(e) => updateProblemSet(setIndex, { type: e.target.value })}
                    className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm font-semibold"
                  >
                    <option value="arithmetic">Basic Arithmetic</option>
                    <option value="fraction">Fractions</option>
                    <option value="longDivision">Long Division</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Weight</label>
                    <input
                      type="number"
                      value={set.weight ?? 1}
                      onChange={(e) => updateProblemSet(setIndex, { weight: parseFloat(e.target.value) || 0 })}
                      onFocus={(e) => e.target.select()}
                      className="w-12 px-1 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-center"
                    />
                    <button
                      onClick={() => removeProblemSet(setIndex)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {PROBLEM_MODULES[set.type]?.paramSchema.map((param: ParamSchemaItem) => (
                    <div key={param.name} className={`space-y-1 ${param.type === "boolean" ? "flex items-center gap-2 pt-4" : ""} ${param.fullWidth ? "col-span-2" : ""}`}>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">{param.label}</label>
                      {param.type === "select" ? (
                        <select
                          value={set.params[param.name] ?? param.default}
                          onChange={(e) => updateParams(setIndex, param.name, e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        >
                          {param.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : param.type === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={set.params[param.name] ?? param.default}
                          onChange={(e) => updateParams(setIndex, param.name, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                      ) : (
                        <input
                          type={param.type}
                          value={set.params[param.name] ?? ""}
                          onChange={(e) =>
                            updateParams(
                              setIndex,
                              param.name,
                              param.type === "number" ? parseFloat(e.target.value) : e.target.value
                            )
                          }
                          onFocus={(e) => e.target.select()}
                          className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>Advanced Controls</span>
            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isAdvancedOpen && (
            <div className="space-y-6 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Seed</label>
                <input
                  type="text"
                  value={config.seed ?? ""}
                  onChange={(e) => onChange({ ...config, seed: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showSeed"
                    checked={config.layout.showSeed ?? false}
                    onChange={(e) => updateLayout("showSeed", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="showSeed" className="text-xs font-semibold text-gray-600">Show Seed on Printout</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showConfigKey"
                    checked={config.layout.showConfigKey ?? false}
                    onChange={(e) => updateLayout("showConfigKey", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="showConfigKey" className="text-xs font-semibold text-gray-600">Show Base64 Footer</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Key size={12} /> Load from Base64 Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="Paste key here..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-mono"
                  />
                  <button
                    onClick={handleLoadBase64}
                    className="px-3 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Load
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={savePreset}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Save size={14} /> Save Preset
                  </button>
                  <button
                    onClick={loadPreset}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <FolderOpen size={14} /> Load Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className="p-3 md:p-6 border-t border-gray-200 bg-white">
        <p className="text-[9px] md:text-[10px] text-gray-400 text-center leading-relaxed">
          Made with love for my family by Patrick Young.<br />
          © 2026 Patrick Young. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
