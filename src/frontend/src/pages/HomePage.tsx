import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import DoctorsSection from '../components/DoctorsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <DoctorsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
