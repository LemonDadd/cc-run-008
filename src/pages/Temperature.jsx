import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import SceneArt from '../components/SceneArt.jsx';
import { temperatureOverlay, BAND_TEXT, BAND_EMOJI } from '../lib/temperature.js';
import { speak, sfx } from '../lib/audio.js';

// 沿用情境用色的插画场景，预铺一层好看的颜色
const TEMP_SCENES = [
  {
    id: 'sky',
    name: '天空',
    emoji: '⛅',
    fills: { sky: '#BFE6FF', sun: '#FFD426', cloud1: '#FFFFFF', cloud2: '#FFFFFF', hill: '#3CB54A' },
  },
  {
    id: 'home',
    name: '小家',
    emoji: '🏠',
    fills: { sky: '#DCEFFE', ground: '#3CB54A', wall: '#F7F4EC', roof: '#E8384A', door: '#9C6433', win: '#FFD426' },
  },
  {
    id: 'sea',
    name: '大海',
    emoji: '🌊',
    fills: { water: '#2E7BE6', sand: '#FFD426', fish: '#FF8A1E', tail: '#FF8A1E', weed: '#3CB54A', rock: '#9AA0A6' },
  },
  {
    id: 'garden',
    name: '花园',
    emoji: '🌷',
    fills: { sky: '#DCEFFE', ground: '#3CB54A', f1: '#E8384A', f2: '#FF8FB3', f3: '#FFD426', stem: '#3CB54A' },
  },
];

export default function Temperature() {
  const [t, setT] = useState(50);
  const [sceneId, setSceneId] = useState('sky');
  const scene = TEMP_SCENES.find((s) => s.id === sceneId);
  // 色罩完全在本地计算，不发任何网络请求
  const overlay = temperatureOverlay(t);
  const bandText = BAND_TEXT[overlay.band];

  // 进入新时段（黄昏/中午/清晨）时读出来；无语音时静默降级
  useEffect(() => {
    speak(bandText);
  }, [bandText]);

  return (
    <div>
      <AppHeader title="色温：暖暖和凉凉" />
      <div className="mx-auto max-w-5xl px-6 py-6">
        <p className="font-body text-slate-500">
          同一幅画，罩上暖暖的颜色就像黄昏，罩上凉凉的颜色就像清晨。拖一拖滑条试试看！
        </p>

        {/* 场景选择 */}
        <div className="mt-4 flex flex-wrap gap-3">
          {TEMP_SCENES.map((s) => (
            <button
              key={s.id}
              data-scene={s.id}
              onClick={() => {
                setSceneId(s.id);
                sfx.click();
              }}
              className={`pressable rounded-full px-6 py-2.5 font-body shadow-soft ${
                sceneId === s.id ? 'bg-purple-500 text-white' : 'bg-white text-slate-600'
              }`}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        {/* 插画 + 色罩 */}
        <div className="card-kid mt-5 p-5">
          <div className="relative overflow-hidden rounded-[36px] bg-white shadow-soft">
            <SceneArt scene={scene.id} fills={scene.fills} className="w-full" />
            <div
              data-testid="temp-overlay"
              className="pointer-events-none absolute inset-0 transition-opacity duration-150"
              style={{ backgroundColor: overlay.color, opacity: overlay.opacity }}
            />
          </div>
          <div className="mt-4 text-center">
            <span data-testid="temp-text" className="font-cname text-slate-700" style={{ fontSize: 34 }}>
              {BAND_EMOJI[overlay.band]} {bandText}
            </span>
          </div>
        </div>

        {/* 暖 ↔ 冷 滑条 */}
        <div className="card-kid mt-5 p-6">
          <div className="flex items-center gap-4">
            <span className="shrink-0 font-btn text-orange-500">🔥 暖</span>
            <input
              type="range"
              min="0"
              max="100"
              value={t}
              data-testid="temp-slider"
              aria-label="色温滑条"
              onChange={(e) => setT(Number(e.target.value))}
              className="temp-slider w-full"
              style={{
                background: 'linear-gradient(90deg, #FF7A1A 0%, #FFD426 32%, #E9F4FF 50%, #9CC8FF 68%, #3D8BFF 100%)',
              }}
            />
            <span className="shrink-0 font-btn text-sky-500">❄️ 冷</span>
          </div>
          <p className="mt-3 text-center font-body text-slate-400">
            往左拉越来越暖，往右拉越来越冷
          </p>
        </div>
      </div>
    </div>
  );
}
