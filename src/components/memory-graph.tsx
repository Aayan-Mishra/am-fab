"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SpriteText from "three-spritetext";
import { graphNodes, graphLinks, KIND_META } from "@/lib/graph";
import type { GraphNode } from "@/lib/graph";
import type { MemoryKind } from "@/lib/types";

// ForceGraph3D touches window/WebGL — load it client-only.
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export function MemoryGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [active, setActive] = useState<Set<MemoryKind>>(
    new Set(Object.keys(KIND_META) as MemoryKind[]),
  );

  // Responsive sizing.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: Math.max(420, Math.min(620, r.width * 0.62)) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Filter graph by active memory systems; keep links whose endpoints survive.
  const data = useMemo(() => {
    const nodes = graphNodes.filter((n) => active.has(n.kind));
    const ids = new Set(nodes.map((n) => n.id));
    const links = graphLinks
      .filter((l) => ids.has(l.source as string) && ids.has(l.target as string))
      .map((l) => ({ ...l }));
    return { nodes: nodes.map((n) => ({ ...n })), links };
  }, [active]);

  // Stronger repulsion so clusters breathe; refit camera when settled.
  const onEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(600, 50);
  }, []);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-160);
    const link = fg.d3Force("link");
    if (link) link.distance((l: any) => 60 - l.strength * 30);
  }, [data]);

  // A floating text label per node, tinted by memory system.
  const nodeLabelSprite = useCallback((n: any) => {
    const s = new SpriteText(n.label as string);
    s.color = KIND_META[n.kind as MemoryKind].color;
    s.textHeight = 3 + (n.val as number) * 0.18;
    s.fontWeight = "600";
    s.backgroundColor = "rgba(0,0,0,0.35)";
    s.padding = 1.5;
    s.borderRadius = 2;
    (s as any).position.y = -(6 + (n.val as number) * 0.5);
    return s;
  }, []);

  function toggle(k: MemoryKind) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next.size === 0 ? prev : next;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-black" ref={wrapRef}>
        {/* Legend / filters */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {(Object.keys(KIND_META) as MemoryKind[]).map((k) => {
            const on = active.has(k);
            return (
              <button
                key={k}
                onClick={() => toggle(k)}
                className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors"
                style={{
                  borderColor: on ? KIND_META[k].color + "66" : "#262626",
                  color: on ? KIND_META[k].color : "#525252",
                  background: on ? KIND_META[k].color + "14" : "transparent",
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: on ? KIND_META[k].color : "#404040" }} />
                {KIND_META[k].label}
              </button>
            );
          })}
        </div>

        <ForceGraph3D
          ref={fgRef}
          width={size.w}
          height={size.h}
          graphData={data}
          backgroundColor="#000000"
          showNavInfo={false}
          nodeLabel={(n: any) => `<div style="font:12px sans-serif;color:#e5e5e5">
            <b>${n.label}</b> · ${KIND_META[n.kind as MemoryKind].label}<br/>
            <span style="color:#737373">${n.snippet}</span></div>`}
          nodeColor={(n: any) => KIND_META[n.kind as MemoryKind].color}
          nodeVal={(n: any) => n.val}
          nodeOpacity={0.92}
          nodeResolution={16}
          nodeThreeObjectExtend={true}
          nodeThreeObject={nodeLabelSprite}
          linkColor={() => "#3f3f46"}
          linkWidth={(l: any) => l.strength * 1.6}
          linkOpacity={0.4}
          linkDirectionalParticles={(l: any) => (l.strength > 0.7 ? 2 : 0)}
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.004}
          warmupTicks={40}
          cooldownTicks={120}
          onEngineStop={onEngineStop}
          onNodeClick={(n: any) => {
            setSelected(n as GraphNode);
            const fg = fgRef.current;
            if (fg) {
              const dist = 90;
              const ratio = 1 + dist / Math.hypot(n.x || 1, n.y || 1, n.z || 1);
              fg.cameraPosition({ x: (n.x || 0) * ratio, y: (n.y || 0) * ratio, z: (n.z || 0) * ratio }, n, 800);
            }
          }}
          onBackgroundClick={() => setSelected(null)}
        />

        <p className="pointer-events-none absolute bottom-2 right-3 z-10 font-mono text-[10px] text-neutral-600">
          drag to rotate · scroll to zoom · click a node
        </p>
      </div>

      {/* Detail / inspector panel */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        {selected ? (
          <NodeDetail node={selected} />
        ) : (
          <div>
            <p className="text-sm font-medium text-neutral-200">Memory network</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              {graphNodes.length} memories, {graphLinks.length} inferred connections. The system clusters by meaning,
              not folders — sleep science sits next to your sleep debt; your training non-negotiable sits next to the
              streak you just broke.
            </p>
            <div className="mt-4 space-y-2">
              {(Object.keys(KIND_META) as MemoryKind[]).map((k) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_META[k].color }} />
                  <span className="text-neutral-300">{KIND_META[k].label}</span>
                  <span className="ml-auto font-mono text-neutral-600">
                    {graphNodes.filter((n) => n.kind === k).length}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-neutral-600">Click any node to trace its connections.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeDetail({ node }: { node: GraphNode }) {
  const meta = KIND_META[node.kind];
  const links = graphLinks.filter((l) => l.source === node.id || l.target === node.id);
  const connections = links.map((l) => {
    const otherId = l.source === node.id ? l.target : l.source;
    const other = graphNodes.find((n) => n.id === (otherId as string))!;
    return { rel: l.rel, node: other, strength: l.strength };
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        <span className="text-[11px] uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
      </div>
      <h3 className="mt-1 text-sm font-semibold text-neutral-100">{node.label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{node.snippet}</p>
      <p className="mt-1 font-mono text-[10px] text-neutral-600">{node.source}</p>

      <p className="mt-4 mb-1.5 text-[11px] font-medium text-neutral-400">
        {connections.length} connections
      </p>
      <ul className="space-y-2">
        {connections
          .sort((a, b) => b.strength - a.strength)
          .map((c, i) => (
            <li key={i} className="border-l-2 pl-2.5" style={{ borderColor: KIND_META[c.node.kind].color + "66" }}>
              <p className="font-mono text-[10px] text-neutral-500">{c.rel}</p>
              <p className="text-xs text-neutral-200">{c.node.label}</p>
            </li>
          ))}
      </ul>
    </div>
  );
}
