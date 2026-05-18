import { Zap } from 'lucide-react'
import type { TabId } from '../../types'

interface NavbarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'playground', label: 'Playground' },
  { id: 'diff',       label: 'Diff' },
  { id: 'docs',       label: 'Docs' },
]

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-kairo-600 shadow-lg shadow-kairo-500/30">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-white tracking-tight">kairo</span>
          </div>

          {/* Tab nav */}
          <nav aria-label="Main navigation">
            <div role="tablist" className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={[
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                    activeTab === tab.id
                      ? 'bg-neutral-700 text-neutral-100 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Vikrant-Mainwal/Kairo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              {/* <Github className="w-4 h-4" aria-hidden="true" /> */}
            </a>
          </div>

        </div>
      </div>
    </header>
  )
}
