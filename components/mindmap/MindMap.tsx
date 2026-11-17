"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface MindNode {
  title: string;
  children?: MindNode[];
}

const COLORS = [
  "from-cyan-500/30 to-cyan-600/10 border-cyan-500/40 text-cyan-200",
  "from-purple-500/30 to-purple-600/10 border-purple-500/40 text-purple-200",
  "from-green-500/30 to-green-600/10 border-green-500/40 text-green-200",
  "from-yellow-500/30 to-yellow-600/10 border-yellow-500/40 text-yellow-200",
  "from-pink-500/30 to-pink-600/10 border-pink-500/40 text-pink-200",
  "from-orange-500/30 to-orange-600/10 border-orange-500/40 text-orange-200",
  "from-blue-500/30 to-blue-600/10 border-blue-500/40 text-blue-200",
  "from-indigo-500/30 to-indigo-600/10 border-indigo-500/40 text-indigo-200",
];

function Node({
  node,
  depth = 0,
  colorIndex = 0,
}: {
  node: MindNode;
  depth?: number;
  colorIndex?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const color = COLORS[colorIndex % COLORS.length];

  if (depth === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Root */}
        <div className="px-6 py-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
          {node.title}
        </div>

        {/* Branches */}
        {hasChildren && (
          <div className="flex flex-wrap justify-center gap-6 w-full">
            {node.children!.map((child, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[180px] max-w-[280px]">
                {/* Connector line */}
                <div className="w-px h-4 bg-slate-600" />
                <Node node={child} depth={1} colorIndex={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        onClick={() => hasChildren && setOpen((o) => !o)}
        className={`w-full px-4 py-2.5 rounded-xl bg-gradient-to-br border text-sm font-medium text-left transition hover:scale-[1.02] ${
          color
        } ${hasChildren ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className="flex items-center gap-2">
          {hasChildren &&
            (open ? (
              <ChevronDown size={14} className="shrink-0 opacity-60" />
            ) : (
              <ChevronRight size={14} className="shrink-0 opacity-60" />
            ))}
          {node.title}
        </span>
      </button>

      {hasChildren && open && (
        <div className="flex flex-col gap-2 w-full pl-3 border-l border-slate-700 ml-2">
          {node.children!.map((child, i) => (
            <Node
              key={i}
              node={child}
              depth={depth + 1}
              colorIndex={colorIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindMap({ data }: { data: MindNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 overflow-x-auto">
      <Node node={data} />
    </div>
  );
}
