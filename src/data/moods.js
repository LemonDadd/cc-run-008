// 色彩心情课：12 种基础色各配一个情绪词和一句能读出来的话
export const MOODS = [
  { colorId: 'red', mood: '热闹', sentence: '红色热热闹闹的，像过年时挂起来的红灯笼。' },
  { colorId: 'orange', mood: '温暖', sentence: '橙色暖暖和和的，像妈妈手里那碗热热的汤。' },
  { colorId: 'yellow', mood: '开心', sentence: '黄色亮亮堂堂的，像太阳公公在对我笑。' },
  { colorId: 'green', mood: '舒服', sentence: '绿色清清爽爽的，像躺在软软的草地上。' },
  { colorId: 'cyan', mood: '凉快', sentence: '青色凉凉快快的，像夏天里的一口薄荷糖。' },
  { colorId: 'blue', mood: '安静', sentence: '蓝色安安静静的，像夜晚里平静的大海。' },
  { colorId: 'purple', mood: '神秘', sentence: '紫色神神秘秘的，像魔法师的斗篷。' },
  { colorId: 'pink', mood: '甜甜', sentence: '粉色甜甜软软的，像一朵大大的棉花糖。' },
  { colorId: 'brown', mood: '踏实', sentence: '棕色踏踏实实的，像小熊抱着粗粗的大树。' },
  { colorId: 'black', mood: '酷酷', sentence: '黑色酷酷的，像夜里飞过的超级英雄。' },
  { colorId: 'white', mood: '干净', sentence: '白色干干净净的，像刚洗过澡的小云朵。' },
  { colorId: 'gray', mood: '平静', sentence: '灰色平平静静的，像下雨天慢慢爬的小蜗牛。' },
];

export const moodByColorId = Object.fromEntries(MOODS.map((m) => [m.colorId, m]));
