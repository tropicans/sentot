export const navigation = ['Office', 'LPM Dashboard', 'Agents', 'Usage', 'Task Board', 'WBS & Timeline', 'Resource & Capacity', 'Revision Log', 'Deliverables', 'Approval Queue', 'Risk Register', 'Dependency Graph', 'Project Charter', 'Completion Report', 'Calendar', 'Activity', 'Memory', 'Folders', 'Logs', 'Settings'] as const
export type Page = typeof navigation[number]

/** The page shown when the address names no page (or an unknown one). */
export const HOME: Page = 'Office'

export function pageSlug(page: Page): string {
  return page.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')
}

export function pageFromHash(hash: string): Page {
  const slug = hash.replace(/^#\/?/, '').split('/')[0].toLowerCase()
  if (slug === 'knowledge') return 'Memory'
  // Preserve legacy dashboard links while directing them to LPM operational view.
  if (slug === 'dashboard') return 'LPM Dashboard'
  if (slug === 'wbs-timeline') return 'WBS & Timeline'
  return navigation.find((page) => pageSlug(page) === slug) ?? HOME
}
