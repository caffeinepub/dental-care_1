import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'dental-care';

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl">🦷</span>
              </div>
              <span className="font-bold text-xl">Dental Care</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced technology aur dard-mukt treatment ke saath aapka apna dental clinic.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Sampark Karein</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Phone: +91 98765 43210</p>
              <p>WhatsApp: +91 98765 43210</p>
              <p>Timing: Somvaar se Shanivaar</p>
              <p>9 AM - 8 PM</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Services</p>
              <p>About Us</p>
              <p>Contact</p>
              <p>Emergency Care</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {currentYear} Dental Care. Built with{' '}
            <Heart className="w-4 h-4 text-destructive fill-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
