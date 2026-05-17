import { useState } from 'react'
// import { Navbar } from './components/layout/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { Playground } from './components/playground/Playground'
import { DiffView } from './components/diff-view/DiffView'
import { DocsSection } from './components/sections/DocsSection'
import type { TabId } from './types'
import { Sidebar } from './components/layout/Sidebar'

function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-800/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Kairo. Built with React + Vite + Tailwind.
        </p>
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <a
            href="https://docs.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-400 transition-colors"
          >
            Anthropic docs
          </a>
          <span>·</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabId>('playground')

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">

      {/* ── Sidebar ── */}
      <Sidebar activeTab={tab} onTabChange={setTab} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Slim topbar — breadcrumb only */}
        <header className="h-14 flex items-center px-6 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">kairo</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-200 font-medium capitalize">{tab}</span>
          </div>
        </header>

        {/* Scrollable body */}
        <main id="main-content" className="flex-1 overflow-y-auto">

          {/* Hero — playground only */}
          {tab === 'playground' && <HeroSection />}

          {/* Section title for diff / docs */}
          {tab !== 'playground' && (
            <div className="px-6 pt-10 pb-6">
              <h1 className="text-2xl font-semibold text-white">
                {tab === 'diff' ? 'Token diff viewer' : 'Documentation'}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-500">
                {tab === 'diff'
                  ? 'Compare model outputs at the token level using a hand-rolled LCS algorithm.'
                  : 'Architecture notes, algorithm docs, accessibility, and error handling.'}
              </p>
            </div>
          )}

          {/* Panel content */}
          <div className="px-6 pb-16">
            {tab === 'playground' && (
              <div className="animate-fade-in max-w-4xl">
                <Playground />
              </div>
            )}
            {tab === 'diff' && (
              <div className="animate-fade-in max-w-5xl">
                <DiffView />
              </div>
            )}
            {tab === 'docs' && (
              <div className="animate-fade-in max-w-3xl">
                <DocsSection />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
