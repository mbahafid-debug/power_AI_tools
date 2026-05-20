import { Tool } from '../types';
import { Sparkles, TrendingUp } from 'lucide-react';

interface MarqueeTickerProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

export default function MarqueeTicker({ tools, onSelectTool }: MarqueeTickerProps) {
  // Pad the items if tools are few to keep marquee rich and continuous
  const tickerItems = [...tools, ...tools, ...tools].slice(0, 15);

  if (tools.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-slate-900 border-y border-slate-800 py-3 text-sm">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap overflow-x-hidden relative">
        <div className="inline-flex animate-marquee gap-8 items-center cursor-pointer">
          {tickerItems.map((tool, idx) => (
            <button
              key={`${tool.id}-marquee-${idx}`}
              onClick={() => onSelectTool(tool)}
              className="inline-flex items-center gap-2 hover:text-cyan-400 text-slate-300 font-mono transition-colors duration-150 outline-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-sans font-medium">{tool.name}</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                {tool.category}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs text-opacity-90">
                <TrendingUp className="w-3 h-3" />
                {tool.clicks} Curated Clicks
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
