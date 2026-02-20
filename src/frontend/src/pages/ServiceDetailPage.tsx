import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, Sparkles, Heart, Smile, Braces, Baby, Stethoscope } from 'lucide-react';

interface ServiceData {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  fullDescription: string;
  procedure: string;
  benefits: string[];
  duration: string;
  specialFeatures?: string;
  color: string;
  bgColor: string;
}

const servicesData: Record<string, ServiceData> = {
  'dental-checkup': {
    id: 'dental-checkup',
    title: 'Check-up & Cleaning',
    icon: Stethoscope,
    description: 'Comprehensive dental examination and professional cleaning to maintain optimal oral health',
    fullDescription: 'Regular dental check-ups and professional cleanings are the foundation of good oral health. Our comprehensive examination includes a thorough assessment of your teeth, gums, and overall oral health. We use advanced diagnostic tools to detect any issues early, ensuring timely treatment and prevention of more serious problems.',
    procedure: 'During your visit, our experienced dentists will perform a complete oral examination, checking for cavities, gum disease, and other dental issues. This is followed by professional cleaning where we remove plaque and tartar buildup that regular brushing cannot eliminate. We also provide personalized oral hygiene advice to help you maintain a healthy smile between visits.',
    benefits: [
      'Early detection of dental problems',
      'Prevention of cavities and gum disease',
      'Fresh breath and brighter smile',
      'Personalized oral health guidance',
      'Reduced risk of serious dental issues'
    ],
    duration: '45-60 minutes',
    specialFeatures: 'Includes digital X-rays and oral cancer screening',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
  'root-canal': {
    id: 'root-canal',
    title: 'Root Canal Treatment',
    icon: Heart,
    description: 'Pain-free tooth restoration with single-sitting painless procedures available',
    fullDescription: 'Root canal treatment is a highly effective procedure to save a tooth that has been severely damaged or infected. At Satya Dental Care, we specialize in painless root canal treatments using the latest technology and techniques. Our goal is to eliminate your pain and preserve your natural tooth.',
    procedure: 'The procedure involves removing the infected or damaged pulp from inside the tooth, cleaning and disinfecting the root canals, and then filling and sealing them. We use advanced rotary endodontic instruments and digital imaging to ensure precision and comfort. Local anesthesia ensures you feel no pain during the procedure.',
    benefits: [
      'Saves your natural tooth',
      'Eliminates tooth pain and infection',
      'Single-sitting treatment available',
      'Prevents spread of infection',
      'Restores normal biting force and sensation'
    ],
    duration: '60-90 minutes per session',
    specialFeatures: 'Painless procedure with advanced rotary endodontics',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  'dental-implants': {
    id: 'dental-implants',
    title: 'Dental Implants',
    icon: Smile,
    description: 'Permanent solution for missing teeth that feels and functions like natural teeth',
    fullDescription: 'Dental implants are the gold standard for replacing missing teeth. They provide a permanent, natural-looking solution that restores both function and aesthetics. Our implants are made from biocompatible titanium that integrates with your jawbone, providing a stable foundation for replacement teeth.',
    procedure: 'The implant procedure involves surgically placing a titanium post into your jawbone, which acts as an artificial tooth root. After a healing period where the implant fuses with the bone (osseointegration), we attach a custom-made crown that matches your natural teeth. The entire process is carefully planned using 3D imaging for optimal results.',
    benefits: [
      'Permanent and durable solution',
      'Looks and feels like natural teeth',
      'Prevents bone loss in the jaw',
      'No damage to adjacent teeth',
      'Improved chewing ability and speech'
    ],
    duration: '3-6 months total (including healing time)',
    specialFeatures: '3D planning and computer-guided implant placement',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  'teeth-whitening': {
    id: 'teeth-whitening',
    title: 'Teeth Whitening',
    icon: Sparkles,
    description: 'Professional laser whitening for 3-4 shades brighter smile in just one session',
    fullDescription: 'Transform your smile with our professional teeth whitening services. We offer advanced laser whitening technology that delivers dramatic results in just one visit. Our safe and effective treatments can brighten your teeth by 3-4 shades, giving you the confident, radiant smile you deserve.',
    procedure: 'Our professional whitening process begins with a thorough cleaning to remove any surface stains. We then apply a professional-grade whitening gel to your teeth and activate it with a specialized LED light. The treatment is comfortable and takes about an hour. We also provide custom take-home trays for maintaining your results.',
    benefits: [
      'Immediate visible results',
      'Safe and effective treatment',
      'Brightens teeth by 3-4 shades',
      'Boosts confidence and appearance',
      'Long-lasting results with proper care'
    ],
    duration: '60 minutes',
    specialFeatures: 'Advanced LED light activation for faster results',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  'braces-aligners': {
    id: 'braces-aligners',
    title: 'Braces & Aligners',
    icon: Braces,
    description: 'Metal braces or invisible aligners to correct misalignment and achieve perfect smile',
    fullDescription: 'Achieve the straight, beautiful smile you have always wanted with our orthodontic treatments. We offer both traditional metal braces and modern clear aligners to suit your lifestyle and preferences. Our experienced orthodontists create personalized treatment plans to correct misalignment, gaps, and bite issues.',
    procedure: 'Treatment begins with a comprehensive orthodontic evaluation including X-rays and impressions. For braces, we bond brackets to your teeth and connect them with wires that are adjusted periodically. Clear aligners involve wearing a series of custom-made, removable trays that gradually shift your teeth. Regular check-ups ensure your treatment progresses as planned.',
    benefits: [
      'Corrects misaligned teeth and bite issues',
      'Improves oral health and function',
      'Enhances facial aesthetics',
      'Boosts self-confidence',
      'Multiple treatment options available'
    ],
    duration: '12-24 months (varies by case)',
    specialFeatures: 'Clear aligner option for discreet treatment',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
  },
  'pediatric-dentistry': {
    id: 'pediatric-dentistry',
    title: 'Pediatric Dentistry',
    icon: Baby,
    description: 'Gentle and friendly dental care for kids in a child-friendly environment',
    fullDescription: 'We believe that positive early dental experiences set the foundation for a lifetime of good oral health. Our pediatric dentistry services are designed to make children feel comfortable and safe. We create a fun, welcoming environment where kids can learn about dental health while receiving gentle, expert care.',
    procedure: 'Our pediatric dental visits include age-appropriate examinations, cleanings, fluoride treatments, and preventive care. We take time to explain procedures to children in a friendly, non-threatening way. Our team is specially trained to work with children of all ages, from infants to teenagers, addressing their unique dental needs with patience and care.',
    benefits: [
      'Builds positive dental habits early',
      'Prevents childhood cavities and decay',
      'Child-friendly, comfortable environment',
      'Education on proper oral hygiene',
      'Early detection of developmental issues'
    ],
    duration: '30-45 minutes',
    specialFeatures: 'Fun, colorful treatment rooms and reward system for kids',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
};

export default function ServiceDetailPage() {
  const { serviceId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const service = serviceId ? servicesData[serviceId] : null;

  if (!service) {
    return (
      <div className="container py-20">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Service Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The service you are looking for does not exist or has been removed.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="container py-12">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Button>
        </Link>
      </div>

      {/* Service Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-20 h-20 rounded-full ${service.bgColor} flex items-center justify-center`}>
            <Icon className={`w-10 h-10 ${service.color}`} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">{service.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">{service.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {service.fullDescription}
              </p>
            </CardContent>
          </Card>

          {/* Procedure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">The Procedure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {service.procedure}
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{service.duration}</p>
                </div>
              </div>
              {service.specialFeatures && (
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Special Features</p>
                    <p className="text-sm text-muted-foreground">{service.specialFeatures}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">
                Book your appointment today and take the first step towards a healthier, more beautiful smile.
              </p>
              <Button 
                onClick={() => navigate({ to: '/booking' })}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Have Questions?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Our team is here to help. Contact us for more information about this service.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Call us:</p>
                <a href="tel:+916352174912" className="text-primary hover:underline block">
                  +91 635-217-4912
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
