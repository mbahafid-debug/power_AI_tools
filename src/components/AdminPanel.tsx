import React, { useState } from "react";
import { Tool, PublishResponse } from "../types";
import { 
  Plus, 
  Trash2, 
  Globe, 
  Send, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Layers,
  FileText,
  Activity
} from "lucide-react";

interface AdminPanelProps {
  currentTools: Tool[];
  onRefreshTools: () => void;
  onAddToolLocally: (newTool: Tool) => void;
}

const CATEGORY_OPTIONS = [
  "LLMs & Chatbots",
  "Development & Coding",
  "Design & Graphics",
  "Productivity & Research",
  "Audio & Speech",
  "Creative Tools"
];

export default function AdminPanel({
  currentTools,
  onRefreshTools,
  onAddToolLocally
}: AdminPanelProps) {
  // Scraping URL State
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatusLog, setScrapeStatusLog] = useState("");
  const [scrapeError, setScrapeError] = useState("");
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Scraped Draft Form State
  const [scrapedDraft, setScrapedDraft] = useState<Partial<Tool> | null>(null);
  
  // Custom Draft fields
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftCategory, setDraftCategory] = useState("LLMs & Chatbots");
  const [draftMicroSummary, setDraftMicroSummary] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftFeaturesText, setDraftFeaturesText] = useState(""); // newline separated
  const [draftProblemsText, setDraftProblemsText] = useState(""); // newline separated
  const [draftRequirements, setDraftRequirements] = useState("");
  const [draftOgImage, setDraftOgImage] = useState("");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<PublishResponse | null>(null);
  const [publishError, setPublishError] = useState("");

  // Deleting State tracker
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Administrative Scrape Action
  const handleScrapeAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;

    setIsScraping(true);
    setScrapeError("");
    setPublishSuccess(null);
    setScrapedDraft(null);
    setIsFallbackActive(false);

    // Dynamic logging indicators for excellent responsive design
    setScrapeStatusLog("Initiating page download...");
    setTimeout(() => setScrapeStatusLog("Reading meta tags & body source..."), 1200);
    setTimeout(() => setScrapeStatusLog("Passing extracted text content to Gemini Flash..."), 2800);
    setTimeout(() => setScrapeStatusLog("Google Search groundings checking current tool records..."), 4500);

    try {
      const res = await fetch("/api/tools/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze link. Please check if server process is running.");
      }

      const analyzed = data.tool;
      setScrapedDraft(analyzed);
      setIsFallbackActive(!!data.fallbackActive);
      
      // Load parsed values directly to editable draft fields
      setDraftName(analyzed.name || "");
      setDraftUrl(analyzed.url || scrapeUrl.trim());
      setDraftCategory(analyzed.category || "LLMs & Chatbots");
      setDraftMicroSummary(analyzed.microSummary || "");
      setDraftDescription(analyzed.description || "");
      setDraftFeaturesText(analyzed.features?.join("\n") || "");
      setDraftProblemsText(analyzed.solvedProblems?.join("\n") || "");
      setDraftRequirements(analyzed.systemRequirements || "");
      setDraftOgImage(analyzed.ogImage || "");

      // Clear scraper input upon completion
      setScrapeUrl("");

    } catch (err: any) {
      setScrapeError(err.message || "An exception occurred inside the scraping middleware.");
    } finally {
      setIsScraping(false);
      setScrapeStatusLog("");
    }
  };

  // Administrative Publish Action
  const handlePublish = async () => {
    if (!draftName.trim() || !draftUrl.trim() || !draftMicroSummary.trim()) {
      setPublishError("Name, Resource URL, and Micro-Summary are mandatory fields.");
      return;
    }

    setIsPublishing(true);
    setPublishError("");
    setPublishSuccess(null);

    const compiledToolPayload = {
      name: draftName,
      url: draftUrl,
      category: draftCategory,
      microSummary: draftMicroSummary,
      description: draftDescription,
      features: draftFeaturesText.split("\n").map(f => f.trim()).filter(Boolean),
      solvedProblems: draftProblemsText.split("\n").map(p => p.trim()).filter(Boolean),
      systemRequirements: draftRequirements,
      ogImage: draftOgImage
    };

    try {
      const res = await fetch("/api/tools/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: compiledToolPayload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Execution failed publishing resource.");
      }

      setPublishSuccess(data);
      if (data.tool) {
        onAddToolLocally(data.tool);
      }
      onRefreshTools();
      setScrapedDraft(null); // Clear active card review draft

    } catch (err: any) {
      setPublishError(err.message || "Failed to catalog curated tool.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Administrative Delete Custom Catalog Item
  const handleDeleteTool = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this tool from the directory?")) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        onRefreshTools();
      } else {
        alert(data.error || "Failed to remove item.");
      }
    } catch (err: any) {
      alert("Error invoking delete pipeline: " + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div>
        <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Curator Control Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Scrape modern sites or social channels. Gemini will leverage crawling and search grounding to auto-compile accurate micro-summaries.
        </p>
      </div>

      {/* URL Scraping Feed Form */}
      <form onSubmit={handleScrapeAndAnalyze} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
            Feed URL Link (Facebook, Instagram, GitHub, or Website)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Globe className="w-4 h-4" />
              </span>
              <input
                type="url"
                required
                placeholder="e.g. https://github.com/google-gemini/gemini-api, https://facebook.com/..."
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                disabled={isScraping}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-slate-100 text-sm outline-none transition duration-150"
              />
            </div>
            
            <button
              type="submit"
              disabled={isScraping || !scrapeUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold rounded-lg text-sm transition duration-150 cursor-pointer shadow-md shadow-cyan-950/20"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950" />
                  Analyze URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Status indicators */}
        {isScraping && (
          <div className="bg-slate-900/60 rounded-lg border border-slate-800/40 p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-cyan-400 font-medium tracking-wide">
                GEMINI LIVE EXTRACTION:
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono animate-pulse pl-6">
              {scrapeStatusLog}
            </p>
          </div>
        )}

        {/* Extraction Fault Feedback */}
        {scrapeError && (
          <div className="flex items-start gap-2.5 bg-red-950/20 font-mono text-red-400 p-4 rounded-lg border border-red-500/20 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Analysis Halted</p>
              <p className="mt-1 text-red-400/90 leading-relaxed">{scrapeError}</p>
            </div>
          </div>
        )}
      </form>

      {/* Editing / Curation confirmation area */}
      {scrapedDraft && (
        <div className="mt-6 border border-slate-700 bg-slate-900/50 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-md font-sans font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400 animate-pulse" />
              Pending Review Draft
            </h3>
            <button
              onClick={() => setScrapedDraft(null)}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Discard Draft
            </button>
          </div>

          {isFallbackActive && (
            <div className="bg-amber-950/20 text-amber-300 px-4 py-3.5 rounded-lg border border-amber-500/20 text-xs font-sans leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Gemini API Sandbox Limit Auto-Failover Enabled
              </p>
              <p className="text-slate-300">
                A sandbox rate limit or Gemini quota check (429 Request Volume Limit) was triggered. The curation engine successfully bipassed the stop by switching dynamically to high-accuracy local metadata extraction! Feel free to polish and verify the drafted properties below, then hit Publish.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Tool Name</label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Official resource link</label>
              <input
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Category Classification</label>
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Est. System Requirements</label>
              <input
                type="text"
                value={draftRequirements}
                onChange={(e) => setDraftRequirements(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Micro-Summary (Ideal: Under 50 Words)</label>
              <input
                type="text"
                value={draftMicroSummary}
                onChange={(e) => setDraftMicroSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Full Curator Narrative / description</label>
              <textarea
                rows={3}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">Key Features (One feature per line)</label>
              <textarea
                rows={3}
                value={draftFeaturesText}
                onChange={(e) => setDraftFeaturesText(e.target.value)}
                placeholder="Feature A&#10;Feature B"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">Problems Solved (One problem per line)</label>
              <textarea
                rows={3}
                value={draftProblemsText}
                onChange={(e) => setDraftProblemsText(e.target.value)}
                placeholder="Pain point 1&#10;Pain point 2"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Card background photo / OG:image</label>
              <input
                type="text"
                value={draftOgImage}
                onChange={(e) => setDraftOgImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
              />
            </div>
          </div>

          {publishError && (
            <p className="text-xs text-red-400 font-mono mt-2">{publishError}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setScrapedDraft(null)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow transition cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3 animate-spin text-white" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-3 text-white" />
                  Publish To Directory
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Directory publishing results & Telegram indicators */}
      {publishSuccess && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Curated Tool cataloged successfully!
          </div>
          <div className="space-y-1.5 border-t border-slate-800 pt-3 text-slate-300 leading-normal">
            <p>📁 Tool ID: <span className="text-cyan-400">{publishSuccess.tool?.id}</span></p>
            <p>🌐 Destination URL: <span className="text-slate-400 text-xs select-all">{publishSuccess.tool?.url}</span></p>
            
            {publishSuccess.telegramSent ? (
               <p className="text-emerald-400 mt-2 font-semibold flex items-center gap-1.5">
                 <CheckCircle2 className="w-3.5 h-3.5" /> Telegram Broadcast Dispatched Live
               </p>
            ) : publishSuccess.telegramError ? (
               <p className="text-red-400 mt-2 font-semibold">
                 ⚠️ Telegram Broadcast issue: {publishSuccess.telegramError}
               </p>
            ) : (
               <p className="text-slate-500 mt-2 flex items-center gap-1.5">
                 <Info className="w-3.5 h-3.5" /> Telegram API bypassed (Bot credentials are not set in Secrets).
               </p>
            )}
          </div>
        </div>
      )}

      {/* Existing Tools Directory Curation list */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <h3 className="text-sm font-mono font-medium text-slate-300 uppercase tracking-wider mb-4">
          Current curation folder ({currentTools.length} total)
        </h3>
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 text-sm">
          {currentTools.map(tool => (
            <div 
              key={tool.id} 
              className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 hover:border-slate-800 rounded-md transition"
            >
              <div className="min-w-0 pr-4">
                <p className="font-semibold text-slate-200 truncate">{tool.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{tool.url}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> {tool.clicks}
                </span>

                <button
                  disabled={isDeletingId === tool.id}
                  onClick={() => handleDeleteTool(tool.id)}
                  title="Remove tool from application"
                  className="p-1.5 bg-slate-950 text-slate-500 hover:bg-red-950 hover:text-red-400 border border-slate-800 rounded transition outline-none"
                >
                  {isDeletingId === tool.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
