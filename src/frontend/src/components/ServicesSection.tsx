import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Smile, Braces, Baby, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const services = [
  {
    id: 'dental-checkup',
    icon: Stethoscope,
    title: 'Check-up & Cleaning',
    description: 'Comprehensive dental examination and professional cleaning to maintain optimal oral health',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    image: '/assets/generated/service-cleaning.dim_600x400.png',
  },
  {
    id: 'root-canal',
    icon: Heart,
    title: 'Root Canal Treatment',
    description: 'Pain-free tooth restoration with single-sitting painless procedures available',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    image: '/assets/generated/service-root-canal.dim_600x400.png',
  },
  {
    id: 'dental-implants',
    icon: Smile,
    title: 'Dental Implants',
    description: 'Permanent solution for missing teeth that feels and functions like natural teeth',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    image: '/assets/generated/service-implants.dim_600x400.png',
  },
  {
    id: 'teeth-whitening',
    icon: Sparkles,
    title: 'Teeth Whitening',
    description: 'Professional laser whitening for 3-4 shades brighter smile in just one session',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    image: '/assets/generated/patient-doctor-consultation.dim_800x600.png',
  },
  {
    id: 'braces-aligners',
    icon: Braces,
    title: 'Braces & Aligners',
    description: 'Metal braces or invisible aligners to correct misalignment and achieve perfect smile',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    image: '/assets/generated/dental-equipment-1.dim_800x600.png',
  },
  {
    id: 'pediatric-dentistry',
    icon: Baby,
    title: 'Pediatric Dentistry',
    description: 'Gentle and friendly dental care for kids in a child-friendly environment',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    image: '/assets/generated/patient-doctor-exam.dim_800x600.png',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We provide comprehensive dental care services with the latest technology
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300 group overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={`${service.title} - Professional dental service`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full ${service.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className={`w-8 h-8 ${service.color}`} />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
                <div className="flex flex-col gap-2">
                  <Link to="/services/$serviceId" params={{ serviceId: service.id }}>
                    <Button 
                      variant="outline"
                      className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/booking">
                    <Button 
                      className="w-full"
                    >
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Equipment Showcase */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">State-of-the-Art Equipment</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We use the latest dental technology to ensure the best treatment outcomes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <img 
              src="/assets/generated/dental-equipment-2.dim_800x600.png" 
              alt="Modern dental equipment and technology"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative overflow-hidden rounded-lg shadow-lg group">
            <img 
              src="/assets/generated/patient-doctor-consultation.dim_800x600.png" 
              alt="Patient consultation with dentist"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
