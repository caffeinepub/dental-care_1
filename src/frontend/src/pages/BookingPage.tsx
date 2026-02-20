import AppointmentForm from '../components/AppointmentForm';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wapas Jaayein
      </Button>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Appointment Book Karein</h1>
          <p className="text-muted-foreground">
            Apni appointment book karne ke liye neeche diye gaye form ko bharein. Hum jald hi aapse sampark karenge.
          </p>
        </div>

        <AppointmentForm />
      </div>
    </div>
  );
}
