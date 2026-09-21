import { MATCHING_EXERCISES, evaluateTheme } from '/workspace/src/data/exercises.js';
import { evaluateRule, COMPLEMENTARY_PAIRS, TRIADS, SPLIT_COMPLEMENTS } from '/workspace/src/lib/colorWheel.js';
import { evaluateScene, SCENE_TASKS } from '/workspace/src/data/scenes.js';
import { BASE_COLORS } from '/workspace/src/data/colors.js';
import { MOODS, moodByColorId } from '/workspace/src/data/moods.js';
import { weekKey } from '/workspace/src/lib/util.js';
import { mixPigments, MIX_RULES } from '/workspace/src/lib/mixEngine.js';
import { deltaEHex } from '/workspace/src/lib/colorMath.js';
import assert from 'node:assert';

let pass=0, fail=0;
const ok=(c,m)=>{ if(c){pass++;} else {fail++; console.log('FAIL:',m);} };

// 1. 50 题，答案全部符合规则
ok(MATCHING_EXERCISES.length===50, 'exercises = 50, got '+MATCHING_EXERCISES.length);
for(const e of MATCHING_EXERCISES){
  if(e.kind==='theme'){ continue; }
  const r = evaluateRule(e.rule, e.answer);
  ok(r.ok, `exercise ${e.id} answer passes rule (${r.explanation})`);
}
// 错误组合不通过
ok(evaluateRule('complementary',['red','orange']).ok===false,'red+orange not complementary');
ok(evaluateRule('analogous',['red','green']).ok===false,'red+green not analogous');
ok(evaluateRule('triadic',['red','orange','yellow']).ok===false,'r+o+y not triadic');
ok(evaluateRule('split',['red','green','blue']).ok===false,'r+g+b not split');

// 2. 混色 20 规则的结果可计算且为合法 hex
ok(MIX_RULES.length===20,'20 mix rules');
for(const r of MIX_RULES){
  const h = mixPigments(r.drops);
  ok(/^#[0-9a-f]{6}$/.test(h), `mix ${r.id} valid hex: ${h}`);
}
// 关键混色精确
ok(deltaEHex(mixPigments({red:1,yellow:1}), '#FF8A1E') < 1, 'red+yellow=orange');
ok(deltaEHex(mixPigments({yellow:1,blue:1}), '#3CB54A') < 1, 'yellow+blue=green');
ok(deltaEHex(mixPigments({red:1,blue:1}), '#8A4FD0') < 1, 'red+blue=purple');
ok(deltaEHex(mixPigments({red:1,yellow:1,blue:1}), '#8A6A44') < 1, 'r+y+b=brown');

// 3. 30 情境任务 + 判定
ok(SCENE_TASKS.length===30, '30 scene tasks');
const warmScene = evaluateScene({minWarm:2}, ['red','orange','yellow'], BASE_COLORS);
ok(warmScene.ok===true,'warm criterion pass');
ok(evaluateScene({minWarm:2}, ['blue','cyan','green'], BASE_COLORS).ok===false,'warm criterion fail');
ok(evaluateScene({minCool:1,neutralMin:1}, ['blue','gray','black'], BASE_COLORS).ok===true,'cool+neutral pass');

// 4. 主题判定
const rainy = MATCHING_EXERCISES.find(e=>e.themeName==='雨天');
ok(evaluateTheme(rainy.criterion,['blue','cyan','gray'],BASE_COLORS,'雨天').ok===true,'rainy theme pass');
ok(evaluateTheme(rainy.criterion,['red','orange','yellow'],BASE_COLORS,'雨天').ok===false,'rainy theme reject warm');

// 5. 心情课：12 种基础色每色都有情绪词和能读出来的句子
ok(MOODS.length===12, '12 moods, got '+MOODS.length);
ok(new Set(MOODS.map(m=>m.colorId)).size===12, 'mood colorIds unique');
for(const c of BASE_COLORS){
  const m = moodByColorId[c.id];
  ok(m && m.mood.length>=2 && m.sentence.length>=6, `mood for ${c.id} has word+sentence`);
}

// 6. ISO 周 key（本周观察任务按周归档）
ok(/^\d{4}-W\d{2}$/.test(weekKey()), 'weekKey format: '+weekKey());
ok(weekKey(new Date(2026,0,1))==='2026-W01', '2026-01-01 in W01, got '+weekKey(new Date(2026,0,1)));
ok(weekKey(new Date(2026,8,21))==='2026-W39', '2026-09-21 in W39, got '+weekKey(new Date(2026,8,21)));

console.log(`\nlogic: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
