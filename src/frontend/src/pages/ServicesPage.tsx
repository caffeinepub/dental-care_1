import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Heart, 
  Smile, 
  Braces, 
  Baby, 
  Stethoscope, 
  ArrowRight,
  Activity,
  Scissors,
  Crown,
  Users,
  Syringe,
  AlertCircle,
  Wand2,
  Shield,
  HeartPulse
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const services = [
  {
    id: 'dental-checkup',
    icon: Stethoscope,
    title: 'Check-up & Cleaning',
    description: 'Comprehensive dental examination and professional cleaning to maintain optimal oral health. Regular check-ups help detect issues early and keep your smile healthy.',
    image: '/assets/generated/service-cleaning.dim_600x400.png',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    duration: '45-60 minutes',
  },
  {
    id: 'root-canal',
    icon: Heart,
    title: 'Root Canal Treatment',
    description: 'Pain-free tooth restoration with single-sitting painless procedures available. Save your natural tooth and eliminate pain with our advanced endodontic techniques.',
    image: '/assets/generated/service-root-canal.dim_600x400.png',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    duration: '60-90 minutes',
  },
  {
    id: 'dental-implants',
    icon: Smile,
    title: 'Dental Implants',
    description: 'Permanent solution for missing teeth that feels and functions like natural teeth. Restore your smile with our computer-guided implant placement technology.',
    image: '/assets/generated/service-implants.dim_600x400.png',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    duration: '3-6 months total',
  },
  {
    id: 'teeth-whitening',
    icon: Sparkles,
    title: 'Teeth Whitening',
    description: 'Professional laser whitening for 3-4 shades brighter smile in just one session. Safe, effective, and delivers immediate results for a confident smile.',
    image: '/assets/generated/patient-doctor-consultation.dim_800x600.png',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    duration: '60-90 minutes',
  },
  {
    id: 'braces-aligners',
    icon: Braces,
    title: 'Braces & Aligners',
    description: 'Metal braces or invisible aligners to correct misalignment and achieve perfect smile. Customized orthodontic treatment plans for all ages.',
    image: '/assets/generated/dental-equipment-1.dim_800x600.png',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    duration: '12-24 months',
  },
  {
    id: 'pediatric-dentistry',
    icon: Baby,
    title: 'Pediatric Dentistry',
    description: 'Gentle and friendly dental care for kids in a child-friendly environment. Building healthy dental habits from an early age with compassionate care.',
    image: '/assets/generated/patient-doctor-exam.dim_800x600.png',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    duration: '30-45 minutes',
  },
  {
    id: 'gum-treatment',
    icon: Activity,
    title: 'Gum Disease Treatment',
    description: 'Comprehensive periodontal care to treat and prevent gum disease. Advanced scaling and root planing procedures to restore gum health and prevent tooth loss.',
    image: '/assets/generated/gum-treatment.dim_800x600.png',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    duration: '60-90 minutes',
  },
  {
    id: 'tooth-extraction',
    icon: Scissors,
    title: 'Tooth Extraction',
    description: 'Safe and painless tooth removal procedures including wisdom teeth extraction. Performed with precision and care to ensure comfortable recovery.',
    image: '/assets/generated/tooth-extraction.dim_800x600.png',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    duration: '30-60 minutes',
  },
  {
    id: 'crowns-bridges',
    icon: Crown,
    title: 'Dental Crowns & Bridges',
    description: 'Custom-made crowns and bridges to restore damaged or missing teeth. Durable, natural-looking restorations that blend seamlessly with your smile.',
    image: '/assets/generated/crowns-bridges.dim_800x600.png',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    duration: '2-3 visits',
  },
  {
    id: 'dentures',
    icon: Users,
    title: 'Dentures (Full & Partial)',
    description: 'Comfortable and natural-looking dentures to replace multiple missing teeth. Custom-fitted full or partial dentures that restore function and confidence.',
    image: '/assets/generated/dentures.dim_800x600.png',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    duration: '4-6 weeks',
  },
  {
    id: 'oral-surgery',
    icon: Syringe,
    title: 'Oral Surgery',
    description: 'Advanced surgical procedures for complex dental issues. From impacted teeth to jaw corrections, performed by experienced oral surgeons.',
    image: '/assets/generated/oral-surgery.dim_800x600.png',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    duration: 'Varies by procedure',
  },
  {
    id: 'emergency-care',
    icon: AlertCircle,
    title: 'Emergency Dental Care',
    description: 'Immediate care for dental emergencies including severe pain, trauma, or infections. Available for urgent situations requiring prompt attention.',
    image: '/assets/generated/emergency-care.dim_800x600.png',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    duration: '30-90 minutes',
  },
  {
    id: 'cosmetic-dentistry',
    icon: Wand2,
    title: 'Cosmetic Dentistry',
    description: 'Transform your smile with comprehensive cosmetic treatments. From smile makeovers to aesthetic enhancements for a beautiful, confident smile.',
    image: '/assets/generated/cosmetic-dentistry.dim_800x600.png',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    duration: 'Varies by treatment',
  },
  {
    id: 'veneers',
    icon: Shield,
    title: 'Dental Veneers',
    description: 'Ultra-thin porcelain shells that cover the front surface of teeth. Perfect for correcting discoloration, chips, gaps, or misshapen teeth.',
    image: '/assets/generated/veneers.dim_800x600.png',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    duration: '2-3 visits',
  },
  {
    id: 'preventive-care',
    icon: HeartPulse,
    title: 'Preventive Care',
    description: 'Proactive dental care to prevent problems before they start. Includes sealants, fluoride treatments, and oral health education for long-term wellness.',
    image: '/assets/generated/preventive-care.dim_800x600.png',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    duration: '30-45 minutes',
  },
  {
    id: 'tmj-treatment',
    icon: Activity,
    title: 'TMJ Treatment',
    description: 'Specialized care for temporomandibular joint disorders. Relief from jaw pain, clicking, and discomfort through customized treatment plans.',
    image: '/assets/generated/tmj-treatment.dim_800x600.png',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    duration: 'Ongoing treatment',
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = service.icon;
  
  return (
    <Link to="/services/$serviceId" params={{ serviceId: service.id }}>
      <Card 
        ref={ref as any}
        className={`h-full text-center hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden cursor-pointer ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ 
          transitionDelay: `${index * 100}ms`,
          transitionProperty: 'opacity, transform, box-shadow'
        }}
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
          <CardDescription className="text-muted-foreground text-left">
            {service.description}
          </CardDescription>
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1">
              <Stethoscope className="w-4 h-4" />
              Duration: {service.duration}
            </span>
          </div>
          <Button 
            variant="outline"
            className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ServicesPage() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="w-full animate-page-fade-in">
      <section className="container py-20">
        <div 
          ref={headerRef as any}
          className={`text-center mb-12 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Dental Services</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At Satya Dental Care, we provide comprehensive dental care services with the latest technology 
            and techniques. Our experienced team is dedicated to helping you achieve and maintain optimal oral health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        <div className="text-center bg-muted/50 rounded-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Schedule Your Appointment?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our friendly team is here to help you with any questions and schedule your visit at a convenient time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                Book Appointment
              </Button>
            </Link>
            <a href="tel:+916352174912">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Call Us: +91 635-217-4912
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
