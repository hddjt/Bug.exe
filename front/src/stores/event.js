import { ref } from 'vue'
import { defineStore } from 'pinia'

const EVENT_POOL = [
  {
    id: 'requirement-change',
    title: '产品改需求',
    description: '产品经理："这个需求改一下，很简单"',
    options: [
      { text: '接受修改', effects: { exp: 10, san: -5 } },
      { text: '反驳', effects: { productRelation: -5 } },
      { text: '假装没看到', effects: { happiness: 10, bossRelation: -3 } },
    ],
  },
  {
    id: 'bug-incident',
    title: '线上白屏',
    description: '用户反馈线上页面白屏了！紧急！',
    options: [
      { text: '立即修复', effects: { exp: 15, san: -8 } },
      { text: '百度一下', effects: { debug: 1 } },
      { text: '求助AI', effects: { debug: 2 } },
      { text: '甩锅给后端', effects: { productRelation: -5, colleagueRelation: -5 } },
    ],
  },
  {
    id: 'meeting',
    title: '周会时间',
    description: '老板召集全员开周会',
    options: [
      { text: '认真听讲', effects: { exp: 5, san: -2 } },
      { text: '假装认真', effects: {} },
      { text: '偷偷玩手机', effects: { happiness: 10 } },
    ],
  },
  {
    id: 'slack-opportunity',
    title: '老板出门了',
    description: '老板走出办公室，看起来要出去一会儿！',
    options: [
      { text: '摸鱼！', effects: { happiness: 20, exp: -3 } },
      { text: '继续工作', effects: { exp: 5, happiness: -2 } },
    ],
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: '同事请你帮忙 Review 代码',
    options: [
      { text: '认真 Review', effects: { exp: 8, coding: 0.5, san: -3 } },
      { text: '随便看看', effects: { colleagueRelation: 2 } },
      { text: '没空', effects: { colleagueRelation: -5 } },
    ],
  },
  {
    id: 'new-framework',
    title: '新框架发布',
    description: '社区发布了最新前端框架，大家都在讨论',
    options: [
      { text: '深入学习', effects: { learning: 2, tech: 1, san: -3 } },
      { text: '简单了解', effects: { tech: 0.5 } },
      { text: '与我无关', effects: {} },
    ],
  },
  {
    id: 'overtime',
    title: '加班通知',
    description: '主管说今晚需要加班赶需求',
    options: [
      { text: '接受加班', effects: { exp: 20, money: 500, san: -10, happiness: -5 } },
      { text: '拒绝', effects: { bossRelation: -10, happiness: 5 } },
      { text: '摸鱼加班', effects: { exp: 5, money: 200, happiness: 5 } },
    ],
  },
  {
    id: 'colleague-help',
    title: '同事求助',
    description: '新来的同事遇到了一个棘手的问题，向你求助',
    options: [
      { text: '热心帮忙', effects: { colleagueRelation: 10, debug: 1, san: -3 } },
      { text: '让他自己查', effects: { colleagueRelation: -5 } },
    ],
  },
  {
    id: 'performance-review',
    title: '绩效评估',
    description: '主管找你做季度绩效面谈："说说你最近的表现"',
    options: [
      { text: '突出工作成果', effects: { bossRelation: 8, money: 1000, san: -3 } },
      { text: '谦虚低调', effects: { bossRelation: 3 } },
      { text: '疯狂吐槽公司', effects: { bossRelation: -15, happiness: 10, colleagueRelation: 5 } },
    ],
  },
  {
    id: 'team-building',
    title: '团建通知',
    description: 'HR 通知本周末组织团建活动',
    options: [
      { text: '积极参加', effects: { colleagueRelation: 10, happiness: 5, san: -3 } },
      { text: '找借口不去', effects: { happiness: 10, colleagueRelation: -5 } },
      { text: '表面答应当天请假', effects: { colleagueRelation: -2, bossRelation: -3 } },
    ],
  },
  {
    id: 'salary-negotiation',
    title: '涨薪谈判',
    description: '你鼓起勇气走进老板办公室谈涨薪',
    options: [
      { text: '理性陈述贡献', effects: { bossRelation: 5, money: 5000, luck: 2 } },
      { text: '拿 offer 威胁', effects: { money: 8000, bossRelation: -10 } },
      { text: '算了，下次再说', effects: { san: -5, happiness: -3 } },
    ],
  },
  {
    id: 'layoff-rumor',
    title: '裁员风波',
    description: '公司内部流传着裁员的消息，人心惶惶',
    options: [
      { text: '加倍表现', effects: { bossRelation: 5, san: -8, exp: 10 } },
      { text: '暗中投简历', effects: { luck: 3, coding: 1 } },
      { text: '躺平观望', effects: { happiness: 5, bossRelation: -5 } },
    ],
  },
  {
    id: 'server-down',
    title: '服务器宕机',
    description: '线上服务器突然挂了，用户炸锅了！',
    options: [
      { text: '紧急回滚', effects: { exp: 20, debug: 1, san: -5 } },
      { text: '通宵修复', effects: { exp: 30, money: 500, san: -15, happiness: -5 } },
      { text: '呼叫 DBA', effects: { colleagueRelation: -3, debug: 2 } },
    ],
  },
  {
    id: 'standup-meeting',
    title: '每日站会',
    description: 'Scrum Master："今天你做了什么？"',
    options: [
      { text: '认真汇报进度', effects: { bossRelation: 3, exp: 3 } },
      { text: '编点内容混过去', effects: { happiness: 3 } },
      { text: '假装网络卡了', effects: { bossRelation: -3, happiness: 8 } },
    ],
  },
  {
    id: 'new-intern',
    title: '新实习生',
    description: '主管安排你带一个新来的实习生',
    options: [
      { text: '认真带教', effects: { colleagueRelation: 10, learning: 2, san: -5 } },
      { text: '丢一堆文档让他自学', effects: { colleagueRelation: -3 } },
      { text: '甩给其他同事', effects: { colleagueRelation: -8, bossRelation: -5 } },
    ],
  },
  {
    id: 'hackathon',
    title: '黑客马拉松',
    description: '公司举办 48 小时黑客松大赛',
    options: [
      { text: '报名参加', effects: { coding: 3, tech: 2, happiness: 10, san: -10 } },
      { text: '当观众划水', effects: { tech: 1, happiness: 5 } },
      { text: '趁机摸鱼两天', effects: { happiness: 20, bossRelation: -5 } },
    ],
  },
  {
    id: 'tech-sharing',
    title: '技术分享',
    description: '同事邀请你给团队做一次技术分享',
    options: [
      { text: '精心准备', effects: { exp: 15, tech: 2, bossRelation: 5, san: -5 } },
      { text: '随便讲讲', effects: { exp: 5, colleagueRelation: 2 } },
      { text: '推掉', effects: { bossRelation: -3, happiness: 3 } },
    ],
  },
  {
    id: 'on-call',
    title: '值班 On-call',
    description: '轮到你这周 On-call 值班了',
    options: [
      { text: '24小时待命', effects: { exp: 15, money: 500, san: -8 } },
      { text: '带电脑随时响应', effects: { exp: 8, san: -3 } },
      { text: '假装没看到群消息', effects: { happiness: 10, bossRelation: -10 } },
    ],
  },
]

export const useEventStore = defineStore('event', () => {
  const currentEvent = ref(null)
  const pool = ref(EVENT_POOL)

  function triggerRandom() {
    const idx = Math.floor(Math.random() * pool.value.length)
    currentEvent.value = { ...pool.value[idx] }
    return currentEvent.value
  }

  function dismiss() {
    currentEvent.value = null
  }

  return { currentEvent, pool, triggerRandom, dismiss }
})
