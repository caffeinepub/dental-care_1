import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Phone, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button
          onClick={() => {
            navigate({ to: '/' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl">🦷</span>
          </div>
          <span className="font-bold text-xl text-foreground">Satya Dental Care</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === link.href.substring(1)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+916352174912"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+91 635-217-4912</span>
          </a>
          <Button onClick={() => navigate({ to: '/booking' })} size="default" className="font-semibold">
            Book Appointment
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                      activeSection === link.href.substring(1)
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                <a
                  href="tel:+916352174912"
                  className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>+91 635-217-4912</span>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
