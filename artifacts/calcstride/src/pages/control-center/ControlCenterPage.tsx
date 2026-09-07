import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useUser, useClerk } from '@clerk/react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Search, 
  BarChart3, 
  DollarSign, 
  Calculator, 
  Database, 
  Activity, 
  Bell, 
  Blocks, 
  Bot, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Overview } from '@/components/control-center/Overview';
import { Projects } from '@/components/control-center/Projects';
import { Integrations } from '@/components/control-center/Integrations';
import { Assistant } from '@/components/control-center/Assistant';
import { Alerts } from '@/components/control-center/Alerts';
import { Approvals } from '@/components/control-center/Approvals';
import { StatusModule } from '@/components/control-center/StatusModule';
import { Settings } from '@/components/control-center/Settings';
import { FigureNestLogo } from '@/components/FigureNestLogo';

// We'll define all these sections below
const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, component: Overview },
  { id: 'projects', label: 'Projects', icon: FolderGit2, component: Projects },
  { id: 'seo', label: 'SEO', icon: Search, component: () => <StatusModule type="seo" sectionId="seo" /> },
  { id: 'traffic', label: 'Traffic', icon: BarChart3, component: () => <StatusModule type="traffic" sectionId="traffic" /> },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, component: () => <StatusModule type="revenue" sectionId="revenue" /> },
  { id: 'calculators', label: 'Calculators', icon: Calculator, component: () => <StatusModule type="calculators" sectionId="calculators" /> },
  { id: 'indexing', label: 'Indexing', icon: Database, component: () => <StatusModule type="indexing" sectionId="indexing" /> },
  { id: 'health', label: 'Site Health', icon: Activity, component: () => <StatusModule type="health" sectionId="health" /> },
  { id: 'alerts', label: 'Alerts', icon: Bell, component: Alerts },
  { id: 'approvals', label: 'Approvals', icon: Blocks, component: Approvals },
  { id: 'integrations', label: 'Integrations', icon: Blocks, component: Integrations },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, component: Assistant },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, component: Settings },
];

export function ControlCenterPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/control-center/:section');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSectionId = match && params?.section ? params.section : 'overview';
  const CurrentComponent = sections.find(s => s.id === currentSectionId)?.component || Overview;

  // Protect route
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation('/sign-in');
    }
  }, [isLoaded, isSignedIn, setLocation]);

  // Private route meta behavior
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const originalContent = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, noarchive');

    return () => {
      if (originalContent) {
        meta?.setAttribute('content', originalContent);
      } else {
        meta?.remove();
      }
    };
  }, []);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-sidebar">
        <div className="animate-pulse w-8 h-8 rounded-md bg-sidebar-primary/50" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar text-sidebar-foreground">
        <div className="brand-mark text-sidebar-foreground">
          <FigureNestLogo className="figurenest-logo-on-dark" />
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border
        transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <div className="brand-mark text-sidebar-foreground mb-1">
            <FigureNestLogo className="figurenest-logo-on-dark" />
          </div>
          <div className="text-xs text-sidebar-foreground/50 tracking-widest uppercase font-mono mt-1">Control Center</div>
        </div>

        <nav className="flex-1 px-4 py-4 md:py-0 space-y-1">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = currentSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setLocation(`/control-center/${section.id === 'overview' ? '' : section.id}`);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-sidebar-primary' : ''} />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-2">
              <span>Control Center</span>
              <ChevronRight size={14} />
              <span className="text-foreground capitalize">{currentSectionId}</span>
            </div>
            <h1 className="text-3xl font-serif font-semibold text-foreground tracking-tight">
              {sections.find(s => s.id === currentSectionId)?.label}
            </h1>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            <CurrentComponent />
          </div>
        </div>
      </main>
    </div>
  );
}
