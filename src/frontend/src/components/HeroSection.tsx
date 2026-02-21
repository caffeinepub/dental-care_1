import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      className="relative overflow-hidden bg-background py-8 md:py-12"
    >
      {/* Dual Hero Images Layout with Boxes */}
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* First Hero Image Box - Clinic Scene with Main Content */}
          <Card className="relative overflow-hidden border-2 shadow-xl">
            <div 
              className="relative flex items-center justify-center min-h-[400px] lg:min-h-[600px]"
              style={{
                backgroundImage: 'url(/assets/generated/hero-clinic-scene.dim_1200x600.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
              
              <div className="relative z-10 py-12 md:py-16 px-6">
                <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left space-y-8">
                  <div className="space-y-6">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white animate-fade-in">
                      Your Journey to a Beautiful Smile Starts Here
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-white/95 animate-fade-in-delay-200">
                      Advanced technology and pain-free treatment at your trusted dental clinic
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4 animate-fade-in-delay-400">
                    <Button
                      size="lg"
                      onClick={() => navigate({ to: '/booking' })}
                      className="text-lg px-8 py-6 h-auto font-semibold group bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all shadow-lg animate-pulse-subtle"
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
            </div>
          </Card>

          {/* Second Hero Image Box - Promotional Banner with Sky Blue Gradient */}
          <Card className="relative overflow-hidden border-2 shadow-xl">
            <div 
              className="relative flex items-center justify-center min-h-[400px] lg:min-h-[600px] bg-gradient-to-b from-[#87CEEB] to-[#4682B4]"
            >
              <div className="relative z-10 text-center space-y-8 px-6 py-12 md:py-16 animate-fade-in-delay-200">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                    Best Smile With Us
                  </h2>
                  <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl px-12 py-8 shadow-2xl transform hover:scale-105 transition-transform">
                    <p className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary">
                      20% OFF
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-primary/80 mt-2">
                      On Your First Visit
                    </p>
                  </div>
                  <p className="text-lg md:text-xl text-white font-medium drop-shadow-md max-w-md mx-auto">
                    Experience world-class dental care with our special introductory offer
                  </p>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => navigate({ to: '/booking' })}
                  className="text-lg px-10 py-6 h-auto font-bold bg-white text-primary hover:bg-white/90 hover:scale-110 transition-all shadow-2xl"
                >
                  Claim Your Offer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
