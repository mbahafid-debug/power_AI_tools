import React from 'react';
import { Tool } from '../types';
import { 
  Heart, 
  Layers, 
  Bookmark, 
  Eye, 
  ExternalLink, 
  Check, 
  Activity, 
  Wrench, 
  Compass, 
  ExternalLink as LinkIcon 
} from 'lucide-react';

interface ToolCardProps {
  key?: string;
  tool: Tool;
  onSelect: (tool: Tool) => void;
  isFavorite: boolean;
  isInUse: boolean;
  isLater: boolean;
  isViewed: boolean;
  onToggleLifecycle: (id: string, stage: 'favorites' | 'inUse' | 'later') => void;
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

export default function ToolCard({
  tool,
  onSelect,
  isFavorite,
  isInUse,
  isLater,
  isViewed,
  onToggleLifecycle,
  onRegisterClick,
  isArabic = false,
}: ToolCardProps) {
  
  const handleOutboundClick = (e: React.MouseEvent) => {
    // Increment server-side click metrics
    onRegisterClick(tool.id);
  };

  return (
    <div 
      className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      onClick={() => onSelect(tool)}
    >
      {/* Decorative Image/Gradient Block */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img 
          src={tool.ogImage} 
          alt={tool.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/20 shadow-md">
          {isArabic ? (CATEGORY_ARABIC_MAP[tool.category] || tool.category) : tool.category}
        </span>

        {/* Clicks Badge Indicator */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono rounded bg-slate-950/90 text-emerald-400 border border-emerald-500/10 shadow">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          {tool.clicks || 0} {isArabic ? "زيارات" : "clicks"}
        </span>
      </div>

      {/* Card Content Section */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-lg font-sans font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
          {tool.name}
        </h3>
        
        <p className="mt-2 text-sm text-slate-400 font-sans line-clamp-3 leading-relaxed flex-1">
          {tool.microSummary}
        </p>

        {/* System requirements notice */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{tool.systemRequirements}</span>
        </div>

        {/* User Workspace Status Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {isFavorite && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-2.5 h-2.5 fill-rose-400" /> {isArabic ? "مفضلة" : "Favorite"}
            </span>
          )}
          {isInUse && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-2.5 h-2.5" /> {isArabic ? "قيد الاستخدام" : "In Use"}
            </span>
          )}
          {isLater && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Compass className="w-2.5 h-2.5" /> {isArabic ? "المرجعيات" : "Bookmarks"}
            </span>
          )}
          {isViewed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Eye className="w-2.5 h-2.5" /> {isArabic ? "تم الاطلاع" : "Viewed"}
            </span>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          {/* Outbound Link Trigger */}
          <a 
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOutboundClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md transition-all outline-none"
          >
            {isArabic ? "زيارة الرابط" : "Visit Resource"}
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Quick Lifecycle Stage Toggle Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleLifecycle(tool.id, 'favorites')}
              title={isFavorite ? (isArabic ? "إزالة من المفضلة" : "Remove from Favorites") : (isArabic ? "حفظ كأداة مفضلة" : "Mark as Favorite")}
              className={`p-1.5 rounded-md transition-colors border ${
                isFavorite 
                   ? 'bg-rose-950/40 text-rose-400 border-rose-500/30' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onToggleLifecycle(tool.id, 'inUse')}
              title={isInUse ? (isArabic ? "إزالة من قيد التشغيل والعمل" : "Mark as Not In Use") : (isArabic ? "تفعيل كأداة مستخدمة" : "Mark as In Use")}
              className={`p-1.5 rounded-md transition-colors border ${
                isInUse 
                  ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-cyan-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleLifecycle(tool.id, 'later')}
              title={isLater ? (isArabic ? "إزالة العلامة المرجعية" : "Remove bookmark") : (isArabic ? "حفظ للاحقاً وتثبيت" : "Save for Later")}
              className={`p-1.5 rounded-md transition-colors border ${
                isLater 
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/30' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-amber-400'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isLater ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
