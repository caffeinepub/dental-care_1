import { Outlet, useNavigate } from '@tanstack/react-router';
import { Shield } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Subtle Admin Access Button - Bottom Right Corner */}
      <button
        onClick={() => navigate({ to: '/admin' })}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center opacity-30 hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-lg z-40 group"
        aria-label="Admin Access"
        title="Admin Access"
      >
        <Shield className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}
