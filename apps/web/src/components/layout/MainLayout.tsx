import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-brand-bg font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-brand-dark p-3 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors mr-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-7 h-7 rounded bg-brand-green flex items-center justify-center text-white font-bold text-xs tracking-wide shadow-sm shadow-brand-green/20">
            IN
          </div>
          <span className="text-white font-semibold text-sm leading-tight">Inmobiliaria CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsDropdown />
        </div>
      </div>

      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
