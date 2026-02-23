import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Phone, Mail } from 'lucide-react';
import AppointmentForm from '@/components/AppointmentForm';
import { useGetClinicOpen } from '@/hooks/useQueries';

export default function BookingPage() {
  const { data: clinicOpen, isLoading: clinicOpenLoading } = useGetClinicOpen();

  return (
    <div className="container py-12 animate-page-fade-in">
      <div className="mb-8 animate-fade-in">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8 animate-fade-in-delay-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Schedule Your Visit</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Take the first step towards a healthier, brighter smile. Fill out the form below and we'll contact you to confirm your appointment.
        </p>
      </div>

      <div className="animate-form-entrance">
        <AppointmentForm />
      </div>
    </div>
  );
}
