import React, { useState, useEffect } from "react";
import {
  Database,
  Sparkles,
  Play,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  AreaChart as ChartIcon,
  HelpCircle,
  Lightbulb,
  Layers,
  History,
  Trash2,
  ChevronRight,
  Code,
  FileText,
  AlertCircle,
  TrendingUp,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
  Github,
  Linkedin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SCHEMA_PRESETS } from "./presets";
import { AnalysisResult, SavedAnalysis, SchemaPreset } from "./types";
import InteractiveChart from "./components/InteractiveChart";

export default function App() {
  // Collapsible state for project introduction
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(true);

  // Input states
  const [dbType, setDbType] = useState<string>("PostgreSQL");
  const [schema, setSchema] = useState<string>(SCHEMA_PRESETS[0].schema);
  const [question, setQuestion] = useState<string>(SCHEMA_PRESETS[0].sampleQuestions[0].question);

  // Active preset tracking
  const [activePresetId, setActivePresetId] = useState<string>("ecommerce");

  // App UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // SQL sandbox editing
  const [editedSql, setEditedSql] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"visuals" | "explanation" | "insights" | "limitations">("visuals");

  // History tracking
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Feedback states
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dbDialects = [
    "PostgreSQL",
    "MySQL",
    "SQL Server",
    "BigQuery",
    "Snowflake",
    "SQLite",
    "Spark SQL",
  ];

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai_sql_analyst_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse SQL query history.", e);
      }
    }
  }, []);

  // Sync sandbox state when results update
  useEffect(() => {
    if (result) {
      setEditedSql(result.sql);
    }
  }, [result]);

  // Loading phase animation timer
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Trigger temporary toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Copy to Clipboard
  const handleCopy = (text: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Preset Selector Hydration
  const handlePresetSelect = (preset: SchemaPreset) => {
    setActivePresetId(preset.id);
    setDbType(preset.dbType);
    setSchema(preset.schema);
    if (preset.sampleQuestions.length > 0) {
      setQuestion(preset.sampleQuestions[0].question);
    }
    showToast(`Loaded ${preset.name} database template.`);
  };

  // History Selection Hydration
  const handleHistorySelect = (item: SavedAnalysis) => {
    setDbType(item.dbType);
    setSchema(item.schema);
    setQuestion(item.question);
    setResult(item.result);
    setEditedSql(item.result.sql);
    setError(null);
    showToast("Restored analysis query from local history ledger.");
  };

  // Delete History Record
  const handleHistoryRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("ai_sql_analyst_history", JSON.stringify(updated));
    showToast("Removed historical query record.");
  };

  // Clear All History Ledger
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ai_sql_analyst_history");
    showToast("Cleared query logs history ledger.");
  };

  // Core Analytical Pipeline Invocation
  const handleAnalyze = async () => {
    if (!schema.trim() || !question.trim()) {
      setError("Please ensure both your database schema and business question are provided.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/sql-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbType,
          schema: schema.trim(),
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate analytical assessment.");
      }

      setResult(data);

      // Save to History
      const newHistoryItem: SavedAnalysis = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        dbType,
        question: question.trim(),
        schema: schema.trim(),
        result: data,
      };

      const revisedHistory = [newHistoryItem, ...history.slice(0, 24)];
      setHistory(revisedHistory);
      localStorage.setItem("ai_sql_analyst_history", JSON.stringify(revisedHistory));
    } catch (err: any) {
      console.error("Execution failed:", err);
      setError(err?.message || "An unexpected communication error occurred. Check server environment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset/Clear Forms
  const handleReset = () => {
    setSchema("");
    setQuestion("");
    setResult(null);
    setError(null);
    setActivePresetId("");
    showToast("Cleared inputs work canvas.");
  };

  // Mock Loading Messages Timeline
  const loadingSteps = [
    { title: "Analyzing schema tables and constraints", desc: "Mapping relationships, datatypes, indices, and foreign keys." },
    { title: "Identifying dialect optimization logic", desc: "Constructing JOIN targets, filters, and parsing aggregates." },
    { title: "Generating production-ready ANSI SQL", desc: "Ensuring proper formatting, explicit filters, and dialect adherence." },
    { title: "Formulating business decisions & metrics", desc: "Structuring mock records and extracting KPI insights." },
  ];

  return (
    <div id="app_root" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Toast Alert overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Structural Navbar */}
      <header className="bg-white border-b border-slate-100 py-4.5 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                  AI SQL Analyst Assistant
                </h1>
                <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs shrink-0">
                  AI-Powered Analytics Workbench
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                  BI Core
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
                Transform business questions into SQL queries, actionable insights, and visualization recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer relative"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Query Logs Ledger</span>
              {history.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                  {history.length}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50/80 px-3.5 py-1.5 rounded-xl border border-indigo-100 text-[11px] text-slate-705 font-mono shadow-xs">
              <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Model: <span className="font-bold text-indigo-800">gemini-3.5-flash</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* About This Project Section - Collapsible Showcase Details */}
      <section className="max-w-7xl w-full mx-auto px-4 md:px-6 mt-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full flex items-center justify-between p-4 px-5 text-left bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 px-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-semibold rounded-lg font-mono shrink-0">
                INFO
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Info className="w-4.5 h-4.5 text-indigo-600" />
                  About This Project
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Understand target audiences, core business purposes, capabilities, and technologies built into this portfolio-grade assistant.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <span>{isAboutExpanded ? "Collapse About Section" : "Expand About Section"}</span>
              {isAboutExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          <AnimatePresence>
            {isAboutExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-slate-100 p-6 bg-white overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                  {/* Column 1: Purpose */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">
                      01. Purpose
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">Project Mission</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Convert business questions from natural language into production-quality, dialect-specific SQL queries and analytical business insights seamlessly.
                    </p>
                  </div>

                  {/* Column 2: Target Users */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">
                      02. Target Users
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">Ideal Users</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        Data Analysts
                      </li>
                      <li className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        Business Analysts
                      </li>
                      <li className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        Students learning SQL
                      </li>
                      <li className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        BI & Analytics professionals
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Technologies */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">
                      03. Tech Stack
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">Infrastructure</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono">
                        Gemini Pro
                      </span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono">
                        Google AI Studio
                      </span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono">
                        React & Tailwind
                      </span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono">
                        Cloud Run
                      </span>
                    </div>
                  </div>

                  {/* Column 4: Capabilities */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">
                      04. Capabilities Setup
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">Functional Matrix</h3>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-700 font-medium">
                        ✓ SQL Generation
                      </li>
                      <li className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-700 font-medium">
                        ✓ SQL Explanation
                      </li>
                      <li className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-700 font-medium">
                        ✓ Business Insight Discovery
                      </li>
                      <li className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-700 font-medium">
                        ✓ Visualization Recommendations
                      </li>
                      <li className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-slate-700 font-medium">
                        ✓ Query Optimization Suggestions
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Primary Workspace Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT VIEW COLUMN: SCHEMA & QUESTION DESIGN CANVAS */}
        <section className={`${showHistory ? "lg:col-span-8" : "lg:col-span-6"} transition-all duration-300 xl:col-span-6 flex flex-col gap-6`}>
          
          {/* Database Setup Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg font-mono">
                  1
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Database Core Dialect</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">ANSI SQL Compliant</span>
            </div>

            {/* Dialect Switcher Pill Pack */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 justify-start">
              {dbDialects.map((dialect) => {
                const isActive = dbType === dialect;
                return (
                  <button
                    key={dialect}
                    onClick={() => {
                      setDbType(dialect);
                      showToast(`Switched query engine dialect output to ${dialect}`);
                    }}
                    className={`text-[11px] p-2 py-1.5 rounded-xl font-medium border transition-all cursor-pointer text-center ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {dialect.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Worksheets Hub */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Industry Mock Templates
              </h3>
              <span className="text-xs text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md font-medium">
                Instant Prototype Loading
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Click any blueprint schema loaded with typical relational metrics, constraints, and professional sample query prompts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCHEMA_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-left p-3.5 rounded-xl border transition-all hover:bg-slate-50 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md text-indigo-700 bg-indigo-50 uppercase tracking-wide block w-max mb-1.5">
                        {preset.dbType} Preset
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight mb-1">
                        {preset.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DDL & Raw Schema Editor */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col min-h-[240px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg font-mono">
                  2
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Database Schema / DDL</h3>
              </div>
              <button
                onClick={() => {
                  setSchema("");
                  setActivePresetId("");
                  showToast("Cleared schema text editor.");
                }}
                className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Schema
              </button>
            </div>

            <div className="relative flex-1 flex flex-col">
              <textarea
                value={schema}
                onChange={(e) => {
                  setSchema(e.target.value);
                  setActivePresetId("");
                }}
                placeholder="/* Paste your CREATE TABLE statements here... */

CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  spent_cents INT
);"
                className="w-full flex-1 min-h-[160px] p-4 text-xs font-mono bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-slate-600 leading-relaxed resize-none scrollbar-thin"
              />
              <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-600 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-0.5">
                SQL DDL Input
              </div>
            </div>
          </div>

          {/* Business Question & Command Deck */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg font-mono">
                3
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Business Objective Prompt</h3>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Explain the analytical perspective you desire in plain English. For cohort analytics, margins, ratios, or cumulative data, the AI will build the required SQL logic dynamically.
            </p>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Find active premium users ordering over $50 with a running cumulative sum of revenues..."
              className="w-full p-4.5 rounded-xl text-xs border border-slate-200 font-medium placeholder:text-slate-400 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-600 leading-relaxed min-h-[70px] resize-none"
            />

            {/* Quick-Prompt Suggestions Catalogue (Filtered relative to the chosen active template) */}
            {activePresetId && (
              <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                  Available Analyst Prompts for this Template:
                </span>
                <div className="flex flex-col gap-2.5">
                  {SCHEMA_PRESETS.find((p) => p.id === activePresetId)?.sampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q.question)}
                      className="text-left flex items-start gap-1.5 p-2 rounded-lg bg-white border border-slate-100 hover:border-indigo-400 transition-all cursor-pointer group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{q.question}</p>
                        <p className="text-[10.5px] text-slate-400 group-hover:text-slate-500 transition-colors">{q.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error state view */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <p className="leading-relaxed font-semibold">{error}</p>
              </div>
            )}

            {/* Primary Action Button Bar */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                Clear All
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !schema.trim() || !question.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Analyst Core Pipeline</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR COLUMN: QUERY HISTORY LOGS LEDGER */}
        {showHistory && (
          <section className="lg:col-span-4 xl:col-span-3 flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm h-full max-h-[800px] overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Saved Queries Log
              </h3>
              <button
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer flex items-center gap-0.5"
                title="Wipe historical records"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Database className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs font-semibold">No queries parsed yet</p>
                <p className="text-[10px] text-slate-400 max-w-[160px] leading-relaxed mt-1">
                  Run standard sql metrics on schemas. Queries saved here automatically.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[660px] pr-1.5 scrollbar-thin">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistorySelect(item)}
                    className="group border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 transition-all rounded-xl p-3 cursor-pointer block relative pr-6 text-left"
                  >
                    <span className="text-[9px] font-mono font-bold text-slate-400 block mb-1">
                      {item.timestamp}
                    </span>
                    <span className="inline-block text-[9px] px-1.5 py-0.5 font-bold uppercase bg-slate-200 text-slate-700 rounded-md font-mono mb-1.5">
                      {item.dbType}
                    </span>
                    <h4 className="text-[11.5px] font-bold text-slate-800 line-clamp-2 leading-relaxed mb-1">
                      {item.question}
                    </h4>
                    <p className="text-[10px] text-emerald-600 font-mono line-clamp-1" title={item.result.sql}>
                      {item.result.sql.slice(0, 40)}...
                    </p>

                    <button
                      onClick={(e) => handleHistoryRemove(item.id, e)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* RIGHT VIEW COLUMN: INTELLIGENT COMPREHENSIVE OUTPUTS SHEET */}
        <section className={`${showHistory ? "lg:col-span-12 xl:col-span-8" : "lg:col-span-6"} transition-all duration-300 xl:col-span-6 flex flex-col gap-6`}>
          
          {/* Empty / Loading / Done Core States Manager */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              // STEP ANIMATING LOADING PREVIEW
              <motion.div
                key="loading_canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-lg min-h-[500px]"
              >
                <div className="relative mb-6">
                  {/* Glowing core logo */}
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 animate-pulse relative z-10">
                    <Sparkles className="w-8 h-8 text-indigo-600 animate-spin-slow duration-1000" />
                  </div>
                  <div className="absolute -inset-2 bg-indigo-500/10 rounded-3xl blur-md animate-pulse" />
                </div>

                <h3 className="text-lg font-display font-medium text-slate-900 tracking-tight">
                  Running Advanced Core SQL Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mb-8 leading-relaxed">
                  Synthesizing business inputs, profiling relational constraints, and applying targeted dialect guidelines.
                </p>

                {/* Animated progress checks */}
                <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 text-left">
                  {loadingSteps.map((step, idx) => {
                    const isPassed = loadingStep > idx;
                    const isCurrent = loadingStep === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 transition-opacity duration-300 ${
                          isPassed || isCurrent ? "opacity-100" : "opacity-35"
                        }`}
                      >
                        <div className="mt-0.5 flex shrink-0">
                          {isPassed ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </div>
                          ) : isCurrent ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-none ${isCurrent ? "text-indigo-600" : "text-slate-800"}`}>
                            {step.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simple simulated progress stats */}
                <div className="mt-6 w-full max-w-md bg-indigo-50/50 rounded-xl p-3 flex justify-between items-center text-[11px] font-mono text-indigo-700 border border-indigo-100/40">
                  <span>Compilation: Active</span>
                  <span>Model: gemini-3.5-flash</span>
                  <span>Progress: {Math.min((loadingStep + 1) * 25, 95)}%</span>
                </div>
              </motion.div>
            ) : result ? (
              // DISPLAY DETAILED INTERACTIVE ANALYTICAL REPORTS INSIDE SEPARATED CARDS
              <motion.div
                key="results_canvas"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6 text-left"
              >
                {/* Result Section Header Banner */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        Query Assessment Complete
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Dialect Optimized: {dbType}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1 font-mono text-[10px] text-emerald-400 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                    100% Ready
                  </div>
                </div>

                {/* 1. SQL Query Card Code Playground */}
                <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800/80 px-5 py-3 text-slate-300 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <Code className="w-4 h-4 text-indigo-400" />
                      <span>1. Dialect-Optimized SQL Query</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(editedSql, "SQL Query")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 hover:text-white transition-all text-slate-300 font-semibold tracking-tight border border-slate-700 cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Sandboxed Textarea */}
                  <div className="p-4 bg-slate-950 relative">
                    <textarea
                      value={editedSql}
                      onChange={(e) => setEditedSql(e.target.value)}
                      className="w-full min-h-[190px] p-2 resize-y bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none border-0 block"
                      style={{ tabSize: 4 }}
                    />
                    <div className="text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-900 pt-2 flex justify-between items-center">
                      <span>✓ Sandbox Editor: Tweak your SQL commands dynamically prior to copying</span>
                      <span>Lines: {editedSql.split("\n").length}</span>
                    </div>
                  </div>
                </div>

                {/* 2. SQL Explanation Card (Logic Breakdown) */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg font-mono">
                        Logic
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        2. SQL Step-by-Step Explanation
                      </h4>
                    </div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-mono">
                      Metric Route
                    </span>
                  </div>

                  <div className="space-y-3">
                    {result.explanation.map((step, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                      >
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Business Insights Card */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg font-mono">
                        Insight
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        3. Business Insight & Implications
                      </h4>
                    </div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-mono">
                      Decisions
                    </span>
                  </div>

                  <div className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-emerald-100/50 bg-emerald-50/15 flex items-start gap-3 hover:bg-emerald-50/25 transition-all text-left"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Visualization Recommendation Card */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg font-mono">
                        Visual
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        4. Visualization Recommendation
                      </h4>
                    </div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-mono">
                      Charts & Tables
                    </span>
                  </div>

                  <InteractiveChart visualization={result.visualization} />
                </div>

                {/* 5. Optimization Suggestions Card */}
                <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold rounded-lg font-mono">
                        Index
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        5. Optimization Suggestions & Assumptions
                      </h4>
                    </div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-mono">
                      Performance
                    </span>
                  </div>

                  <div className="space-y-3">
                    {result.assumptions.map((ass, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-amber-100/50 bg-amber-50/10 flex items-start gap-3 hover:bg-amber-50/20 transition-all text-left"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {ass}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              // DEFAULT PORTFOLIO ONBOARDING SHOWCASE LAYOUT (NO QUERY EXECUTED YET)
              <motion.div
                key="onboarding_canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-150 p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[500px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shrink-0 shadow-xs animate-bounce duration-1000">
                  <Database className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                  Welcome to AI SQL Analyst Assistant.
                </h3>
                <p className="text-xs text-slate-500 mt-2.5 max-w-sm leading-relaxed">
                  Provide a database schema, select a SQL dialect, and describe your business question.
                </p>

                {/* Direct clean bullet features matching constraints */}
                <div className="mt-8 w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-150 pb-2">
                    The assistant will generate:
                  </p>
                  
                  <div className="flex items-start gap-2.5">
                    <span className="text-indigo-600 text-sm mt-0.5">•</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Production-quality SQL</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Optimized, ready-to-run database queries with appropriate logical JOIN indicators.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-indigo-600 text-sm mt-0.5">•</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Query explanations</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Granular structural walk-through detailing execution and CTE metrics.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-indigo-600 text-sm mt-0.5">•</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Business insights</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Actionable KPI recommendations and data analytics metric outcomes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-indigo-600 text-sm mt-0.5">•</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Visualization recommendations</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Recommended dashboards, active charts, and logical column mappings.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-indigo-600 text-sm mt-0.5">•</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Optimization suggestions</p>
                      <p className="text-[11px] text-slate-500 leading-normal">Indices, relational assumptions, and indexing targets to scale workload.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Corporate Professional Profile Footer Section */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Main profile column */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">AI SQL Analyst Assistant</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Designed and Developed by <span className="font-semibold text-slate-800">Nguyen Du My Ky</span>
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Business Information Systems Student</p>
              <p>Data Analytics Enthusiast</p>
              <p>Accounting Assistant</p>
            </div>
            
            {/* Social Placeholder Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com/myky14/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/myky14/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0077b5] hover:bg-[#006297] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Academic credit details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Academic Context</h4>
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">Google AI Agents Intensive Course</p>
              <p className="text-slate-500">Day 1 Applied Engineering Project Showcase.</p>
              <div className="mt-2 text-[11px] bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-500 leading-normal">
                This project showcases advanced prompt orchestration paradigms, interactive dashboard state reconciliation, and standardized code generation parameters optimized for recruiters.
              </div>
            </div>
          </div>

          {/* Core features list block */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Features Overview</h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>SQL Generation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Query Explanation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Business Insights</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Visualization Recommendations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom system credentials and specifications */}
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <p>Version 1.0 &bull; Built with Gemini, Google AI Studio, React, and Cloud Run</p>
          <div className="flex items-center gap-2 text-slate-350">
            <span>&copy; {new Date().getFullYear()} Nguyen Du My Ky. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
