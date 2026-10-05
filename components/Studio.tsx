'use client';

import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; size: number; opacity: number; erasing?: boolean };
type Layer = { id: number; name: string; visible: boolean; opacity: number; strokes: Stroke[] };
type Project = { layers: Layer[]; active: number; savedAt: number };
const KEY = 'atelier-project-v1';
const COLORS = ['#26352f', '#d98269', '#e9b85e', '#92a995', '#8d82a7', '#e2a99c', '#f2eee6', '#ffffff'];

function initialLayers(): Layer[] { return [{ id: 1, name: 'レイヤー 1', visible: true, opacity: 100, strokes: [] }]; }

export function Studio({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const current = useRef<Stroke | null>(null);
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [active, setActive] = useState(1);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(7);
  const [tool, setTool] = useState<'brush'|'eraser'|'line'|'rectangle'|'ellipse'>('brush');
  const [zoom, setZoom] = useState(100);
  const [saveState, setSaveState] = useState('未保存');
  const [customColor, setCustomColor] = useState('#26352f');
  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current; const draw = drawRef.current;
    if (!canvas || !draw) return;
    const rect = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
    for (const layerCanvas of [canvas, draw]) { layerCanvas.width = Math.max(1, rect.width * ratio); layerCanvas.height = Math.max(1, rect.height * ratio); }
    const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const dctx = draw.getContext('2d'); if (dctx) dctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, []);
  useEffect(() => { const id = window.setTimeout(() => redraw(layers), 0); return () => window.clearTimeout(id); }, [layers, redraw]);
  const redraw = useCallback((items: Layer[]) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, rect.width, rect.height);
    for (const layer of items) { if (!layer.visible) continue; ctx.save(); ctx.globalAlpha = layer.opacity / 100; for (const stroke of layer.strokes) drawStroke(ctx, stroke); ctx.restore(); }
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    resizeCanvas();
    try { const data = localStorage.getItem(KEY); if (data) { const project = JSON.parse(data) as Project; if (project.layers?.length) { setLayers(project.layers); setActive(project.active ?? project.layers[0].id); setSaveState('保存済み'); } } } catch { setSaveState('保存できません'); }
    const observer = new ResizeObserver(resizeCanvas); if (canvas) observer.observe(canvas); const onResize = () => resizeCanvas(); window.addEventListener('resize', onResize);
    return () => { observer.disconnect(); window.removeEventListener('resize', onResize); if (saveRef.current) clearTimeout(saveRef.current); };
  }, [resizeCanvas]);
  useEffect(() => { redraw(layers); }, [layers, redraw]);
  useEffect(() => {
    if (saveRef.current) clearTimeout(saveRef.current);
    setSaveState('変更あり');
    saveRef.current = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify({ layers, active, savedAt: Date.now() })); setSaveState('保存済み'); } catch { setSaveState('保存に失敗'); } }, 550);
  }, [layers, active]);
  const pushPast = () => { setPast((old) => [...old.slice(-29), layers]); setFuture([]); };
  const mutateStroke = (pointer: PointerEvent<HTMLDivElement>, finish = false) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const bounds = canvasRef.current?.getBoundingClientRect();
    const point = { x: (pointer.clientX - rect.left) / (bounds?.width || 1) * 780, y: (pointer.clientY - rect.top) / (bounds?.height || 1) * 546 };
    if (!current.current) { current.current = { points: [point], color, size, opacity: tool === 'eraser' ? 1 : .85, erasing: tool === 'eraser' }; }
    else current.current.points.push(point);
    const ctx = drawRef.current?.getContext('2d'); if (ctx) {
      if (current.current.points.length === 1) { ctx.beginPath(); ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2); ctx.fillStyle = tool === 'eraser' ? '#fff' : color; ctx.fill(); }
      else { ctx.beginPath(); const points = current.current.points; ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y); ctx.lineTo(point.x, point.y); ctx.strokeStyle = tool === 'eraser' ? '#fff' : color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
    }
    if (finish) { const stroke = current.current; current.current = null; if (!stroke) return; setLayers((old) => old.map((layer) => layer.id === active ? { ...layer, strokes: [...layer.strokes, stroke] } : layer)); drawRef.current?.getContext('2d')?.clearRect(0,0,drawRef.current.width,drawRef.current.height); }
  };
  const start = (event: PointerEvent<HTMLDivElement>) => { if (event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') return; drawing.current = true; pushPast(); event.currentTarget.setPointerCapture(event.pointerId); mutateStroke(event); };
  const move = (event: PointerEvent<HTMLDivElement>) => { if (drawing.current) mutateStroke(event); };
  const end = (event: PointerEvent<HTMLDivElement>) => { if (!drawing.current) return; drawing.current = false; mutateStroke(event, true); };
  const undo = () => { if (!past.length) return; setFuture((old) => [...old, layers]); setLayers(past[past.length - 1]); setPast(past.slice(0, -1)); };
  const redo = () => { if (!future.length) return; setPast((old) => [...old, layers]); setLayers(future[future.length - 1]); setFuture(future.slice(0, -1)); };
  useEffect(() => { const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); });
  const newLayer = () => { const id = Date.now(); pushPast(); setLayers((old) => [...old, { id, name: `レイヤー ${old.length + 1}`, visible: true, opacity: 100, strokes: [] }]); setActive(id); };
  const deleteLayer = (id: number) => { if (layers.length < 2) return; pushPast(); const left = layers.filter((layer) => layer.id !== id); setLayers(left); if (active === id) setActive(left[left.length - 1].id); };
  const renameLayer = (id: number, name: string) => setLayers((old) => old.map((layer) => layer.id === id ? { ...layer, name } : layer));
  const exportPng = () => { const canvas = canvasRef.current; if (!canvas) return; const ratio = window.devicePixelRatio || 1; const output = document.createElement('canvas'); output.width = 1200; output.height = 840; const ctx = output.getContext('2d'); if (!ctx) return; ctx.fillStyle = '#fffefa'; ctx.fillRect(0,0,output.width,output.height); ctx.scale(output.width/canvas.width, output.height/canvas.height); for (const layer of layers) if(layer.visible) {ctx.save();ctx.globalAlpha=layer.opacity/100; for(const stroke of layer.strokes) drawStroke(ctx,stroke);ctx.restore();} const link = document.createElement('a'); link.download = 'atelier-illustration.png'; link.href = output.toDataURL('image/png'); link.click(); };
  const exportProject = () => { const blob = new Blob([JSON.stringify({ format: 'atelier', version: 1, layers, active }, null, 2)], { type: 'application/json' }); download(blob, 'atelier-project.json'); };
  const importProject = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)) as Project; if (!parsed.layers?.length) throw new Error('invalid'); pushPast(); setLayers(parsed.layers); setActive(parsed.active ?? parsed.layers[0].id); } catch { setSaveState('ファイルを読み込めません'); } }; reader.readAsText(file); };
  const clearAll = () => { if (!window.confirm('キャンバスをすべて消去しますか？')) return; pushPast(); setLayers((old) => old.map((layer) => ({ ...layer, strokes: [] }))); };
  const currentLayer = layers.find((layer) => layer.id === active);
  return <div className="studio-page"><header className="studio-top"><button className="back-link" onClick={onBack}>← もどる</button><div className="project-title"><span className="project-name">わたしのスケッチ</span><span className="save-indicator"><i className={saveState === '保存済み' ? 'saved' : ''} />{saveState}</span></div><div className="studio-top-actions"><button className="icon-tool" onClick={undo} title="Undo (Ctrl+Z)" disabled={!past.length}>↶</button><button className="icon-tool" onClick={redo} title="Redo (Ctrl+Shift+Z)" disabled={!future.length}>↷</button><span className="top-divider"/><button className="studio-export" onClick={exportPng}>↓ <span>PNGを書き出す</span></button></div></header><div className="studio-workspace"><aside className="tool-panel"><span className="panel-label">ツール</span><div className="tool-list">{([['brush','✎','ブラシ'],['eraser','⌫','消しゴム'],['line','／','直線'],['rectangle','▱','四角'],['ellipse','◯','楕円']] as const).map(([id,icon,label]) => <button key={id} className={tool === id ? 'tool-choice active' : 'tool-choice'} onClick={() => setTool(id)} title={label}><span>{icon}</span><small>{label}</small></button>)}</div><div className="panel-rule"/><label className="control-label">サイズ <b>{size}px</b></label><input className="range-input" type="range" min="1" max="48" value={size} onChange={(e) => setSize(+e.target.value)} /><label className="control-label opacity-label">不透明度 <b>85%</b></label><div className="brush-preview"><span style={{ width: Math.min(size, 28), height: Math.min(size, 28), background: tool === 'eraser' ? '#eae5db' : color }}/></div><div className="panel-rule"/><span className="panel-label">カラー</span><div className="swatches">{COLORS.map((item) => <button key={item} aria-label={`色 ${item}`} className={color === item ? 'swatch selected' : 'swatch'} style={{ backgroundColor: item }} onClick={() => { setColor(item); setCustomColor(item); }}/>)}</div><label className="custom-color" title="カスタムカラー"><span>＋</span><input type="color" value={customColor} onChange={(e) => { setColor(e.target.value); setCustomColor(e.target.value); }}/><small>色を選ぶ</small></label><button className="clear-button" onClick={clearAll}>キャンバスを消去</button></aside><div className="canvas-column"><div className="canvas-toolbar"><span className="canvas-label">キャンバス <span>·</span> 1200 × 840</span><div className="zoom-control"><button onClick={() => setZoom(Math.max(50,zoom-10))}>−</button><span>{zoom}%</span><button onClick={() => setZoom(Math.min(150,zoom+10))}>＋</button><span className="zoom-separator"/><button className="fit-button" onClick={() => setZoom(100)}>全体表示</button></div></div><div className="canvas-viewport"><div className="canvas-paper" style={{ transform: `scale(${zoom/100})` }}><canvas ref={canvasRef} /><canvas ref={drawRef} className="draw-overlay"/><div className="canvas-input" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} /></div></div><div className="canvas-status"><span>✳ 描いてみよう。失敗しても、何度でもやり直せます。</span><span>⌘ / Ctrl + Z　Undo</span></div></div><aside className="layer-panel"><div className="layer-panel-head"><div><span className="panel-label">レイヤー</span><span className="layer-count">{layers.length} 枚</span></div><button className="add-layer" onClick={newLayer} title="新しいレイヤー">＋</button></div><div className="layers-list">{[...layers].reverse().map((layer) => <div key={layer.id} className={active === layer.id ? 'layer-row active' : 'layer-row'} onClick={() => setActive(layer.id)}><button className={layer.visible ? 'visibility visible' : 'visibility'} onClick={(e) => { e.stopPropagation(); setLayers((old) => old.map((item) => item.id === layer.id ? { ...item, visible: !item.visible } : item)); }} title="表示 / 非表示">{layer.visible ? '◉' : '○'}</button><span className="layer-thumb"><i>{layer.strokes.length ? '✎' : ''}</i></span><input aria-label="レイヤー名" value={layer.name} onChange={(e) => renameLayer(layer.id, e.target.value)} onClick={(e) => e.stopPropagation()} /><button className="layer-delete" onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} title="レイヤーを削除">×</button></div>)}</div><div className="layer-settings"><label className="control-label">不透明度 <b>{currentLayer?.opacity ?? 100}%</b></label><input className="range-input" type="range" min="0" max="100" value={currentLayer?.opacity ?? 100} onChange={(e) => setLayers((old) => old.map((layer) => layer.id === active ? { ...layer, opacity: +e.target.value } : layer))}/><button className="new-layer-wide" onClick={newLayer}>＋　新しいレイヤー</button><div className="layer-tip"><span>✳</span> 線と色を別のレイヤーに分けると、あとから調整しやすくなります。</div><div className="project-io"><label className="import-button">作品ファイルを開く<input type="file" accept="application/json,.json" onChange={(e) => importProject(e.target.files?.[0])}/></label><button onClick={exportProject}>作品データを書き出す</button></div></div></aside></div></div>;
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) { const points = stroke.points; if (!points.length) return; ctx.save(); ctx.globalAlpha = stroke.opacity; if (stroke.erasing) ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = stroke.color; ctx.fillStyle = stroke.color; ctx.lineWidth = stroke.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (points.length === 1) { ctx.beginPath(); ctx.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); for (const p of points.slice(1)) ctx.lineTo(p.x,p.y); ctx.stroke(); } ctx.restore(); }
function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }
