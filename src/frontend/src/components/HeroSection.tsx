import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home"
      className="relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center justify-center"
      style={{
        backgroundImage: 'url(/assets/generated/hero-dental-office.dim_1920x800.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
      
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Your Journey to a Beautiful Smile Starts Here
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto">
              Advanced technology and pain-free treatment at your trusted dental clinic
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/booking' })}
              className="text-lg px-8 py-6 h-auto font-semibold group bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
            >
              Book Appointment Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleContactClick}
              className="text-lg px-8 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all"
            >
              <Phone className="mr-2 w-5 h-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
