import { useState, useEffect } from 'react';
import { Tool, UserLifecycleState, LifecycleType } from './types';
import MarqueeTicker from './components/MarqueeTicker';
import ToolCard from './components/ToolCard';
import ToolDetailModal from './components/ToolDetailModal';
import AdminPanel from './components/AdminPanel';
import { 
  Compass, 
  Layers, 
  Heart, 
  Bookmark, 
  Eye, 
  FolderLock, 
  Search, 
  Sparkles, 
  Grid, 
  TrendingUp,
  XCircle,
  Code2,
  Wrench,
  Cpu
} from 'lucide-react';

const CATEGORIES = [
  "All",
  "LLMs & Chatbots",
  "Development & Coding",
  "Design & Graphics",
  "Productivity & Research",
  "Audio & Speech",
  "Creative Tools"
];

const TRANSLATIONS = {
  en: {
    brand_sub: "Tools Directory",
    nav_directory: "Directory",
    nav_workspace: "My Workspace",
    nav_admin: "Admin Section",
    hero_badge: "⭐ Curated by Admin",
    hero_title: "Elite AI Tools Platform",
    hero_desc: "Explore a highly filtered directory of professional generative models and developer software. Organize resources cleanly with offline state managers.",
    search_placeholder: "Query local curation database by title, description, or system requirements...",
    empty_title: "Empty Result folder",
    empty_desc_1: "No curated tools match category: ",
    empty_desc_2: " with query keywords matching ",
    reset_filters: "Reset all Filters",
    workspace_title: "My AI Workspace Lifecycle",
    workspace_desc: "Maintain a custom folder layout of your stack. Organize what is currently 'In Use', your 'Favorites', or tools saved to evaluate 'Later'.",
    fav_tab: "Favorites",
    in_use_tab: "In Use",
    saved_later_tab: "Saved Later",
    viewed_history_tab: "Viewed History",
    empty_workspace_title: "No tools registered in this folder.",
    empty_workspace_desc: "Go to the Directory overview page and click on card badges to sort curated AI systems into this workspace drawer.",
    explore_tools_btn: "Explore AI Directory",
    footer_text: "© 2026 Admin Curation Platform. Powered by Google Workspace, Gemini Flash, & Telegram Sync.",
    footer_status: "Sandbox Engine Online",
  },
  ar: {
    brand_sub: "دليل أدوات الذكاء الاصطناعي",
    nav_directory: "دليل الأدوات",
    nav_workspace: "مساحة عملي",
    nav_admin: "لوحة التحكم",
    hero_badge: "⭐ منسق بواسطة المشرف",
    hero_title: "منصة أدوات الذكاء الاصطناعي النخبة",
    hero_desc: "استكشف دليلاً شاملاً وحصرياً لأجود نماذج الذكاء الاصطناعي التوليدي وبرمجيات المطورين الاحترافية. نظّم ملفاتك محلياً بشكل مستقل.",
    search_placeholder: "ابحث في سجلات التنسيق المحلي بالأسم أو الوصف أو تصنيف متمتطلبات التشغيل...",
    empty_title: "مجلد النتائج فارغ",
    empty_desc_1: "لم يتم العثور على نتائج تطابق التصنيف: ",
    empty_desc_2: " وبكلمات بحث ",
    reset_filters: "إعادة تعيين مرشحات البحث",
    workspace_title: "دورة حياة أدواتي ومساحة عملي",
    workspace_desc: "نظّم أدواتك المفضلة وسير العمل في مساحة واحدة آمنة. رتب الأدوات قيد الاستخدام حالياً أو المحفوظة للمراجعة لاحقاً.",
    fav_tab: "المفضلة",
    in_use_tab: "قيد الاستعمال",
    saved_later_tab: "محفوظة لاحقاً",
    viewed_history_tab: "سجل الاطلاع",
    empty_workspace_title: "مجلد مساحة العمل فارغ حالياً.",
    empty_workspace_desc: "تصفح دليل الأدوات الأساسي واضغط على أيقونات التبويب والحفظ من بطاقات الأدوات لتظهر هنا فوراً.",
    explore_tools_btn: "استعراض دليل الأدوات",
    footer_text: "جميع الحقوق محفوظة © 2026 منصة نشر أدوات الذكاء الاصطناعي. مدعومة بنظام Google Workspace و Gemini Flash و Telegram.",
    footer_status: "محرك السيرفر والبيئة نشط ومتصل",
  }
};

const CATEGORY_ARABIC_MAP: Record<string, string> = {
  "All": "الكل الأدوات",
  "LLMs & Chatbots": "نماذج اللغات والمحادثة",
  "Development & Coding": "التطوير والبرمجة",
  "Design & Graphics": "التصميم والغرافيكس",
  "Productivity & Research": "الإنتاجية والأبحاث",
  "Audio & Speech": "توليد الصوت والكلام",
  "Creative Tools": "الأدوات الإبداعية"
};

const INITIAL_LIFECYCLE: UserLifecycleState = {
  favorites: [],
  inUse: [],
  later: [],
  viewed: []
};

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Arabic mode switch
  const [isArabic, setIsArabic] = useState<boolean>(() => {
    try {
      return localStorage.getItem('is_arabic_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('is_arabic_mode', isArabic ? 'true' : 'false');
    } catch {}
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  const dict = isArabic ? TRANSLATIONS.ar : TRANSLATIONS.en;

  // Navigation tabs
  const [activeView, setActiveView] = useState<'directory' | 'workspace' | 'admin'>('directory');
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Workspace lifecycle filter tabs
  const [workspaceSubView, setWorkspaceSubView] = useState<LifecycleType>('favorites');

  // Currently opened detail modal
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Client personal lifecycle localState
  const [userLifecycle, setUserLifecycle] = useState<UserLifecycleState>(() => {
    try {
      const stored = localStorage.getItem('ai_curate_lifecycle');
      return stored ? JSON.parse(stored) : INITIAL_LIFECYCLE;
    } catch {
      return INITIAL_LIFECYCLE;
    }
  });

  // Load directory on mounting
  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools');
      if (res.ok) {
        const data = await res.json();
        setTools(data);
      }
    } catch (e) {
      console.error("Failed to load tools database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Sync lifeCycle states
  useEffect(() => {
    localStorage.setItem('ai_curate_lifecycle', JSON.stringify(userLifecycle));
  }, [userLifecycle]);

  // Outbound click count register
  const registerOutboundClick = async (toolId: string) => {
    try {
      const res = await fetch(`/api/tools/${toolId}/click`, { method: 'POST' });
      if (res.ok) {
        setTools(prev => prev.map(t => {
          if (t.id === toolId) {
            return { ...t, clicks: (t.clicks || 0) + 1 };
          }
          return t;
        }));
      }
    } catch (e) {
      console.warn("Outbound metrics track issue:", e);
    }
  };

  // Add new tool locally to visual state when admin publishes (immediate feedback)
  const handleAddToolLocally = (newTool: Tool) => {
    setTools(prev => [newTool, ...prev]);
  };

  // Tool Detail interaction trigger
  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    
    // Automatically flag as Viewed
    if (!userLifecycle.viewed.includes(tool.id)) {
      setUserLifecycle(prev => ({
        ...prev,
        viewed: [...prev.viewed, tool.id]
      }));
    }
  };

  // Quick toggle lifecycle sorting labels
  const handleToggleLifecycle = (toolId: string, stage: 'favorites' | 'inUse' | 'later') => {
    setUserLifecycle(prev => {
      const currentList = prev[stage];
      if (currentList.includes(toolId)) {
        return {
          ...prev,
          [stage]: currentList.filter(id => id !== toolId)
        };
      } else {
        return {
          ...prev,
          [stage]: [...currentList, toolId]
        };
      }
    });
  };

  // Filtering local database
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      tool.name.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.microSummary.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.systemRequirements.toLowerCase().includes(query) ||
      tool.features.some(f => f.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Compile user workspace curated items
  const workspaceTools = tools.filter(tool => userLifecycle[workspaceSubView].includes(tool.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Absolute top minimal brand bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveView('directory'); setSelectedCategory('All'); setSearchQuery(''); }}>
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-cyan-500/10">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-md font-sans font-extrabold tracking-tight text-white block">
                CURATED <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400 block -mt-1">
                {dict.brand_sub}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Highly interactive language switcher */}
            <button
              onClick={() => setIsArabic(!isArabic)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            >
              🌐 {isArabic ? "ENGLISH" : "العربية"}
            </button>

            {/* Navigation layout controls */}
            <nav className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-sm font-sans">
              <button
                onClick={() => setActiveView('directory')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all font-medium outline-none ${
                  activeView === 'directory' 
                    ? 'bg-slate-800 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                {dict.nav_directory}
              </button>
              
              <button
                onClick={() => setActiveView('workspace')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all font-medium outline-none relative ${
                  activeView === 'workspace' 
                    ? 'bg-slate-800 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                {dict.nav_workspace}
                {(userLifecycle.favorites.length + userLifecycle.inUse.length + userLifecycle.later.length > 0) && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all font-medium outline-none ${
                  activeView === 'admin' 
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/10 shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FolderLock className="w-4 h-4" />
                {dict.nav_admin}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Dynamic Crawling Marquee Line for Curated items */}
      <MarqueeTicker tools={tools} onSelectTool={handleSelectTool} />

      {/* Main Core Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== VIEW 1: GENERAL DIRECTORY BROWSE ==================== */}
        {activeView === 'directory' && (
          <div className="space-y-8 animate-fade-in">
            {/* Elegant Hero Callout Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3 py-4">
              <span className="px-3 py-1 bg-cyan-950 text-cyan-400 text-xs font-sans font-semibold rounded-full border border-cyan-500/10">
                {dict.hero_badge}
              </span>
              <h1 className="text-3.5xl md:text-4xl font-sans font-extrabold tracking-tight text-white leading-none">
                {dict.hero_title}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-lg mx-auto">
                {dict.hero_desc}
              </p>
            </div>

            {/* Quick search input and category filter tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              
              {/* Custom Search bar */}
              <div className="relative">
                <span className={`absolute inset-y-0 ${isArabic ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center text-slate-500`}>
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder={dict.search_placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isArabic ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-slate-200 text-sm outline-none transition`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`absolute inset-y-0 ${isArabic ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-500 hover:text-slate-300 transition`}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categorization tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md whitespace-nowrap border transition outline-none cursor-pointer ${
                      selectedCategory === category
                        ? "bg-cyan-600 text-slate-950 border-cyan-600 font-bold"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {isArabic ? (CATEGORY_ARABIC_MAP[category] || category) : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Directory Cards Section */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-slate-900 border border-slate-800 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={handleSelectTool}
                    isFavorite={userLifecycle.favorites.includes(tool.id)}
                    isInUse={userLifecycle.inUse.includes(tool.id)}
                    isLater={userLifecycle.later.includes(tool.id)}
                    isViewed={userLifecycle.viewed.includes(tool.id)}
                    onToggleLifecycle={handleToggleLifecycle}
                    onRegisterClick={registerOutboundClick}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/45 border border-slate-800 p-8 rounded-xl max-w-md mx-auto space-y-3 font-mono">
                <p className="text-slate-500 text-xs text-center uppercase tracking-wider">{dict.empty_title}</p>
                <p className="text-sm text-slate-400">
                  {dict.empty_desc_1} &ldquo;{isArabic ? (CATEGORY_ARABIC_MAP[selectedCategory] || selectedCategory) : selectedCategory}&rdquo; {dict.empty_desc_2} &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-400 hover:text-cyan-300 rounded text-xs transition border border-slate-700"
                >
                  {dict.reset_filters}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW 2: PERSONAL WORKSPACE LIFECYCLE ==================== */}
        {activeView === 'workspace' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Callout */}
            <div className="text-left">
              <h2 className="text-2xl font-sans font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                {dict.workspace_title}
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                {dict.workspace_desc}
              </p>
            </div>

            {/* Stage Categorization Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto pb-1">
              <button
                onClick={() => setWorkspaceSubView('favorites')}
                className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase hover:text-white transition outline-none cursor-pointer border-b whitespace-nowrap ${
                  workspaceSubView === 'favorites'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                {dict.fav_tab} ({userLifecycle.favorites.length})
              </button>

              <button
                onClick={() => setWorkspaceSubView('inUse')}
                className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase hover:text-white transition outline-none cursor-pointer border-b whitespace-nowrap ${
                  workspaceSubView === 'inUse'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <Layers className="w-4 h-4" />
                {dict.in_use_tab} ({userLifecycle.inUse.length})
              </button>

              <button
                onClick={() => setWorkspaceSubView('later')}
                className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase hover:text-white transition outline-none cursor-pointer border-b whitespace-nowrap ${
                  workspaceSubView === 'later'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {dict.saved_later_tab} ({userLifecycle.later.length})
              </button>

              <button
                onClick={() => setWorkspaceSubView('viewed')}
                className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase hover:text-white transition outline-none cursor-pointer border-b whitespace-nowrap ${
                  workspaceSubView === 'viewed'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" />
                {dict.viewed_history_tab} ({userLifecycle.viewed.length})
              </button>
            </div>

            {/* Render selected workspace list items */}
            {workspaceTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={handleSelectTool}
                    isFavorite={userLifecycle.favorites.includes(tool.id)}
                    isInUse={userLifecycle.inUse.includes(tool.id)}
                    isLater={userLifecycle.later.includes(tool.id)}
                    isViewed={userLifecycle.viewed.includes(tool.id)}
                    onToggleLifecycle={handleToggleLifecycle}
                    onRegisterClick={registerOutboundClick}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/20 border border-slate-800/60 p-8 rounded-xl max-w-md mx-auto space-y-2">
                <p className="text-slate-400 font-sans text-sm font-medium">{dict.empty_workspace_title}</p>
                <p className="text-xs text-slate-500 leading-normal">
                  {dict.empty_workspace_desc}
                </p>
                <button
                  onClick={() => setActiveView('directory')}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-cyan-400 rounded text-xs tracking-wide transition border border-slate-700 outline-none cursor-pointer"
                >
                  {dict.explore_tools_btn}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW 3: ADMINISTRATIVE PANEL ==================== */}
        {activeView === 'admin' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <AdminPanel
              currentTools={tools}
              onRefreshTools={fetchTools}
              onAddToolLocally={handleAddToolLocally}
              isArabic={isArabic}
            />
          </div>
        )}

      </main>

      {/* ==================== DETAIL OVERLAY DIALOG ==================== */}
      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onRegisterClick={registerOutboundClick}
          isArabic={isArabic}
        />
      )}

      {/* Global Bottom Status Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-mono">
            {dict.footer_text}
          </p>
          <div className="flex gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> {dict.footer_status}
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
