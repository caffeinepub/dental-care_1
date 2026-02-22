import { Card, CardContent } from '@/components/ui/card';
import { Award, Cpu, Clock, DollarSign } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Award,
    title: 'Expert Doctors',
    description: '10+ years of professional experience with certified specialists',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
  {
    icon: Cpu,
    title: 'Modern Technology',
    description: 'Latest equipment and sterilization standards for safe treatment',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    icon: Clock,
    title: 'Emergency Care',
    description: '24/7 dental emergency support available for urgent cases',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    icon: DollarSign,
    title: 'Affordable Pricing',
    description: 'Quality treatment at competitive prices with flexible payment options',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
];

const galleryImages = [
  {
    src: '/assets/2021-06-17.webp',
    alt: 'Modern dental treatment room with equipment',
  },
  {
    src: '/assets/2021-06-17 (1).webp',
    alt: 'Comfortable patient treatment area',
  },
  {
    src: '/assets/2021-06-17 (2).webp',
    alt: 'Advanced dental equipment and sterilization setup',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;
  
  return (
    <Card 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 ${
        isVisible ? 'animate-slide-left' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="flex items-start gap-4 p-6">
        <div className={`w-14 h-14 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-7 h-7 ${feature.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GalleryImage({ image, index }: { image: typeof galleryImages[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden rounded-lg shadow-lg group aspect-[4/3] ${
        isVisible ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <img 
        src={image.src} 
        alt={image.alt}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

export default function WhyChooseUsSection() {
  return (
    <section id="about" className="bg-muted/30 py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe in providing the best care and service to our patients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Photo Gallery */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Our Facility</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Take a look at our modern clinic equipped with advanced technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <GalleryImage key={index} image={image} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
