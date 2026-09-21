// 色彩心情课：12 种基础色各配一个情绪词和一句能读出来的话
import { BASE_COLORS } from './colors.js';

export const MOODS = [
  { colorId: 'red', mood: '热闹', sentence: '红色热热闹闹的，像过年挂起的大红灯笼。' },
  { colorId: 'orange', mood: '温暖', sentence: '橙色暖暖和和的，像晒在身上的太阳。' },
  { colorId: 'yellow', mood: '开心', sentence: '黄色亮亮堂堂的，像对你笑的向日葵。' },
  { colorId: 'green', mood: '舒服', sentence: '绿色清清爽爽的，躺在草地上真舒服。' },
  { colorId: 'cyan', mood: '清凉', sentence: '青色凉凉快快，像跳进清清的小湖。' },
  { colorId: 'blue', mood: '安静', sentence: '蓝色安安静静的，像夜晚平静的大海。' },
  { colorId: 'purple', mood: '神秘', sentence: '紫色神神秘秘的，像装着魔法的宝盒。' },
  { colorId: 'pink', mood: '甜甜', sentence: '粉色甜甜软软的，像一朵棉花糖。' },
  { colorId: 'brown', mood: '踏实', sentence: '棕色踏踏实实的，像抱着大树的小熊。' },
  { colorId: 'black', mood: '困困', sentence: '黑色让人困困的，小动物们都睡觉啦。' },
  { colorId: 'white', mood: '干净', sentence: '白色干干净净的，像刚洗好的小云朵。' },
  { colorId: 'gray', mood: '平静', sentence: '灰色平平静静的，像阴天里慢慢散步。' },
];

export const moodByColorId = Object.fromEntries(MOODS.map((m) => [m.colorId, m]));

// 心情课列表 = 12 基础色 + 各自的情绪词与句子（顺序与认色卡一致）
export const MOOD_CARDS = BASE_COLORS.map((c) => ({ ...c, ...moodByColorId[c.id] }));
