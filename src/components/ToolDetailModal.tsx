import { Tool } from '../types';
import { 
  X, 
  ExternalLink, 
  Check, 
  Wrench, 
  HelpCircle, 
  Compass, 
  Zap, 
  History 
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
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Visual Hero Block */}
        <div className="relative h-48 w-full bg-slate-950 flex-shrink-0">
          <img 
            src={tool.ogImage} 
            alt={tool.name}
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition outline-none"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core metadata overlay */}
          <div className="absolute bottom-4 left-5 right-5 text-left">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/20">
              {isArabic ? (CATEGORY_ARABIC_MAP[tool.category] || tool.category) : tool.category}
            </span>
            <h2 className="text-2xl font-sans font-extrabold text-white mt-2 tracking-tight">
              {tool.name}
            </h2>
          </div>
        </div>

        {/* Scrollable details body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
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

          {/* System Requirements */}
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
