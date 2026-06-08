一个以「打工人生」为主题的网页 RPG 模拟游戏。

> 让打工人"边上班边升级"的网页 RPG

## 🎮 简介

玩家扮演一名普通打工人，从实习生开始，在不断工作、摸鱼、学习、加班、处理需求与线上 Bug 的过程中成长升级，最终成为高级开发、技术主管、架构师甚至独立开发者。

## ✨ 功能特性

- **6 种工作模式** — 工作/摸鱼/学习/加班/开会/带薪拉屎，各有收益权衡
- **技能树系统** — 前端/后端/摸鱼/AI/管理 5 条技能路线，30+ 技能
- **装备系统** — 购买电脑/外设/消耗品/AI 装备，可装备卸下获得属性加成
- **随机事件** — 19 种职场事件（绩效评估、团建、裁员、涨薪谈判等）
- **Combo 连击** — 连续工作累积倍率，最高 x3
- **Sprint 冲刺** — 推进项目进度，满额交付获得大量奖励
- **Boss 战** — 回合制战斗，挑战 5 个 Boss（Deadline Demon → 重构巨人）
- **成就系统** — 20 个成就，自动解锁
- **每日任务 + 每日挑战** — 日常目标，奖励技能点
- **NPC 同事** — 与产品/测试/后端/设计聊天互动
- **每日运势** — 随机运势影响当日收益倍率
- **挂机收益** — 离线在线均有收益
- **数据分析/周报** — 成长曲线、属性雷达图、自动生成周报
- **4 种主题** — 默认暗色/暗紫/暗青绿/极简灰
- **键盘快捷键** — 1-6 切换模式、Q 工作、E 修 Bug、S 存档
- **云存档** — 自动保存 + 手动存档

## 🛠️ 技术栈

- **前端**: Vue 3 + Vite + JavaScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS 4
- **数据存储**: LocalStorage

## 🚀 快速开始

```bash
cd front
npm install
npm run dev
```

构建生产版本:

```bash
npm run build
```

## 📁 项目结构

```
Bug.exe/
├── front/                    # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   │   ├── WorkPanel.vue       # 主工作区
│   │   │   ├── EventPanel.vue      # 事件面板
│   │   │   ├── PlayerStats.vue     # 玩家属性
│   │   │   ├── SkillPanel.vue      # 已学技能 + 每日任务
│   │   │   ├── InventoryPanel.vue  # 背包 + 已装备
│   │   │   ├── LogPanel.vue        # 日志面板
│   │   │   ├── NpcPanel.vue        # 同事面板
│   │   │   ├── ChallengePanel.vue  # 挑战面板
│   │   │   ├── BossBattle.vue      # Boss 战弹窗
│   │   │   └── ToastPanel.vue      # 通知提示
│   │   ├── views/            # 页面
│   │   │   ├── HomePage.vue        # 首页
│   │   │   ├── GameMain.vue        # 主游戏页
│   │   │   ├── SkillTreePage.vue   # 技能树页
│   │   │   ├── ShopPage.vue        # 商店页
│   │   │   ├── AchievementsPage.vue # 成就页
│   │   │   ├── AnalyticsPage.vue   # 数据分析页
│   │   │   └── SettingsPage.vue    # 设置页
│   │   ├── stores/            # Pinia 状态管理
│   │   │   ├── player.js           # 玩家数据
│   │   │   ├── skill.js            # 技能系统
│   │   │   ├── equipment.js        # 装备/背包
│   │   │   ├── event.js            # 随机事件
│   │   │   ├── log.js              # 日志
│   │   │   ├── achievement.js      # 成就
│   │   │   ├── toast.js            # 通知
│   │   │   ├── npc.js              # NPC 同事
│   │   │   ├── challenge.js        # 每日挑战
│   │   │   ├── boss.js             # Boss 战
│   │   │   └── analytics.js        # 数据分析
│   │   ├── router/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                   # 后端（开发中）
├── 开发计划.md                 # 完整设计文档
└── README.md
```

## 🧑‍💻 开发计划

详见 [开发计划.md](开发计划.md)。

## 灵感来源

本项目灵感来自所有在格子间奋斗的打工人，以及各种职场梗文化。
