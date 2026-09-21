import { useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import KidButton from '../components/KidButton.jsx';
import SceneArt from '../components/SceneArt.jsx';
import { speak, sfx } from '../lib/audio.js';

// 复用现有情境插画，给每个场景配一组默认颜色（仅本地展示用）
const SCENES = [
  {
    scene: 'home',
    emoji: '🏠',
    name: '小家',
    fills: { sky: '#CDE9FF', wall: '#FFF1D6', roof: '#E8584A', door: '#9C6433', win: '#FFE9A8', ground: '#8BD07A' },
  },
  {
    scene: 'sky',
    emoji: '⛅',
    name: '天空',
    fills: { sky: '#BFE6FF', sun: '#FFD426', cloud1: '#FFFFFF', cloud2: '#FFFFFF', hill: '#8BD07A' },
  },
  {
    scene: 'forest',
    emoji: '🌲',
    name: '森林',
    fills: { sky: '#CDE9FF', ground: '#8BD07A', trunk1: '#9C6433', leaf1: '#3CB54A', trunk2: '#9C6433', leaf2: '#6FCF7E' },
  },
  {
    scene: 'sea',
    emoji: '🐠',
    name: '海底',
    fills: { water: '#7FC4F5', sand: '#FFE1A8', fish: '#FF8A1E', tail: '#FFB25E', weed: '#3CB54A', rock: '#9AA0A6' },
  },
  {
    scene: 'garden',
    emoji: '🌷',
    name: '花园',
    fills: { sky: '#CDE9FF', ground: '#8BD07A', f1: '#FF8FB3', f2: '#E8384A', f3: '#FF8A1E', stem: '#3CB54A' },
  },
  {
    scene: 'city',
    emoji: '🏙️',
    name: '城市',
    fills: { sky: '#BFE6FF', b1: '#C7C2DD', b2: '#9AA0A6', b3: '#C7C2DD', moon: '#FFD426', ground: '#6E6E78' },
  },
];

const WARM_RGB = [255, 138, 30]; // 暖色罩：黄昏的光
const COOL_RGB = [46, 123, 230]; // 冷色罩：清晨的光

export default function Temperature() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [temp, setTemp] = useState(0); // -100 暖（黄昏） ↔ 0 ↔ 100 冷（清晨）
  const sc = SCENES[sceneIdx];

  const strength = Math.min(Math.abs(temp) / 100, 1);
  const rgb = temp < 0 ? WARM_RGB : COOL_RGB;
  // 色罩完全在本地计算：只叠一层半透明 rgba，不请求任何网络资源
  const overlay =
    temp === 0 ? 'rgba(0,0,0,0)' : `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(0.1 + strength * 0.35).toFixed(3)})`;

  const zone = temp <= -20 ? 'dusk' : temp >= 20 ? 'morning' : 'day';
  const caption = {
    dusk: { emoji: '🌇', text: '暖暖的光照下来，画面更像黄昏了' },
    morning: { emoji: '🌄', text: '冷冷的光照下来，画面更像清晨了' },
    day: { emoji: '☀️', text: '不冷不暖，就像白天的光' },
  }[zone];

  return (
    <div>
      <AppHeader title="色温小实验" />
      <div className="mx-auto max-w-5xl px-6 py-6">
        <p className="font-body text-slate-500">拖一拖滑条，给画面罩上暖暖或冷冷的光，看看感觉怎么变！</p>

        {/* 情境选择 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SCENES.map((s, i) => (
            <button
              key={s.scene}
              data-scene={s.scene}
              onClick={() => {
                setSceneIdx(i);
                sfx.click();
              }}
              className={`pressable flex items-center gap-2 rounded-full px-5 py-2.5 font-body shadow-soft ${
                i === sceneIdx ? 'bg-purple-500 text-white' : 'bg-white text-slate-600'
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              {s.name}
            </button>
          ))}
        </div>

        {/* 画面 + 色罩 */}
        <div className="relative mt-5 overflow-hidden rounded-[36px] bg-white shadow-soft">
          <SceneArt scene={sc.scene} fills={sc.fills} className="block w-full" />
          <div
            data-testid="temp-overlay"
            className="pointer-events-none absolute inset-0 transition-colors duration-150"
            style={{ backgroundColor: overlay }}
          />
        </div>

        {/* 冷暖滑条 */}
        <div className="card-kid mt-6 p-6">
          <div className="flex items-center gap-4">
            <span className="shrink-0 text-center font-body text-orange-500">
              🌇
              <br />
              暖·黄昏
            </span>
            <input
              data-testid="temp-slider"
              type="range"
              min={-100}
              max={100}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="temp-slider flex-1"
              aria-label="冷暖滑条"
            />
            <span className="shrink-0 text-center font-body text-sky-500">
              🌄
              <br />
              冷·清晨
            </span>
          </div>
          {temp !== 0 && (
            <p className="mt-2 text-center font-body text-slate-400">
              {temp < 0 ? '暖' : '冷'}色罩强度 {Math.round(strength * 100)}%
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p data-testid="temp-caption" className="font-cname text-slate-700" style={{ fontSize: 34 }}>
              {caption.emoji} {caption.text}
            </p>
            <KidButton variant="blue" sound={false} onClick={() => speak(caption.text)}>
              🔊 听一听
            </KidButton>
          </div>
        </div>
      </div>
    </div>
  );
}
