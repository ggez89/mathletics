import React, { useState } from "react";
import { WorksheetConfig, ProblemDefinition, ParamSchemaItem } from "../types";
import { generateSeed, encodeConfig, decodeConfig, generateTitle } from "../lib/utils";
import { Plus, Trash2, RefreshCw, Printer, Key, Save, FolderOpen, Wand2 } from "lucide-react";
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
    <div className="h-full overflow-y-auto p-6 bg-gray-50 border-r border-gray-200 space-y-8 no-scrollbar">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Global Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Seed</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.seed ?? ""}
                onChange={(e) => onChange({ ...config, seed: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono"
              />
              <button
                onClick={handleNewSeed}
                className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                title="New Seed"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Problem Count</label>
            <input
              type="number"
              value={config.count ?? 0}
              onChange={(e) => onChange({ ...config, count: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="showSeed"
            checked={config.layout.showSeed ?? false}
            onChange={(e) => updateLayout("showSeed", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="showSeed" className="text-xs font-semibold text-gray-600">Show Seed on Printout</label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Worksheet Title</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.layout.title ?? ""}
              onChange={(e) => updateLayout("title", e.target.value)}
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
            <label className="text-xs font-semibold text-gray-600">Problems Per Row</label>
            <input
              type="number"
              value={config.layout.problemsPerRow ?? 1}
              onChange={(e) => updateLayout("problemsPerRow", parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Font Size (px)</label>
            <input
              type="number"
              value={config.layout.fontSize ?? 12}
              onChange={(e) => updateLayout("fontSize", parseInt(e.target.value) || 12)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
            />
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
          {config.problemSets.map((set, setIndex) => (
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
                {PROBLEM_MODULES[set.type].paramSchema.map((param: ParamSchemaItem) => (
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
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPrint(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Printer size={16} /> Print Worksheet
          </button>
          <button
            onClick={() => onPrint(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Printer size={16} className="text-red-500" /> Print Answers
          </button>
          <button
            onClick={savePreset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Save size={16} /> Save Preset
          </button>
          <button
            onClick={loadPreset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <FolderOpen size={16} /> Load Preset
          </button>
        </div>

        <p className="text-[10px] text-gray-400 italic">
          Note: Print buttons trigger the browser's print dialog.
        </p>

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
      </section>
    </div>
  );
}
