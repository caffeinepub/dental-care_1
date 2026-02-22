import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/', type: 'route' as const },
  { name: 'Services', href: '/services', type: 'route' as const },
  { name: 'About', href: '#about', type: 'scroll' as const },
  { name: 'Testimonials', href: '#testimonials', type: 'scroll' as const },
  { name: 'Contact', href: '#contact', type: 'scroll' as const },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.filter(link => link.type === 'scroll').map(link => link.href.substring(1));
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

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsMenuOpen(false);
    
    if (link.type === 'route') {
      navigate({ to: link.href });
    } else {
      // For scroll links, navigate to home first if not already there
      if (location.pathname !== '/') {
        navigate({ to: '/' });
        // Wait for navigation then scroll
        setTimeout(() => {
          const element = document.getElementById(link.href.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(link.href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isActiveLink = (link: typeof navLinks[0]) => {
    if (link.type === 'route') {
      return location.pathname === link.href;
    }
    return activeSection === link.href.substring(1);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Annaya Dental Care</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActiveLink(link)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="tel:+916352174912" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
            <Phone className="w-4 h-4" />
            +91 635-217-4912
          </a>
          <Button 
            onClick={() => navigate({ to: '/booking' })}
            className="animate-pulse-subtle hover:animate-none"
          >
            Book Appointment
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className={`text-sm font-medium transition-colors hover:text-primary text-left ${
                  isActiveLink(link)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </button>
            ))}
            <a href="tel:+916352174912" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" />
              +91 635-217-4912
            </a>
            <Button 
              onClick={() => {
                setIsMenuOpen(false);
                navigate({ to: '/booking' });
              }}
              className="w-full"
            >
              Book Appointment
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
