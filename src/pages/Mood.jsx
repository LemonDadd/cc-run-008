import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import KidButton from '../components/KidButton.jsx';
import { MOOD_CARDS, moodByColorId } from '../data/moods.js';
import { colorById } from '../data/colors.js';
import { isLight } from '../lib/colorMath.js';
import { speak, sfx } from '../lib/audio.js';

// 色彩心情课：/mood 选色，/mood/:id 看大色块 + 情绪词 + 一句话
export default function Mood() {
  const { id } = useParams();
  const color = id ? colorById[id] : null;
  return color ? <MoodDetail color={color} /> : <MoodGrid />;
}

function MoodGrid() {
  const navigate = useNavigate();
  return (
    <div>
      <AppHeader title="色彩心情课" />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-6 font-body text-slate-500">
          颜色也有心情！点一个颜色，看看它藏着什么样的心情吧。
        </p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {MOOD_CARDS.map((c) => (
            <button
              key={c.id}
              data-mood={c.id}
              onClick={() => {
                sfx.click();
                navigate(`/mood/${c.id}`);
              }}
              className="pressable card-kid flex flex-col items-center gap-3 p-6"
            >
              <span
                className="flex h-28 w-28 items-center justify-center rounded-full text-5xl shadow-soft"
                style={{ backgroundColor: c.hex }}
              >
                {c.emoji}
              </span>
              <span className="font-btn text-slate-700">{c.name}</span>
              <span className="rounded-full bg-purple-50 px-4 py-1 font-body text-purple-500">
                {c.mood}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoodDetail({ color }) {
  const navigate = useNavigate();
  const mood = moodByColorId[color.id];
  const index = MOOD_CARDS.findIndex((c) => c.id === color.id);
  const light = isLight(color.hex);
  const line = `${color.name}，${mood.mood}。${mood.sentence}`;

  useEffect(() => {
    // 进入自动朗读（无语音或静音时静默降级，页面照常可用）
    const t = setTimeout(() => speak(line), 350);
    return () => clearTimeout(t);
  }, [color.id]);

  const go = (delta) => {
    const next = MOOD_CARDS[(index + delta + MOOD_CARDS.length) % MOOD_CARDS.length];
    navigate(`/mood/${next.id}`);
  };

  return (
    <div>
      <AppHeader title="色彩心情课" />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-2">
        {/* 大色块 + 情绪词 */}
        <div
          className="relative flex min-h-[62vh] flex-col items-center justify-center gap-4 overflow-hidden rounded-[44px] shadow-kid"
          style={{
            background: `linear-gradient(165deg, ${color.hex}, ${color.hex}cc)`,
            color: light ? '#3b3550' : '#fff',
          }}
        >
          <span className="text-[110px] leading-none drop-shadow-lg">{color.emoji}</span>
          <span className="font-body text-2xl opacity-85">{color.name}的心情是</span>
          <span className="font-cname" style={{ fontSize: 88 }}>
            {mood.mood}
          </span>
        </div>

        {/* 一句话 + 朗读 */}
        <div className="flex flex-col gap-5">
          <div className="card-kid flex-1 p-7">
            <h2 className="font-cname text-slate-600" style={{ fontSize: 32 }}>
              它想对你说
            </h2>
            <p className="mt-5 font-body text-slate-700" style={{ fontSize: 30, lineHeight: 1.7 }}>
              “{mood.sentence}”
            </p>
            <button
              data-testid="mood-speak"
              onClick={() => speak(line)}
              className="pressable mt-6 flex items-center gap-2 rounded-full bg-white px-7 py-4 font-btn text-slate-700 shadow-soft"
            >
              🔊 读给我听
            </button>
            <p className="mt-4 font-body text-slate-400">
              没有声音也没关系，自己读一读这句话吧。
            </p>
          </div>

          <div className="flex gap-4">
            <KidButton variant="ghost" onClick={() => go(-1)}>
              ← 上一个
            </KidButton>
            <KidButton variant="purple" className="flex-1" onClick={() => navigate('/mood')}>
              🎨 选别的颜色
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
