import { useState } from 'react'
import {
  Zap, Plus, MessageSquare, GitCompare, BookOpen,
  ChevronLeft, ChevronRight, Settings,
  Search, Trash2, MoreHorizontal, Cpu, Star,
} from 'lucide-react'
import type { TabId } from '../../types'

// ─── Dummy chat history data ──────────────────────────────────

interface ChatEntry {
  id: string
  title: string
  preview: string
  timestamp: string
  model: string
  starred?: boolean
}

const HISTORY_TODAY: ChatEntry[] = [
  { id: 'c1', title: 'Transformer attention explained', preview: 'The attention mechanism works by...', timestamp: 'Just now', model: 'Sonnet 4', starred: true },
  { id: 'c2', title: 'REST vs GraphQL tradeoffs', preview: 'GraphQL gives clients control over...', timestamp: '12 min ago', model: 'Haiku 4.5' },
  { id: 'c3', title: 'Haiku about distributed systems', preview: 'Nodes drift apart, yet...', timestamp: '1 hr ago', model: 'Sonnet 4' },
  { id: 'c4', title: 'CAP theorem breakdown', preview: 'In a distributed system you can only...', timestamp: '3 hr ago', model: 'Llama 3.3' },
]

const HISTORY_YESTERDAY: ChatEntry[] = [
  { id: 'c5', title: 'LCS algorithm implementation', preview: 'The longest common subsequence...', timestamp: 'Yesterday', model: 'Sonnet 4', starred: true },
  { id: 'c6', title: 'Concurrency vs parallelism', preview: 'Concurrency is about dealing with...', timestamp: 'Yesterday', model: 'Haiku 4.5' },
  { id: 'c7', title: 'Docker multi-stage builds', preview: 'Using multi-stage builds reduces...', timestamp: 'Yesterday', model: 'Mixtral 8x7B' },
]

const HISTORY_OLDER: ChatEntry[] = [
  { id: 'c8',  title: 'TypeScript generics deep dive', preview: 'Generic types allow you to write...', timestamp: 'Mon', model: 'Sonnet 4' },
  { id: 'c9',  title: 'React Suspense patterns', preview: 'Suspense lets you declaratively...', timestamp: 'Mon', model: 'Sonnet 4' },
  { id: 'c10', title: 'Tailwind dark mode setup', preview: 'The darkMode config in tailwind...', timestamp: 'Sun', model: 'Haiku 4.5' },
  { id: 'c11', title: 'Vite vs Webpack comparison', preview: 'Vite uses native ES modules in dev...', timestamp: 'Sat', model: 'Llama 3.3' },
  { id: 'c12', title: 'AbortController in fetch', preview: 'AbortController lets you cancel...', timestamp: 'Fri', model: 'Sonnet 4' },
]

// ─── Nav items ────────────────────────────────────────────────

interface NavItem {
  id: TabId
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'playground', label: 'Playground', icon: Cpu },
  { id: 'diff',       label: 'Diff viewer', icon: GitCompare },
  { id: 'docs',       label: 'Docs',        icon: BookOpen },
]

// ─── Sub-components ───────────────────────────────────────────

function ChatRow({
  entry,
  active,
  collapsed,
  onClick,
}: {
  entry: ChatEntry
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const [hovering, setHovering] = useState(false)

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={entry.title}
        className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
          active ? 'bg-neutral-700' : 'hover:bg-neutral-800'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`w-full group flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
        active ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium text-neutral-200 truncate">{entry.title}</span>
          {entry.starred && !hovering && (
            <Star className="w-2.5 h-2.5 text-kairo-400 shrink-0 fill-current" aria-hidden="true" />
          )}
          {hovering && (
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300 transition-colors">
                <MoreHorizontal className="w-3 h-3" />
              </span>
              <span className="p-0.5 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 truncate mt-0.5">{entry.preview}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-neutral-600">{entry.timestamp}</span>
          <span className="text-[10px] text-neutral-700">·</span>
          <span className="text-[10px] text-neutral-600">{entry.model}</span>
        </div>
      </div>
    </button>
  )
}

function HistoryGroup({
  label,
  entries,
  activeChat,
  collapsed,
  onSelect,
}: {
  label: string
  entries: ChatEntry[]
  activeChat: string | null
  collapsed: boolean
  onSelect: (id: string) => void
}) {
  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {entries.map(e => (
          <ChatRow
            key={e.id}
            entry={e}
            active={activeChat === e.id}
            collapsed={true}
            onClick={() => onSelect(e.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <p className="px-2.5 mb-1 text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
        {label}
      </p>
      <div className="space-y-0.5">
        {entries.map(e => (
          <ChatRow
            key={e.id}
            entry={e}
            active={activeChat === e.id}
            collapsed={false}
            onClick={() => onSelect(e.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>('c1')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const allHistory = [...HISTORY_TODAY, ...HISTORY_YESTERDAY, ...HISTORY_OLDER]
  const filtered = searchQuery
    ? allHistory.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <aside
      aria-label="Sidebar"
      className={`
        relative flex flex-col h-screen border-r border-neutral-800 bg-neutral-950
        transition-all duration-200 ease-in-out shrink-0
        ${collapsed ? 'w-[56px]' : 'w-[240px]'}
      `}
    >
      {/* ── Top: logo + new chat ── */}
      <div className={`flex items-center h-14 border-b border-neutral-800/80 shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-3'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-kairo-600 shadow-lg shadow-kairo-500/30 shrink-0">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">kairo</span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-kairo-600 shadow-lg shadow-kairo-500/30">
            <Zap className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setActiveChat(null)}
            aria-label="New chat"
            title="New chat"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Nav items ── */}
      <div className={`${collapsed ? 'px-2 py-2' : 'px-2 py-2'} shrink-0 border-b border-neutral-800/60`}>
        {collapsed ? (
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-neutral-800 text-kairo-400'
                      : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === item.id ? 'text-kairo-400' : ''}`} aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Search ── */}
      {!collapsed && (
        <div className="px-2 pt-3 pb-1 shrink-0">
          {searchOpen ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg">
              <Search className="w-3 h-3 text-neutral-500 shrink-0" aria-hidden="true" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
                placeholder="Search chats…"
                className="flex-1 bg-transparent text-xs text-neutral-200 placeholder-neutral-600 outline-none"
                aria-label="Search chat history"
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50 transition-colors"
            >
              <Search className="w-3 h-3" aria-hidden="true" />
              Search chats…
            </button>
          )}
        </div>
      )}

      {/* ── Chat history (scrollable) ── */}
      <nav
        aria-label="Chat history"
        className="flex-1 overflow-y-auto px-2 py-2 space-y-4 min-h-0"
      >
        {collapsed ? (
          /* Collapsed: just icons */
          <div className="space-y-0.5">
            {allHistory.map(e => (
              <ChatRow
                key={e.id}
                entry={e}
                active={activeChat === e.id}
                collapsed={true}
                onClick={() => setActiveChat(e.id)}
              />
            ))}
          </div>
        ) : filtered ? (
          /* Search results */
          filtered.length === 0 ? (
            <p className="px-2.5 text-xs text-neutral-600 mt-2">No results for "{searchQuery}"</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map(e => (
                <ChatRow key={e.id} entry={e} active={activeChat === e.id} collapsed={false} onClick={() => setActiveChat(e.id)} />
              ))}
            </div>
          )
        ) : (
          /* Grouped history */
          <>
            <HistoryGroup label="Today"     entries={HISTORY_TODAY}     activeChat={activeChat} collapsed={false} onSelect={setActiveChat} />
            <HistoryGroup label="Yesterday" entries={HISTORY_YESTERDAY} activeChat={activeChat} collapsed={false} onSelect={setActiveChat} />
            <HistoryGroup label="This week" entries={HISTORY_OLDER}     activeChat={activeChat} collapsed={false} onSelect={setActiveChat} />
          </>
        )}
      </nav>

      {/* ── Bottom: settings + github ── */}
      <div className={`shrink-0 border-t border-neutral-800/80 py-2 ${collapsed ? 'px-2' : 'px-2'}`}>
        {collapsed ? (
          <div className="space-y-0.5">
            <button title="Settings" aria-label="Settings" className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub" className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
              {/* <Github className="w-4 h-4" aria-hidden="true" /> */}
            </a>
          </div>
        ) : (
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors">
              <Settings className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Settings
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors"
            >
              {/* <Github className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> */}
              GitHub
            </a>
            {/* User badge */}
            <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg bg-neutral-900 border border-neutral-800">
              <div className="w-6 h-6 rounded-full bg-kairo-600 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-white">K</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-200 truncate">kairo user</p>
                <p className="text-[10px] text-neutral-600 truncate">Free plan</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-[54px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors shadow-lg"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" aria-hidden="true" />
          : <ChevronLeft  className="w-3 h-3" aria-hidden="true" />
        }
      </button>
    </aside>
  )
}
