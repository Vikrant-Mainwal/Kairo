import { useEffect, useState } from "react";
import {
  Zap,
  Plus,
  MessageSquare,
  GitCompare,
  BookOpen,
  Settings,
  Search,
  Cpu,
  ArrowLeftToLine,
  ArrowRightToLine,
  Menu,
  X,
} from "lucide-react";

import type { TabId } from "../../types";

interface ChatEntry {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  model: string;
  starred?: boolean;
}

const HISTORY_TODAY: ChatEntry[] = [
  {
    id: "c1",
    title: "Transformer attention explained",
    preview: "The attention mechanism works by...",
    timestamp: "Just now",
    model: "Sonnet 4",
    starred: true,
  },
  {
    id: "c2",
    title: "REST vs GraphQL tradeoffs",
    preview: "GraphQL gives clients control over...",
    timestamp: "12 min ago",
    model: "Haiku 4.5",
  },
];

const HISTORY_YESTERDAY: ChatEntry[] = [
  {
    id: "c3",
    title: "LCS algorithm implementation",
    preview: "The longest common subsequence...",
    timestamp: "Yesterday",
    model: "Sonnet 4",
  },
];

const HISTORY_OLDER: ChatEntry[] = [
  {
    id: "c4",
    title: "TypeScript generics deep dive",
    preview: "Generic types allow you to write...",
    timestamp: "Mon",
    model: "Sonnet 4",
  },
];

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "chats", label: "Chats", icon: Plus },
  { id: "playground", label: "Playground", icon: Cpu },
  { id: "diff", label: "Diff viewer", icon: GitCompare },
  { id: "docs", label: "Docs", icon: BookOpen },
];

function ChatRow({
  entry,
  active,
  collapsed,
  onClick,
}: {
  entry: ChatEntry;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={entry.title}
        className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
          active ? "bg-neutral-700" : "hover:bg-neutral-800"
        }`}
      >
        <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
        active ? "bg-neutral-800" : "hover:bg-neutral-800/60"
      }`}
    >
      <MessageSquare className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-medium text-neutral-200 truncate">
            {entry.title}
          </span>
        </div>
      </div>
    </button>
  );
}

function HistoryGroup({
  label,
  entries,
  activeChat,
  collapsed,
  onSelect,
}: {
  label: string;
  entries: ChatEntry[];
  activeChat: string | null;
  collapsed: boolean;
  onSelect: (id: string) => void;
}) {
  if (collapsed) {
    return (
      <div className="space-y-1">
        {entries.map((e) => (
          <ChatRow
            key={e.id}
            entry={e}
            active={activeChat === e.id}
            collapsed={true}
            onClick={() => onSelect(e.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="px-2.5 mb-1 text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
        {label}
      </p>

      <div className="space-y-0.5">
        {entries.map((e) => (
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
  );
}

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>("c1");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allHistory = [
    ...HISTORY_TODAY,
    ...HISTORY_YESTERDAY,
    ...HISTORY_OLDER,
  ];

  const filtered = searchQuery
    ? allHistory.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.preview.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  const handleTabChange = (tab: TabId) => {
    onTabChange(tab);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleChatSelect = (id: string) => {
    setActiveChat(id);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-4 z-60 p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        aria-label="Sidebar"
        className={`
          fixed md:relative top-0 left-0 z-50
          flex flex-col h-dvh border-r border-neutral-800 bg-neutral-950
          transition-all duration-300 ease-in-out shrink-0

          ${
            collapsed
              ? "md:w-16"
              : "md:w-70"
          }

          ${
            isMobile
              ? mobileOpen
                ? "translate-x-0 w-[85vw] max-w-70"
                : "-translate-x-full w-[85vw] max-w-70"
              : "translate-x-0"
          }
        `}
      >
        {/* Top */}
        <div
          className={`flex items-center h-14 border-b border-neutral-800/80 shrink-0 ${
            collapsed
              ? "justify-center px-2"
              : "justify-between px-3"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-kairo-600 shadow-lg shadow-kairo-500/30 shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>

              <span className="font-bold text-white tracking-tight text-lg">
                Kairo
              </span>
            </div>
          )}

          {/* Mobile Close */}
          {isMobile ? (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors"
            >
              {collapsed ? (
                <ArrowRightToLine className="w-4 h-4" />
              ) : (
                <ArrowLeftToLine className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="px-2 py-2 shrink-0 border-b border-neutral-800/60">
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center ${
                    collapsed && !isMobile
                      ? "justify-center"
                      : "gap-2.5"
                  } px-2.5 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-neutral-800 text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      activeTab === item.id
                        ? "text-kairo-400"
                        : ""
                    }`}
                  />

                  {(!collapsed || isMobile) && item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        {(!collapsed || isMobile) && (
          <div className="px-2 pt-3 pb-1 shrink-0">
            {searchOpen ? (
              <div className="flex items-center gap-1.5 px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg">
                <Search className="w-4 h-4 text-neutral-500 shrink-0" />

                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Escape" &&
                    (setSearchOpen(false), setSearchQuery(""))
                  }
                  placeholder="Search chats..."
                  className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none"
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search chats...
              </button>
            )}
          </div>
        )}

        {/* Chat History */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4 min-h-0">
          {filtered ? (
            filtered.length === 0 ? (
              <p className="px-2.5 text-sm text-neutral-600">
                No results found
              </p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((e) => (
                  <ChatRow
                    key={e.id}
                    entry={e}
                    active={activeChat === e.id}
                    collapsed={collapsed && !isMobile}
                    onClick={() => handleChatSelect(e.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <>
              <HistoryGroup
                label="Today"
                entries={HISTORY_TODAY}
                activeChat={activeChat}
                collapsed={collapsed && !isMobile}
                onSelect={handleChatSelect}
              />

              <HistoryGroup
                label="Yesterday"
                entries={HISTORY_YESTERDAY}
                activeChat={activeChat}
                collapsed={collapsed && !isMobile}
                onSelect={handleChatSelect}
              />

              <HistoryGroup
                label="This week"
                entries={HISTORY_OLDER}
                activeChat={activeChat}
                collapsed={collapsed && !isMobile}
                onSelect={handleChatSelect}
              />
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-neutral-800/80 p-2">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors">
            <Settings className="w-5 h-5 shrink-0" />

            {(!collapsed || isMobile) && "Settings"}
          </button>

          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-lg bg-neutral-900 border border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-kairo-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-white">
                  K
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-200 truncate">
                  Kairo User
                </p>

                <p className="text-[10px] text-neutral-600 truncate">
                  Free plan
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}