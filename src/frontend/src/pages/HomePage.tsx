import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import DoctorsSection from '../components/DoctorsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import { useGetClinicOpen } from '@/hooks/useQueries';

export default function HomePage() {
  const { data: clinicOpen, isLoading: clinicOpenLoading } = useGetClinicOpen();

  return (
    <div className="w-full">
      <HeroSection clinicOpen={clinicOpen} isLoading={clinicOpenLoading} />
      <ServicesSection />
      <WhyChooseUsSection />
      <DoctorsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
