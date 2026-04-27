export const LEVELS = [
  { level: 1, name: 'Mokinys', minXP: 0, emoji: '🌱' },
  { level: 2, name: 'Padėjėjas', minXP: 100, emoji: '⭐' },
  { level: 3, name: 'Administratorius', minXP: 300, emoji: '🌟' },
  { level: 4, name: 'Meistras', minXP: 700, emoji: '🏆' },
  { level: 5, name: 'Šefas', minXP: 1500, emoji: '👨‍🍳' },
]

export const XP_REWARDS = {
  add_expense: 10,
  add_revenue: 10,
  add_inventory_item: 15,
  update_inventory: 5,
  add_menu_item: 20,
  add_supplier: 15,
  daily_login: 5,
}

export function getLevelForXP(xp) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl
  }
  return current
}

export function getNextLevel(xp) {
  for (const lvl of LEVELS) {
    if (xp < lvl.minXP) return lvl
  }
  return null
}

export function getXPProgress(xp) {
  const current = getLevelForXP(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.minXP - current.minXP
  const progress = xp - current.minXP
  return Math.round((progress / range) * 100)
}

export function getStreakMessage(streak) {
  if (streak === 0) return 'Pradėk šiandien! 💪'
  if (streak === 1) return 'Pradžia padaryta! 🌱'
  if (streak < 7) return `${streak} dienos iš eilės! 🔥`
  if (streak < 30) return `${streak} dienų streak'as! 🚀`
  return `${streak} dienų legenda! 👑`
}
