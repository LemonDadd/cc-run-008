import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AppHeader from '../components/AppHeader.jsx';
import KidButton from '../components/KidButton.jsx';
import { useProgressStore } from '../store/progressStore.js';
import { useAppStore } from '../store/appStore.js';
import { BASE_COLORS, colorById } from '../data/colors.js';
import { RULE_META } from '../lib/colorWheel.js';
import { formatDate, cx } from '../lib/util.js';
import { sfx } from '../lib/audio.js';

const TABS = [
  { key: 'coloring', label: '情境用色', icon: '🖍️' },
  { key: 'matching', label: '配色练习', icon: '🎀' },
];

// 作品用到的颜色：情境作品看 fills 的色值，配色作品看 colors 的颜色 id
function workSwatches(work, kind) {
  if (kind === 'coloring') {
    const hexes = [...new Set(Object.values(work.fills || {}))];
    return hexes.map((hex) => {
      const c = BASE_COLORS.find((x) => x.hex.toLowerCase() === String(hex).toLowerCase());
      return { hex, name: c?.name || hex };
    });
  }
  return (work.colors || []).map((id) => ({
    hex: colorById[id]?.hex,
    name: colorById[id]?.name || id,
  }));
}

// 作品里那句说明：情境作品是孩子写的一句话；配色作品是由规则生成的说明
function workNote(work, kind, swatches) {
  if (kind === 'coloring') return work.note || '';
  const ruleName = RULE_META[work.rule]?.name || '主题';
  return `我用${swatches.map((s) => s.name).join('、')}，完成了「${ruleName}」搭配。`;
}

// 打印页：只在打印时显示（见 index.css 的 @media print 规则）
function PrintSheet({ work, kind, nickname }) {
  const swatches = workSwatches(work, kind);
  const note = workNote(work, kind, swatches);
  const img = work.dataUrl || work.previewDataUrl;
  return (
    <div className="print-sheet" data-testid="print-sheet">
      <div className="flex items-center justify-between" style={{ fontSize: 22, fontWeight: 800 }}>
        <span>🎨 ColoKid 色彩乐园 · 我的作品</span>
        <span style={{ fontWeight: 400 }}>{formatDate(work.createdAt)}</span>
      </div>
      <div style={{ marginTop: 18, fontSize: 26 }}>
        <b>{nickname}</b> 的作品
      </div>
      {img && (
        <img
          src={img}
          alt={work.title}
          style={{
            width: '100%',
            maxHeight: 360,
            objectFit: 'contain',
            marginTop: 14,
            border: '3px solid #eee',
            borderRadius: 16,
            background: '#fff',
          }}
        />
      )}
      <div style={{ marginTop: 14, fontSize: 32, fontWeight: 800 }}>《{work.title}》</div>
      {work.emotion && <div style={{ marginTop: 4, fontSize: 20 }}>心情：{work.emotion}</div>}
      <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>用到的颜色</div>
      <div className="flex flex-wrap" style={{ gap: 14, marginTop: 8 }}>
        {swatches.map((s, i) => (
          <span key={i} data-testid="print-swatch" className="flex items-center" style={{ gap: 8, fontSize: 18 }}>
            <span
              style={{
                display: 'inline-block',
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: s.hex,
                border: '2px solid #ddd',
              }}
            />
            {s.name}
          </span>
        ))}
      </div>
      {note && (
        <>
          <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>作品说明</div>
          <div style={{ marginTop: 6, fontSize: 24 }}>“{note}”</div>
        </>
      )}
      <div style={{ marginTop: 26, fontSize: 16, color: '#999' }}>⭐ 继续加油，小小色彩家！</div>
    </div>
  );
}

export default function Gallery() {
  const records = useProgressStore((s) => s.records);
  const deleteRecord = useProgressStore((s) => s.deleteRecord);
  const profile = useAppStore((s) => s.currentProfile());
  const [tab, setTab] = useState('coloring');
  const [view, setView] = useState(null);
  const [printWork, setPrintWork] = useState(null); // { work, kind }

  const list = tab === 'coloring' ? records.coloring : records.matching;

  // 浏览器打印结束后撤掉打印页
  useEffect(() => {
    const after = () => setPrintWork(null);
    window.addEventListener('afterprint', after);
    return () => window.removeEventListener('afterprint', after);
  }, []);

  const doPrint = (work, kind) => {
    setPrintWork({ work, kind });
    // 等打印页渲染出来再调起浏览器打印（不用 jsPDF，不生成分享链接）
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  return (
    <div>
      <AppHeader title="我的作品" />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex gap-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                sfx.click();
              }}
              className={cx(
                'pressable rounded-full px-7 py-3 font-btn shadow-soft',
                tab === t.key ? 'bg-purple-500 text-white' : 'bg-white text-slate-600'
              )}
            >
              {t.icon} {t.label}（{t.key === 'coloring' ? records.coloring.length : records.matching.length}）
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <div className="card-kid mt-8 p-12 text-center">
            <div className="text-7xl">{tab === 'coloring' ? '🖍️' : '🎀'}</div>
            <p className="mt-4 font-body text-slate-500">
              {tab === 'coloring' ? '去情境用色里画一幅作品吧！' : '去配色练习里完成第一幅搭配吧！'}
            </p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <div key={w.id} className="card-kid overflow-hidden">
              <button data-testid="work-card" onClick={() => setView(w)} className="pressable block w-full">
                {w.dataUrl || w.previewDataUrl ? (
                  <img
                    src={w.dataUrl || w.previewDataUrl}
                    alt={w.title}
                    className="h-52 w-full bg-white object-contain"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center gap-2 bg-white">
                    {w.colors?.map((id, i) => (
                      <span key={i} className="h-20 w-20 rounded-2xl shadow" style={{ backgroundColor: colorById[id]?.hex }} />
                    ))}
                  </div>
                )}
              </button>
              <div className="p-4">
                <div className="font-btn text-slate-700">{w.title}</div>
                {w.emotion && <div className="mt-1 font-body text-teal-600">心情：{w.emotion}</div>}
                <div className="mt-1 font-body text-slate-400">{formatDate(w.createdAt)}</div>
                <button
                  onClick={() => deleteRecord(tab, w.id)}
                  className="mt-2 pressable rounded-full bg-red-50 px-4 py-1 font-body text-red-400"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {view && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6"
          onClick={() => setView(null)}
        >
          <div className="card-kid max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            {(view.dataUrl || view.previewDataUrl) && (
              <img src={view.dataUrl || view.previewDataUrl} alt={view.title} className="w-full rounded-3xl bg-white" />
            )}
            <h3 className="mt-4 font-cname text-slate-700" style={{ fontSize: 32 }}>
              {view.title}
            </h3>
            {view.emotion && <p className="mt-2 font-body text-teal-600">心情：{view.emotion}</p>}
            {view.note && <p className="mt-2 font-body text-slate-600">“{view.note}”</p>}
            {view.colors && (
              <div className="mt-3 flex gap-2">
                {view.colors.map((id, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full bg-slate-50 py-1 pl-2 pr-3 font-body text-slate-600">
                    <span className="h-5 w-5 rounded-full" style={{ backgroundColor: colorById[id]?.hex }} />
                    {colorById[id]?.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex gap-3">
              <KidButton variant="blue" data-testid="print-work" className="flex-1" onClick={() => doPrint(view, tab)}>
                🖨️ 打印这一页
              </KidButton>
              <KidButton variant="ghost" className="flex-1" onClick={() => setView(null)}>
                关闭
              </KidButton>
            </div>
          </div>
        </div>
      )}

      {printWork &&
        createPortal(
          <PrintSheet work={printWork.work} kind={printWork.kind} nickname={profile?.nickname || '小朋友'} />,
          document.body
        )}
    </div>
  );
}
