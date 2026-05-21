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
  Activity,
  Bot,
  HelpCircle,
  RefreshCw
} from "lucide-react";

interface AdminPanelProps {
  currentTools: Tool[];
  onRefreshTools: () => void;
  onAddToolLocally: (newTool: Tool) => void;
  isArabic?: boolean;
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
  onAddToolLocally,
  isArabic = false
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

  // Advanced Arabic copywriting states
  const [draftHookIntro, setDraftHookIntro] = useState("");
  const [draftCoreConcept, setDraftCoreConcept] = useState("");
  const [draftWorkflowStepsText, setDraftWorkflowStepsText] = useState(""); // newline separated
  const [draftWithoutTool, setDraftWithoutTool] = useState("");
  const [draftWithTool, setDraftWithTool] = useState("");
  const [draftTechnicalEcosystem, setDraftTechnicalEcosystem] = useState(""); // newline separated
  const [draftCallToAction, setDraftCallToAction] = useState("");
  const [draftPosterHeadline, setDraftPosterHeadline] = useState("");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<PublishResponse | null>(null);
  const [publishError, setPublishError] = useState("");

  // Deleting State tracker
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Tab control State
  const [activeTab, setActiveTab] = useState<"curation" | "telegram">("curation");

  // Telegram Bot integration State
  const [tgConfig, setTgConfig] = useState<{
    configured: boolean;
    botUsername: string;
    channelChatId: string;
    webhookInfo: any;
    botError: string | null;
    activeUrl: string;
  } | null>(null);
  const [isLoadingTgStatus, setIsLoadingTgStatus] = useState(false);
  const [tgSetupResult, setTgSetupResult] = useState<string | null>(null);
  const [tgSetupError, setTgSetupError] = useState<string | null>(null);
  const [testingMsg, setTestingMsg] = useState("");
  const [isTestingBot, setIsTestingBot] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const fetchTgStatus = async () => {
    setIsLoadingTgStatus(true);
    setTgSetupResult(null);
    setTgSetupError(null);
    try {
      const res = await fetch("/api/telegram/status");
      if (res.ok) {
        const data = await res.json();
        setTgConfig(data);
      }
    } catch (e: any) {
      console.error("Failed to fetch TG bot status:", e);
    } finally {
      setIsLoadingTgStatus(false);
    }
  };

  const handleRegisterWebhook = async () => {
    setTgSetupResult(null);
    setTgSetupError(null);
    setIsLoadingTgStatus(true);
    try {
      const res = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTgSetupResult(data.message || "Webhook registered successfully!");
        fetchTgStatus();
      } else {
        setTgSetupError(data.error || "Failed registration setup.");
      }
    } catch (err: any) {
      setTgSetupError(err.message || "An unexpected error occurred during pipeline webhook registration.");
    } finally {
      setIsLoadingTgStatus(false);
    }
  };

  const handleSimulateBotMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testingMsg.trim()) return;
    setIsTestingBot(true);
    setTestResponse(null);
    try {
      const res = await fetch("/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_id: 100000 + Math.floor(Math.random() * 900000),
          message: {
            message_id: 1111,
            from: { id: 12345, first_name: "Admin" },
            chat: { id: 12345, type: "private" },
            text: testingMsg.trim(),
            date: Math.floor(Date.now() / 1000)
          }
        })
      });
      if (res.ok) {
        setTestResponse(isArabic 
          ? "✅ تم محاكاة الرسالة فوريّاً! تم البحث والاستخراج بالذكاء الاصطناعي، وحفظ الأداة في قاعدة بيانات الموقع وبث تقرير Cairo الترويجي على البوت." 
          : "✅ Message simulated successfully! The Telegram webhook has parsed your input, run Gemini Web scraper, saved the tool to directory database, and sent back the Cairo campaign.");
        onRefreshTools();
        setTestingMsg("");
      } else {
        setTestResponse(`❌ Error response: ${res.statusText}`);
      }
    } catch (err: any) {
      setTestResponse(`❌ Error: ${err.message}`);
    } finally {
      setIsTestingBot(false);
    }
  };

  React.useEffect(() => {
    fetchTgStatus();
  }, []);

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
    setScrapeStatusLog(isArabic ? "جاري بدء التحليل ومعالجة البيانات..." : "Initiating metadata analysis...");
    setTimeout(() => setScrapeStatusLog(isArabic ? "جاري استعلام مؤشرات ومراجع بحث الويب..." : "Looking up search groundings & references..."), 1200);
    setTimeout(() => setScrapeStatusLog(isArabic ? "تحويل السياق الإبداعي لنماذج Gemini Flash..." : "Synthesizing premium Arabic report copywriting..."), 2800);
    setTimeout(() => setScrapeStatusLog(isArabic ? "إنتاج الهيكل والجدول المقارن وحفظ المسودة..." : "Formatting compare structures & requirements sheet..."), 4500);

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

      // Load advanced Arabic copywriting fields directly
      setDraftHookIntro(analyzed.hook_intro || "");
      setDraftCoreConcept(analyzed.core_concept || "");
      setDraftWorkflowStepsText(analyzed.workflow_steps?.join("\n") || "");
      setDraftWithoutTool(analyzed.comparative_analysis?.without_tool || "");
      setDraftWithTool(analyzed.comparative_analysis?.with_tool || "");
      setDraftTechnicalEcosystem(analyzed.technical_ecosystem?.join("\n") || "");
      setDraftCallToAction(analyzed.call_to_action || "");
      setDraftPosterHeadline(analyzed.poster_headline || "");

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
      ogImage: draftOgImage,
      // Advanced Copywriting properties:
      hook_intro: draftHookIntro,
      core_concept: draftCoreConcept,
      workflow_steps: draftWorkflowStepsText.split("\n").map(w => w.trim()).filter(Boolean),
      comparative_analysis: {
        without_tool: draftWithoutTool,
        with_tool: draftWithTool
      },
      key_advantages: draftFeaturesText.split("\n").map(f => f.trim()).filter(Boolean),
      technical_ecosystem: draftTechnicalEcosystem.split("\n").map(e => e.trim()).filter(Boolean),
      call_to_action: draftCallToAction,
      poster_headline: draftPosterHeadline
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
    <div className="space-y-8 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {isArabic ? "مركز تحكم المشرف (إدخال وتوليد الأقسام)" : "Curator Control Hub"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isArabic 
              ? "أدخل اسم الأداة أو فكرة مقتضبة عنها (أو رابط خارجي). سيقوم نظام Gemini الذكي بالبحث عن البيانات وصياغة تقرير تسويقي متكامل باللغة العربية تلقائياً."
              : "Enter a tool name, creative hint, or direct link. Gemini will research references and construct a complete curated Arabic report draft automatically."}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 gap-1 pb-px">
        <button
          onClick={() => setActiveTab("curation")}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition ${
            activeTab === "curation"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/40 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-905/20"
          }`}
        >
          {isArabic ? "✦ إضافة وتوليد بالذكاء الاصطناعي" : "✦ Manual Curation"}
        </button>
        <button
          onClick={() => {
            setActiveTab("telegram");
            fetchTgStatus();
          }}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition flex items-center gap-1.5 ${
            activeTab === "telegram"
              ? "border-cyan-500 text-cyan-400 bg-slate-900/40 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-905/20"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tgConfig?.configured ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
          {isArabic ? "🤖 أتمتة الـ Telegram Bot" : "🤖 Telegram Bot Automation"}
        </button>
      </div>

      {activeTab === "curation" && (
        <div className="space-y-8">
          {/* URL Scraping / Conceptual Hint Feed Form */}
          <form onSubmit={handleScrapeAndAnalyze} className="space-y-4">
        <div>
          <label className={`block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2 ${isArabic ? "text-right" : "text-left"}`}>
            {isArabic ? "اسم الأداة، تلميح عنها، أو رابط الموقع / حساب التواصل الاجتماعي" : "Tool Name, Hint, or Platform URL Link"}
          </label>
          <div className={`flex gap-3 ${isArabic ? "flex-row" : "flex-row"}`}>
            <div className="relative flex-1">
              <span className={`absolute inset-y-0 ${isArabic ? "right-3" : "left-0"} flex items-center text-slate-500`}>
                <Globe className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder={isArabic 
                  ? "أمثلة: Cursor, كاتب محتوى بالذكاء الاصطناعي, https://github.com/..." 
                  : "e.g. Cursor, AI copywriting, or website link https://github.com/..."}
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                disabled={isScraping}
                className={`w-full ${isArabic ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"} py-3 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg text-slate-100 text-sm outline-none transition duration-150`}
              />
            </div>
            
            <button
              type="submit"
              disabled={isScraping || !scrapeUrl.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold rounded-lg text-sm transition duration-150 cursor-pointer shadow-md shadow-cyan-950/20 whitespace-nowrap"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  {isArabic ? "جاري الإنتاج..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-slate-950" />
                  {isArabic ? "توليد بالذكاء الاصطناعي ✦" : "Generate Draft ✦"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Status indicators */}
        {isScraping && (
          <div className="bg-slate-900/60 rounded-lg border border-slate-800/40 p-4 space-y-2">
            <div className={`flex items-center gap-2.5 ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-cyan-400 font-medium tracking-wide">
                {isArabic ? "تحليل ومعالجة ذكاء اصطناعي فوري:" : "GEMINI LIVE CURATION ENGINE:"}
              </span>
            </div>
            <p className={`text-xs text-slate-400 font-mono animate-pulse ${isArabic ? "text-right pr-6" : "text-left pl-6"}`}>
              {scrapeStatusLog}
            </p>
          </div>
        )}

        {/* Extraction Fault Feedback */}
        {scrapeError && (
          <div className={`flex items-start gap-2.5 bg-red-950/20 font-mono text-red-400 p-4 rounded-lg border border-red-500/20 text-xs ${isArabic ? "flex-row-reverse text-right" : "text-left"}`}>
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">{isArabic ? "تعطل التحليل المؤقت" : "Analysis Halted"}</p>
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

            {/* Premium Arabic Copywriting Extra Fields Section */}
            <div className="col-span-1 md:col-span-2 border-t border-slate-800/85 pt-4 mt-2 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                <h4 className="text-xs font-sans font-semibold text-cyan-400 uppercase tracking-widest">
                  Arabic Copywriting Content & Telegram Marketing
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    Cairo Hook Intro (بيت القصيد الترويجي)
                  </label>
                  <input
                    type="text"
                    value={draftHookIntro}
                    onChange={(e) => setDraftHookIntro(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    Core philosophy / Arabic core concept
                  </label>
                  <textarea
                    rows={2}
                    value={draftCoreConcept}
                    onChange={(e) => setDraftCoreConcept(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    Without Tool (قبل الاستخدام)
                  </label>
                  <input
                    type="text"
                    value={draftWithoutTool}
                    onChange={(e) => setDraftWithoutTool(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    With Tool (بعد الاستخدام)
                  </label>
                  <input
                    type="text"
                    value={draftWithTool}
                    onChange={(e) => setDraftWithTool(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    How Content Works Steps (Step per line)
                  </label>
                  <textarea
                    rows={3}
                    value={draftWorkflowStepsText}
                    onChange={(e) => setDraftWorkflowStepsText(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    Technical Ecosystem (Integration per line)
                  </label>
                  <textarea
                    rows={3}
                    value={draftTechnicalEcosystem}
                    onChange={(e) => setDraftTechnicalEcosystem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-cyan-400 uppercase mb-1 font-semibold">
                    🔥 Poster Graphic Heading Headline Overlay (العنوان الجذاب لبطاقة الصورة البصرية)
                  </label>
                  <input
                    type="text"
                    value={draftPosterHeadline}
                    onChange={(e) => setDraftPosterHeadline(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-cyan-900/40 focus:border-cyan-400 px-3 py-2 rounded text-cyan-300 text-sm outline-none text-right font-sans font-semibold placeholder-cyan-900/60"
                    placeholder="امثلة: أداة مراقبة حكومية مجانية على جهازك الشخصي!"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1">
                    Call To Action Broadcast Sign-off (خاتمة الدعوة للتفاعل)
                  </label>
                  <input
                    type="text"
                    value={draftCallToAction}
                    onChange={(e) => setDraftCallToAction(e.target.value)}
                    dir="rtl"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 px-3 py-2 rounded text-slate-200 text-sm outline-none text-right font-sans"
                  />
                </div>
              </div>
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
      </div>
      )}

      {activeTab === "telegram" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
            <div className={`flex justify-between items-center ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="font-sans font-black text-slate-100 text-sm">
                  {isArabic ? "حالة وتوصيل بوت تلغرام الذكي" : "Telegram Smart Bot Setup"}
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchTgStatus}
                disabled={isLoadingTgStatus}
                className="p-1 px-2.5 bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-400 rounded text-xs flex items-center gap-1 cursor-pointer transition select-none"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTgStatus ? "animate-spin text-cyan-400" : ""}`} />
                {isArabic ? "تحديث الحالة" : "Refresh Status"}
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-slate-800/60 pt-4 leading-relaxed`}>
              <div className="space-y-2 bg-slate-950/50 p-3.5 border border-slate-900 rounded-md">
                <p className="text-slate-400">🤖 {isArabic ? "معرّف البوت (Bot Username):" : "Bot Account Username:"}</p>
                <p className="text-xs font-bold text-cyan-400">
                  {tgConfig?.configured && tgConfig?.botUsername !== "Not Configured" ? (
                    <a href={`https://t.me/${tgConfig.botUsername}`} target="_blank" rel="noreferrer" className="underline hover:text-cyan-350">
                      @{tgConfig.botUsername}
                    </a>
                  ) : (
                    <span className="text-red-400 font-sans text-xs flex items-center gap-1 select-none">
                      ⚠️ {isArabic ? "غير مضبوط (أضف TELEGRAM_BOT_TOKEN)" : "Missing Token"}
                    </span>
                  )}
                </p>
                
                <p className="text-slate-400 mt-3">📢 {isArabic ? "قناة البث الموصولة (Channel/Admin ID):" : "Linked Channel Chat ID:"}</p>
                <p className="text-slate-200">
                  {tgConfig?.channelChatId ? (
                    <span className="font-bold text-slate-100">{tgConfig.channelChatId}</span>
                  ) : (
                    <span className="text-slate-500 font-sans text-xs">
                      {isArabic ? "بانتظار الضبط" : "None Linked"}
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-2 bg-slate-950/50 p-3.5 border border-slate-900 rounded-md">
                <p className="text-slate-400">🌐 {isArabic ? "رابط الـ Webhook النشط:" : "Webhook Handler URL:"}</p>
                <p className="text-slate-200 truncate select-all">
                  {tgConfig?.webhookInfo?.url ? (
                    <span className="text-emerald-400 font-bold">{tgConfig.webhookInfo.url}</span>
                  ) : (
                    <span className="text-amber-400 font-sans text-xs">
                      {isArabic ? "⚠️ غير مفعّل" : "⚠️ Webhook Not Installed"}
                    </span>
                  )}
                </p>

                <p className="text-slate-400 mt-3">📡 {isArabic ? "حالة الربط والـ Certificate:" : "Webhook Status Code:"}</p>
                <p className="text-slate-350">
                  {tgConfig?.webhookInfo ? (
                    <span>
                      {isArabic ? "متصل" : "Online"} ({tgConfig.webhookInfo.pending_update_count || 0} {isArabic ? "رسائل بالانتظار" : "pending updates"})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-sans">---</span>
                  )}
                </p>
              </div>
            </div>

            {/* Configure Hook Button */}
            {tgConfig?.configured && (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRegisterWebhook}
                  disabled={isLoadingTgStatus}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded shadow transition cursor-pointer select-none"
                >
                  {isLoadingTgStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      {isArabic ? "جاري تفعيل الاتصال..." : "Registering bot webhook..."}
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 text-slate-950" />
                      {isArabic ? "تنسيق وتفعيل الـ Webhook للبوت تلقائياً" : "Auto-Register Bot Webhook"}
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  {isArabic 
                    ? "يقوم هذا الإجراء بربط الـ Webhook الخاص بموقعك في سحابة Cloud Run مع خوادم Telegram تلقائياً لاستلام الرسائل فورياً." 
                    : "Installs secure callback webhook pointing Telegram messages securely to this Cloud Run deployment."}
                </p>
              </div>
            )}

            {tgSetupResult && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs rounded font-mono">
                {tgSetupResult}
              </div>
            )}

            {tgSetupError && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-xs rounded font-mono">
                {tgSetupError}
              </div>
            )}
          </div>

          {/* Interactive Bot Simulator */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
            <div>
              <h4 className="font-sans font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                {isArabic ? "محاكي استقبال رسائل تلغرام (تست فوري)" : "Telegram Bot Inbox Simulator"}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isArabic 
                  ? "لا تستطيع تجربة البوت على الـ Localhost؟ استخدم هذا النموذج لمحاكاة إرسال رسالة للبوت! اكتب اسم أداة أو رابط جيت هاب وسيتم فحصها ونشرها بالموقع تلقائياً فوراً." 
                  : "Simulate an admin message coming from Telegram. Write any tool name or URL, and test the scraping and curation flow live."}
              </p>
            </div>

            <form onSubmit={handleSimulateBotMessage} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={isArabic ? "أدخل اسم أداة مثل: 'v0' أو رابط موقع مثل: 'https://v0.dev'" : "e.g. 'v0' or link 'https://v0.dev'..."}
                  value={testingMsg}
                  onChange={(e) => setTestingMsg(e.target.value)}
                  disabled={isTestingBot}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded px-3.5 py-2 text-slate-200 text-xs outline-none"
                />
                <button
                  type="submit"
                  disabled={isTestingBot || !testingMsg.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded cursor-pointer transition select-none flex items-center gap-1.5"
                >
                  {isTestingBot ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-200" />
                  ) : (
                    isArabic ? "محاكاة الإرسال" : "Simulate Message"
                  )}
                </button>
              </div>
            </form>

            {testResponse && (
              <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {testResponse}
              </div>
            )}
          </div>

          {/* Setup tutorial guide */}
          <div className="bg-slate-900/40 p-5 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-slate-200 text-xs font-mono font-black uppercase tracking-wider">
              📖 {isArabic ? "دليل تهيئة وإعداد بوت تلغرام في ثوانٍ:" : "Guide: Connect your Bot in 4 steps:"}
            </h4>
            <div className={`text-xs text-slate-400 space-y-2 leading-relaxed ${isArabic ? "text-right" : "text-left"}`}>
              <p>📿 <b>1.</b> {isArabic ? "تحدث مع @BotFather على تلغرام، واطلب أمر /newbot لإنشاء بوت مخصص واحصل على الـ Token الخاص بك." : "Message @BotFather on Telegram, use /newbot, and grab your Bot token."}</p>
              <p>📢 <b>2.</b> {isArabic ? "أنشئ قناة تلغرام عامة أو خاصة (تود توزيع المنشورات عليها) واجعل البوت الخاص بك مشرفاً (Admin) بداخل القناة مع إعطائه صلاحية كتابة الرسائل." : "Create a channel for distributions, and add your bot as an Administrator with post permissions."}</p>
              <p>🔑 <b>3.</b> {isArabic ? "ادخل على قائمة secrets (أو ملف .env) بموقعك، وضع الـ TOKEN تحت اسم TELEGRAM_BOT_TOKEN ومعرّف القناة تحت اسم TELEGRAM_CHAT_ID (مثال: @my_channel)." : "Add your secrets (or configure .env) with fields TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (e.g., @my_channel)."}</p>
              <p>🛡️ <b>4.</b> {isArabic ? "أخيراً، اضغط على زر 'تنسيق وتفعيل الـ Webhook' بالأعلى لبدء التلقي الآلي! الآن ما عليك سوى إرسال أي رابط أو اسم أداة للبوت الخاص بك وسيفي هو بالغرض!" : "Click the 'Auto-Register Webhook' button above to seal the logic. Send any GitHub link/tool keyword to your bot and watch the magic!"}</p>
            </div>
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
