import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Heart, 
  Smile, 
  Braces, 
  Baby, 
  Stethoscope,
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
  'gum-treatment': {
    id: 'gum-treatment',
    title: 'Gum Disease Treatment',
    icon: Activity,
    description: 'Comprehensive periodontal care to treat and prevent gum disease',
    fullDescription: 'Gum disease is a common but serious condition that can lead to tooth loss if left untreated. Our comprehensive periodontal care focuses on treating existing gum disease and preventing its recurrence. We use advanced techniques to restore gum health and protect your teeth for the long term.',
    procedure: 'Treatment begins with a thorough periodontal examination to assess the extent of gum disease. We perform deep cleaning procedures including scaling and root planing to remove bacteria and tartar from below the gum line. For advanced cases, we may recommend additional treatments such as antibiotic therapy or surgical intervention. Regular maintenance visits help prevent recurrence.',
    benefits: [
      'Prevents tooth loss from gum disease',
      'Reduces inflammation and bleeding',
      'Eliminates bad breath caused by bacteria',
      'Improves overall oral health',
      'Protects against systemic health issues',
      'Restores healthy gum tissue'
    ],
    duration: '60-90 minutes per session',
    specialFeatures: 'Advanced ultrasonic scaling and laser therapy available',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  'tooth-extraction': {
    id: 'tooth-extraction',
    title: 'Tooth Extraction',
    icon: Scissors,
    description: 'Safe and painless tooth removal procedures including wisdom teeth extraction',
    fullDescription: 'Sometimes tooth extraction is necessary to maintain overall oral health. Whether it is a severely damaged tooth, impacted wisdom teeth, or overcrowding, we perform extractions with precision and care. Our goal is to make the procedure as comfortable as possible and ensure smooth recovery.',
    procedure: 'Before extraction, we thoroughly numb the area with local anesthesia. For simple extractions, we gently loosen and remove the tooth. Surgical extractions for impacted teeth may require a small incision. We provide detailed aftercare instructions and pain management guidance to ensure comfortable healing. Follow-up appointments monitor your recovery progress.',
    benefits: [
      'Relief from severe tooth pain',
      'Prevents infection spread',
      'Addresses overcrowding issues',
      'Minimally invasive techniques',
      'Fast recovery with proper care'
    ],
    duration: '30-60 minutes',
    specialFeatures: 'Sedation options available for anxious patients',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  'crowns-bridges': {
    id: 'crowns-bridges',
    title: 'Dental Crowns & Bridges',
    icon: Crown,
    description: 'Custom-made crowns and bridges to restore damaged or missing teeth',
    fullDescription: 'Dental crowns and bridges are versatile restorations that can repair damaged teeth or replace missing ones. Our custom-made restorations are crafted from high-quality materials to match your natural teeth perfectly. They restore both function and aesthetics, giving you a complete, confident smile.',
    procedure: 'For crowns, we prepare the damaged tooth by reshaping it, then take precise impressions. A temporary crown protects the tooth while your permanent crown is fabricated in our dental lab. For bridges, we prepare the adjacent teeth and create a custom bridge to fill the gap. The final restoration is carefully fitted and bonded for a secure, natural-looking result.',
    benefits: [
      'Restores tooth structure and function',
      'Natural-looking appearance',
      'Durable and long-lasting',
      'Protects weakened teeth',
      'Replaces missing teeth without implants',
      'Improves chewing and speaking ability'
    ],
    duration: '2-3 visits over 2-3 weeks',
    specialFeatures: 'High-quality porcelain and zirconia materials',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  'dentures': {
    id: 'dentures',
    title: 'Dentures (Full & Partial)',
    icon: Users,
    description: 'Comfortable and natural-looking dentures to replace multiple missing teeth',
    fullDescription: 'Dentures are an excellent solution for replacing multiple missing teeth. Whether you need full dentures to replace all teeth or partial dentures to fill specific gaps, we create custom-fitted prosthetics that look natural and feel comfortable. Modern dentures restore your ability to eat, speak, and smile with confidence.',
    procedure: 'The denture process begins with detailed impressions and measurements of your mouth. We create a custom design that fits your facial structure and matches your natural appearance. Multiple fittings ensure perfect fit and comfort. For full dentures, any remaining teeth are removed and the gums are allowed to heal before final placement. Partial dentures are designed to fit around existing teeth.',
    benefits: [
      'Restores full chewing function',
      'Improves speech clarity',
      'Natural-looking smile',
      'Supports facial structure',
      'Removable for easy cleaning',
      'Cost-effective tooth replacement'
    ],
    duration: '4-6 weeks for complete process',
    specialFeatures: 'Flexible partial dentures and implant-supported options available',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
  },
  'oral-surgery': {
    id: 'oral-surgery',
    title: 'Oral Surgery',
    icon: Syringe,
    description: 'Advanced surgical procedures for complex dental issues',
    fullDescription: 'Our oral surgery services address complex dental conditions that require surgical intervention. From impacted teeth to jaw corrections and bone grafting, our experienced oral surgeons use advanced techniques to achieve optimal outcomes. We prioritize patient comfort and safety throughout every procedure.',
    procedure: 'Each surgical procedure is carefully planned using advanced imaging technology. We discuss all options and expected outcomes before surgery. Procedures are performed under appropriate anesthesia for your comfort. Common surgeries include wisdom tooth removal, dental implant placement, bone grafting, and corrective jaw surgery. Comprehensive post-operative care ensures proper healing.',
    benefits: [
      'Resolves complex dental problems',
      'Performed by experienced surgeons',
      'Advanced imaging for precision',
      'Multiple anesthesia options',
      'Comprehensive aftercare support'
    ],
    duration: 'Varies by procedure (1-3 hours)',
    specialFeatures: 'IV sedation and hospital privileges for complex cases',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
  'emergency-care': {
    id: 'emergency-care',
    title: 'Emergency Dental Care',
    icon: AlertCircle,
    description: 'Immediate care for dental emergencies including severe pain, trauma, or infections',
    fullDescription: 'Dental emergencies can happen at any time and require immediate attention. Whether you are experiencing severe tooth pain, have suffered dental trauma, or have a dental infection, our emergency dental services provide prompt relief. We prioritize emergency cases to address your urgent needs quickly and effectively.',
    procedure: 'When you contact us with a dental emergency, we schedule you for immediate evaluation. Our dentist will assess the situation, provide pain relief, and perform necessary emergency treatment. This may include tooth repair, infection management, temporary restorations, or extraction if needed. We also provide guidance for follow-up care and long-term solutions.',
    benefits: [
      'Immediate pain relief',
      'Prevents complications',
      'Same-day emergency appointments',
      'Comprehensive urgent care',
      'Saves damaged teeth when possible',
      'Expert trauma management'
    ],
    duration: '30-90 minutes depending on emergency',
    specialFeatures: 'After-hours emergency contact available',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  'cosmetic-dentistry': {
    id: 'cosmetic-dentistry',
    title: 'Cosmetic Dentistry',
    icon: Wand2,
    description: 'Transform your smile with comprehensive cosmetic treatments',
    fullDescription: 'Cosmetic dentistry combines art and science to create beautiful, natural-looking smiles. Whether you want to correct discoloration, reshape teeth, close gaps, or achieve a complete smile makeover, we offer a full range of cosmetic treatments. Our personalized approach ensures results that enhance your natural beauty and boost your confidence.',
    procedure: 'Your cosmetic journey begins with a comprehensive smile analysis and consultation. We discuss your goals and create a customized treatment plan that may include teeth whitening, veneers, bonding, contouring, or a combination of procedures. Using digital smile design technology, we can show you a preview of your new smile before treatment begins. Each procedure is performed with meticulous attention to detail.',
    benefits: [
      'Dramatically improves smile appearance',
      'Boosts self-confidence',
      'Customized to your goals',
      'Natural-looking results',
      'Multiple treatment options',
      'Long-lasting aesthetic improvements'
    ],
    duration: 'Varies by treatment plan (1-6 visits)',
    specialFeatures: 'Digital smile design and preview technology',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  'veneers': {
    id: 'veneers',
    title: 'Dental Veneers',
    icon: Shield,
    description: 'Ultra-thin porcelain shells that cover the front surface of teeth',
    fullDescription: 'Dental veneers are thin, custom-made shells that cover the front surface of your teeth to improve their appearance. They are an excellent solution for correcting discolored, worn, chipped, misaligned, or irregularly shaped teeth. Our high-quality porcelain veneers are designed to look completely natural while providing a durable, stain-resistant surface.',
    procedure: 'The veneer process typically requires two to three visits. First, we prepare your teeth by removing a small amount of enamel to accommodate the veneers. We then take precise impressions and help you select the perfect shade. Temporary veneers protect your teeth while your custom veneers are crafted. At the final appointment, we bond the veneers to your teeth using a special adhesive and light activation.',
    benefits: [
      'Corrects multiple cosmetic issues',
      'Natural-looking appearance',
      'Stain-resistant material',
      'Minimal tooth preparation',
      'Long-lasting results (10-15 years)',
      'Instant smile transformation'
    ],
    duration: '2-3 visits over 2-3 weeks',
    specialFeatures: 'Ultra-thin no-prep veneers available for select cases',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  'preventive-care': {
    id: 'preventive-care',
    title: 'Preventive Care',
    icon: HeartPulse,
    description: 'Proactive dental care to prevent problems before they start',
    fullDescription: 'Prevention is the cornerstone of good oral health. Our comprehensive preventive care program helps you avoid dental problems through regular monitoring, professional treatments, and education. By investing in preventive care, you can maintain a healthy smile and avoid costly, complex treatments in the future.',
    procedure: 'Our preventive care includes regular dental examinations, professional cleanings, fluoride treatments, and dental sealants. We also provide oral cancer screenings, bite analysis, and personalized oral hygiene instruction. For children, we offer additional preventive services like space maintainers and habit counseling. We create customized prevention plans based on your individual risk factors and needs.',
    benefits: [
      'Prevents cavities and gum disease',
      'Early detection of problems',
      'Reduces need for complex treatments',
      'Maintains overall health',
      'Cost-effective long-term care',
      'Personalized prevention strategies'
    ],
    duration: '30-45 minutes per visit',
    specialFeatures: 'Customized prevention plans and risk assessment',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
  },
  'tmj-treatment': {
    id: 'tmj-treatment',
    title: 'TMJ Treatment',
    icon: Activity,
    description: 'Specialized care for temporomandibular joint disorders',
    fullDescription: 'Temporomandibular joint (TMJ) disorders can cause significant pain and discomfort in your jaw, face, and neck. Our specialized TMJ treatment addresses the underlying causes of your symptoms and provides effective relief. We use a combination of conservative therapies and advanced treatments to restore normal jaw function and eliminate pain.',
    procedure: 'Treatment begins with a comprehensive evaluation of your jaw joint, bite, and related structures. We may use imaging studies to assess the joint condition. Treatment options include custom oral appliances, physical therapy exercises, medication, and lifestyle modifications. For severe cases, we may recommend advanced therapies or refer you to a specialist. Most patients experience significant improvement with conservative treatment.',
    benefits: [
      'Relieves jaw pain and headaches',
      'Reduces clicking and popping',
      'Improves jaw function',
      'Non-invasive treatment options',
      'Prevents further joint damage',
      'Addresses underlying causes'
    ],
    duration: 'Ongoing treatment (3-6 months typical)',
    specialFeatures: 'Custom-fitted oral appliances and bite therapy',
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
    <div className="container py-12 animate-page-fade-in">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link to="/services">
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
          {/* Duration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{service.duration}</p>
            </CardContent>
          </Card>

          {/* Special Features */}
          {service.specialFeatures && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Special Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.specialFeatures}</p>
              </CardContent>
            </Card>
          )}

          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">
                Book your appointment today and take the first step towards a healthier, more beautiful smile.
              </p>
              <Link to="/booking">
                <Button variant="secondary" className="w-full" size="lg">
                  Book Appointment
                </Button>
              </Link>
              <a href="tel:+916352174912" className="block">
                <Button variant="outline" className="w-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Call Us Now
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
