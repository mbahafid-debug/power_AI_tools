import { Tool } from '../types';
import { 
  X, 
  ExternalLink, 
  Check, 
  Wrench, 
  HelpCircle, 
  Compass, 
  Zap, 
  History,
  Sparkles,
  Cpu,
  ArrowRightLeft,
  ShieldCheck,
  Sliders
} from 'lucide-react';

interface ToolDetailModalProps {
  tool: Tool;
  onClose: () => void;
  onRegisterClick: (id: string) => void;
  isArabic?: boolean;
}

const CATEGORY_ARABIC_MAP: Record<string, string> = {
  "LLMs & Chatbots": "نماذج اللغات والمحادثة",
  "Development & Coding": "التطوير والبرمجة",
  "Design & Graphics": "التصميم والغرافيكس",
  "Productivity & Research": "الإنتاجية والأبحاث",
  "Audio & Speech": "توليد الصوت والكلام",
  "Creative Tools": "الأدوات الإبداعية"
};

export default function ToolDetailModal({ tool, onClose, onRegisterClick, isArabic = false }: ToolDetailModalProps) {
  
  const handleOutboundRedirect = () => {
    onRegisterClick(tool.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div 
        dir={isArabic ? "rtl" : "ltr"}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]"
      >
        {/* Visual Hero Block */}
        <div className="relative h-48 w-full bg-slate-950 flex-shrink-0">
          <img 
            src={tool.ogImage} 
            alt={tool.name}
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          
          {/* Close button - adjusted to opposite side dynamically */}
          <button 
            onClick={onClose}
            className={`absolute top-4 ${isArabic ? "left-4" : "right-4"} p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition outline-none`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core metadata overlay */}
          <div className={`absolute bottom-4 left-5 right-5 ${isArabic ? "text-right" : "text-left"}`}>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/20">
              {isArabic ? (CATEGORY_ARABIC_MAP[tool.category] || tool.category) : tool.category}
            </span>
            <h2 className="text-2xl font-sans font-extrabold text-white mt-2 tracking-tight">
              {tool.name}
            </h2>
          </div>
        </div>

        {/* Scrollable details body */}
        <div className={`p-6 overflow-y-auto space-y-6 flex-1 ${isArabic ? "text-right" : "text-left"}`}>
          
          {/* RENDER MODE A: Advanced Arabic Copywriter Report Mode (If fields available and Arabic is selected) */}
          {isArabic && tool.hook_intro ? (
            <div className="space-y-6">
              
              {/* Marketing Poster Graphics card display matching the references */}
              {tool.poster_headline && (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-xl bg-slate-950 aspect-[16/10] flex flex-col justify-between p-6">
                  {/* Visual Background Pattern/Image */}
                  <div className="absolute inset-0">
                    <img
                      src={tool.ogImage}
                      alt="poster bg"
                      className="w-full h-full object-cover opacity-20 blur-[1px]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
                  </div>
                  
                  {/* Top bar */}
                  <div className="relative flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">CURATED AI DIRECTORY</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-400/30">
                      {CATEGORY_ARABIC_MAP[tool.category] || tool.category}
                    </span>
                  </div>

                  {/* Centered Graphic Statement Box */}
                  <div className="relative text-center space-y-3 z-10 px-2 my-auto">
                    <div className="inline-block text-[11px] font-mono text-cyan-400/95 uppercase bg-cyan-950/45 px-2.5 py-0.5 rounded-full border border-cyan-500/10">
                      ★ أداة اليوم المختارة ★
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 leading-normal tracking-tight">
                      {tool.poster_headline}
                    </h3>
                  </div>

                  {/* Bottom info */}
                  <div className="relative flex justify-between items-center border-t border-slate-900/80 pt-3 text-[10px] font-mono text-slate-500 z-10">
                    <span className="font-sans font-bold text-slate-200">{tool.name}</span>
                    <span className="text-cyan-500/80 lowercase">{tool.url.replace("https://", "").replace("http://", "").split("/")[0]}</span>
                  </div>
                </div>
              )}

              {/* Hook Callout intro */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <blockquote className="text-sm sm:text-base font-sans font-bold text-cyan-300 leading-relaxed italic">
                  " {tool.hook_intro} "
                </blockquote>
              </div>

              {/* Core Philosophy Paragraph */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> {"الفلسفة والجوهر الابتكاري للأداة"}
                </h4>
                <p className="text-sm font-sans text-slate-100 leading-relaxed">
                  {tool.core_concept || tool.description}
                </p>
              </div>

              {/* Operational Workflow Steps */}
              {tool.workflow_steps && tool.workflow_steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> {"كيفية العمل ومراحل الأداء"}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {tool.workflow_steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-center p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-800 hover:bg-slate-950/80 transition duration-150">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400/20 flex items-center justify-center font-mono text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparative Split cards A/B */}
              {tool.comparative_analysis && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> {"مقارنة التحول الهندسي في العمل"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Without tool */}
                    <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {"من دون الأداة (العمل التقليدي)"}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                        {tool.comparative_analysis.without_tool}
                      </p>
                    </div>

                    {/* With tool */}
                    <div className="p-4 rounded-xl bg-cyan-950/10 border border-cyan-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        {"باستخدام الأداة (التحول الذكي)"}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                        {tool.comparative_analysis.with_tool}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unique Key Advantages bullet list */}
              {tool.key_advantages && tool.key_advantages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> {"مكامن التفوق ونقاط التميز"}
                  </h4>
                  <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-slate-300">
                    {tool.key_advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-2 px-3 rounded-lg bg-slate-950/30 border border-slate-800/50">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="font-sans leading-relaxed">{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supported Tech Ecosystem & Integrations */}
              {tool.technical_ecosystem && tool.technical_ecosystem.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" /> {"عناصر التكامل والنظام الساند البنائي"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.technical_ecosystem.map((sys, i) => (
                      <span key={i} className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md bg-slate-950 text-cyan-400 border border-slate-800">
                        ◆ {sys}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Arabic Call To Action sign-off message */}
              {tool.call_to_action && (
                <div className="pt-2 text-center text-xs sm:text-sm font-sans font-medium text-cyan-400/80">
                  <p className="border-t border-slate-800/60 pt-4 italic">
                    {tool.call_to_action}
                  </p>
                </div>
              )}

            </div>
          ) : (
            
            /* RENDER MODE B: Legacy Standard Bilingual Curation View (Fallbacks) */
            <>
              {/* Micro Summary & Full Description */}
              <div className="space-y-3">
                <p className="text-sm font-sans font-semibold text-slate-200 leading-relaxed border-l-2 border-cyan-500 pl-3">
                  {tool.microSummary}
                </p>
                <p className="text-sm font-sans text-slate-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Features section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> {isArabic ? "المميزات والقدرات الرئيسية" : "Key Features"}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    {tool.features && tool.features.length > 0 ? (
                      tool.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-600 font-mono text-xs">{isArabic ? "تطبق مزايا التقييم القياسية." : "Standard curation features apply."}</li>
                    )}
                  </ul>
                </div>

                {/* Solved Problems Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> {isArabic ? "مشكلات تحلها الأداة" : "Solved Problems"}
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-400">
                    {tool.solvedProblems && tool.solvedProblems.length > 0 ? (
                      tool.solvedProblems.map((problem, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Compass className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                          <span>{problem}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-600 font-mono text-xs">{isArabic ? "تصلح لتبسيط سير العمل الاعتيادي." : "Standard optimization problems."}</li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* System Requirements Banner */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Wrench className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{isArabic ? "متطلبات التشغيل:" : "Requirements:"} <strong className="text-slate-400 font-sans">{tool.systemRequirements}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <History className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{isArabic ? "تاريخ النشر:" : "Cataloged:"} <strong className="text-slate-400 font-sans">{new Date(tool.createdAt).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Action redirect button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            {tool.clicks || 0} {isArabic ? "زيارة مسجلة" : "visits logged"}
          </span>

          <a 
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOutboundRedirect}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm rounded-lg shadow-md transition outline-none"
          >
            {isArabic ? "زيارة الرابط والمصدر الرسمي" : "Visit Website Source"}
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
