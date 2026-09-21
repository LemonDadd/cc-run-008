import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import KidButton from '../components/KidButton.jsx';
import { BASE_COLORS } from '../data/colors.js';
import { moodByColorId } from '../data/moods.js';
import { isLight } from '../lib/colorMath.js';
import { speak, sfx } from '../lib/audio.js';

export default function Mood() {
  const [colorId, setColorId] = useState(null);
  const index = Math.max(0, BASE_COLORS.findIndex((c) => c.id === colorId));
  const color = colorId ? BASE_COLORS[index] : null;
  const mood = color ? moodByColorId[color.id] : null;

  // 点进一色自动朗读（Web Speech 不可用时静默降级，页面照常能用）
  useEffect(() => {
    if (!color || !mood) return;
    const t = setTimeout(() => speak(`${color.name}，${mood.mood}。${mood.sentence}`), 300);
    return () => clearTimeout(t);
  }, [colorId]);

  // ---------------- 选色列表 ----------------
  if (!color) {
    return (
      <div>
        <AppHeader title="色彩心情课" />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="mb-6 font-body text-slate-500">点一个颜色，看看它藏着什么心情吧！</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {BASE_COLORS.map((c) => {
              const m = moodByColorId[c.id];
              return (
                <button
                  key={c.id}
                  data-mood-color={c.id}
                  onClick={() => {
                    sfx.click();
                    setColorId(c.id);
                  }}
                  className="pressable flex min-h-btn flex-col items-center gap-1 rounded-[32px] p-5 shadow-kid"
                  style={{
                    backgroundColor: c.hex,
                    color: isLight(c.hex) ? '#3b3550' : '#fff',
                  }}
                >
                  <span className="text-5xl">{c.emoji}</span>
                  <span className="font-btn">{c.name}</span>
                  <span className="font-body opacity-85">心情：{m.mood}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- 单色详情：大色块 + 情绪词 + 这句话 ----------------
  const light = isLight(color.hex);
  const go = (delta) => {
    const next = BASE_COLORS[(index + delta + BASE_COLORS.length) % BASE_COLORS.length];
    setColorId(next.id);
    sfx.click();
  };
  const readAloud = () => speak(`${color.name}，${mood.mood}。${mood.sentence}`);

  return (
    <div>
      <AppHeader title="色彩心情课" />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-2">
        {/* 大色块与情绪词 */}
        <div
          className="flex min-h-[62vh] flex-col items-center justify-center gap-4 rounded-[44px] shadow-kid"
          style={{
            background: `linear-gradient(165deg, ${color.hex}, ${color.hex}cc)`,
            color: light ? '#3b3550' : '#fff',
          }}
        >
          <span className="text-[110px] leading-none drop-shadow-lg">{color.emoji}</span>
          <span className="font-body text-2xl opacity-85">{color.name}的心情是</span>
          <span className="font-cname" style={{ fontSize: 84 }}>
            {mood.mood}
          </span>
        </div>

        {/* 这句话与朗读 */}
        <div className="flex flex-col gap-5">
          <div className="card-kid flex-1 p-8">
            <h2 className="font-cname text-slate-600" style={{ fontSize: 32 }}>
              它想对你说
            </h2>
            <p className="mt-4 font-body text-slate-700" style={{ fontSize: 28, lineHeight: 1.7 }}>
              {mood.sentence}
            </p>
            <KidButton
              variant="blue"
              data-testid="mood-speak"
              className="mt-6"
              sound={false}
              onClick={readAloud}
            >
              🔊 读给我听
            </KidButton>
          </div>
          <div className="flex gap-4">
            <KidButton variant="ghost" onClick={() => go(-1)}>
              ← 上一个
            </KidButton>
            <KidButton variant="primary" className="flex-1" onClick={() => setColorId(null)}>
              再挑一个颜色
            </KidButton>
            <KidButton variant="ghost" onClick={() => go(1)}>
              下一个 →
            </KidButton>
          </div>
        </div>
      </div>
    </div>
  );
}
