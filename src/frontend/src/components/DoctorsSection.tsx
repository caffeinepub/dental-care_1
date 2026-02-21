import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const doctors = [
  {
    name: 'Dr. Anas Jadla',
    specialization: 'Chief Dental Surgeon',
    image: '/assets/generated/doctor-anas-jadla.dim_400x400.png',
    initials: 'AJ',
  },
  {
    name: 'Dr. Farhan Bangra',
    specialization: 'Orthodontist & Implant Specialist',
    image: '/assets/generated/doctor-farhan-bangra.dim_400x400.png',
    initials: 'FB',
  },
  {
    name: 'Dr. Jainul Aabedin',
    specialization: 'Endodontist & Cosmetic Dentist',
    image: '/assets/generated/doctor-jainul-aabedin.dim_400x400.png',
    initials: 'JA',
  },
];

function DoctorCard({ doctor, index }: { doctor: typeof doctors[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <Card 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 hover:shadow-primary/20 ${
        isVisible ? 'animate-slide-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-8 space-y-4">
        <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
          <AvatarImage 
            src={doctor.image} 
            alt={`${doctor.name} - Dental Professional`}
          />
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {doctor.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
          <p className="text-muted-foreground">{doctor.specialization}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorsSection() {
  return (
    <section id="doctors" className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Expert Dentists</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our team of experienced dental professionals is dedicated to providing you with the highest quality care
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {doctors.map((doctor, index) => (
          <DoctorCard key={index} doctor={doctor} index={index} />
        ))}
      </div>
    </section>
  );
}
