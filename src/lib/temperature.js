// 色温色罩：全部在本地计算，不请求任何网络
// t ∈ [0,100]：0 最暖（更像黄昏），100 最冷（更像清晨），50 中性
export const WARM_TINT = '#FF7A1A';
export const COOL_TINT = '#3D8BFF';
export const MAX_TINT_OPACITY = 0.45;

export function temperatureOverlay(t) {
  const v = Math.max(0, Math.min(100, Number(t) || 0));
  const strength = Math.abs(v - 50) / 50; // 0..1，离中点越远色罩越浓
  const warm = v < 50;
  return {
    color: warm ? WARM_TINT : COOL_TINT,
    opacity: Math.round(strength * MAX_TINT_OPACITY * 100) / 100,
    band: v <= 35 ? 'dusk' : v >= 65 ? 'dawn' : 'noon',
  };
}

export const BAND_TEXT = {
  dusk: '更像黄昏了，画面暖暖的',
  noon: '不冷不热，像大中午',
  dawn: '更像清晨了，画面凉凉的',
};

export const BAND_EMOJI = { dusk: '🌇', noon: '☀️', dawn: '🌅' };
