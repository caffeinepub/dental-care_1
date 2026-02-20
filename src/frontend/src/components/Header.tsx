import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl">🦷</span>
          </div>
          <span className="font-bold text-xl text-foreground">Dental Care</span>
        </button>

        <div className="flex items-center gap-4">
          <a
            href="tel:+919876543210"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+91 98765 43210</span>
          </a>
          <Button onClick={() => navigate({ to: '/booking' })} size="default" className="font-semibold">
            Appointment Book Karein
          </Button>
        </div>
      </div>
    </header>
  );
}
