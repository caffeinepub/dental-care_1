import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Smile, Braces, Baby, Stethoscope, Clock, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

const services = [
  {
    icon: Stethoscope,
    title: 'Check-up & Cleaning',
    description: 'Rozana ki danton ki dekhbhal',
    color: 'text-chart-1',
    details: {
      procedure: 'Digital X-ray aur danton ki gehrai se safai (Scaling)',
      benefit: 'Cavity aur masoodon ki bimari se bachav',
      time: 'Sirf 30-45 minute',
      cta: 'Abhi check-up schedule karein',
    },
  },
  {
    icon: Heart,
    title: 'Root Canal Treatment (RCT)',
    description: 'Bina dard ke danton ka ilaaj',
    color: 'text-chart-2',
    details: {
      procedure: 'Sade hue hisse ko saaf karke danton ko bachana',
      feature: 'Single-sitting painless procedure (bin dard ke)',
      benefit: 'Asli daant ko nikaalne se bachata hai',
      cta: 'Dard se chutkara paayein',
    },
  },
  {
    icon: Smile,
    title: 'Dental Implants',
    description: 'Khoye hue danton ko wapas lagayein',
    color: 'text-chart-3',
    details: {
      procedure: 'Titanium post ke saath naye majboot daant lagana',
      life: 'Ye zindagi bhar saath dete hain',
      benefit: 'Khane-peene aur bolne mein asli danton jaisa mehsoos hota hai',
      cta: 'Apni muskurahat wapas paayein',
    },
  },
  {
    icon: Sparkles,
    title: 'Teeth Whitening',
    description: 'Chamakti muskurahat ke liye',
    color: 'text-chart-4',
    details: {
      procedure: 'Advanced laser technology se peelepan ko hatana',
      result: 'Pehle hi session mein 3-4 shades safed daant',
      benefit: 'Shaadi ya party ke liye turant chamak',
      cta: 'Chamakti muskurahat paayein',
    },
  },
  {
    icon: Braces,
    title: 'Braces & Aligners',
    description: 'Tedhe-medhe danton ka sahi alignment',
    color: 'text-chart-5',
    details: {
      procedure: 'Metal braces ya invisible aligners se danton ko seedha karna',
      feature: 'Comfortable aur effective treatment options',
      benefit: 'Perfect smile aur behtar oral health',
      duration: '6-18 mahine (case ke hisaab se)',
      cta: 'Perfect smile paayein',
    },
  },
  {
    icon: Baby,
    title: 'Pediatric Dentistry',
    description: 'Bachon ke danton ka khaas ilaaj',
    color: 'text-chart-1',
    details: {
      procedure: 'Bachon ke liye friendly aur gentle dental care',
      feature: 'Child-friendly environment aur painless treatment',
      benefit: 'Bachon mein dental health ki achi aadat',
      cta: 'Apne bachon ka check-up karwayein',
    },
  },
];

export default function ServicesSection() {
  const navigate = useNavigate();

  const handleBooking = () => {
    navigate({ to: '/booking' });
  };

  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Humari Suvidhayein</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hum aapko sabse behtareen dental care services provide karte hain
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <AccordionItem
              key={index}
              value={`service-${index}`}
              className="border-2 rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                <div className="flex items-center gap-4 text-left w-full">
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${service.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4 space-y-4 border-t">
                  {/* Procedure */}
                  {service.details.procedure && (
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Procedure:</p>
                        <p className="text-muted-foreground">{service.details.procedure}</p>
                      </div>
                    </div>
                  )}

                  {/* Special Feature */}
                  {service.details.feature && (
                    <div className="flex gap-3">
                      <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Khasiyat:</p>
                        <p className="text-muted-foreground">{service.details.feature}</p>
                      </div>
                    </div>
                  )}

                  {/* Life/Duration */}
                  {service.details.life && (
                    <div className="flex gap-3">
                      <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Durability:</p>
                        <p className="text-muted-foreground">{service.details.life}</p>
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {service.details.duration && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Duration:</p>
                        <p className="text-muted-foreground">{service.details.duration}</p>
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  {service.details.time && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Time:</p>
                        <p className="text-muted-foreground">{service.details.time}</p>
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {service.details.result && (
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Result:</p>
                        <p className="text-muted-foreground">{service.details.result}</p>
                      </div>
                    </div>
                  )}

                  {/* Benefit */}
                  {service.details.benefit && (
                    <div className="flex gap-3">
                      <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Fayda:</p>
                        <p className="text-muted-foreground">{service.details.benefit}</p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleBooking}
                      className="w-full sm:w-auto"
                      size="lg"
                    >
                      {service.details.cta}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
