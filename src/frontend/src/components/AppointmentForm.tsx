import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useActor } from '@/hooks/useActor';
import { useBookAppointment } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { ServiceType } from '../backend';

interface AppointmentFormData {
  patientName: string;
  contactInfo: string;
  serviceType: string;
  additionalNotes?: string;
}

const services = [
  'Braces & Aligners',
  'Check-up & Cleaning',
  'Cosmetic Dentistry',
  'Dental Crowns & Bridges',
  'Dental Implants',
  'Dental Veneers',
  'Dentures (Full & Partial)',
  'Emergency Dental Care',
  'Gum Disease Treatment',
  'Oral Surgery',
  'Pediatric Dentistry',
  'Preventive Care',
  'Root Canal Treatment',
  'Teeth Whitening',
  'TMJ Treatment',
  'Tooth Extraction',
];

// Map user-friendly service names to backend ServiceType enum
function mapServiceToBackendType(serviceName: string): ServiceType {
  const mapping: Record<string, ServiceType> = {
    'Check-up & Cleaning': ServiceType.FirstExamAndXray,
    'Root Canal Treatment': ServiceType.Hygiene,
    'Dental Implants': ServiceType.HygieneAndExam,
    'Teeth Whitening': ServiceType.HygieneAndExam,
    'Braces & Aligners': ServiceType.InvisalignConsult,
    'Pediatric Dentistry': ServiceType.PediatricExamAndCleaning,
    'Gum Disease Treatment': ServiceType.PeriodontalScaling,
    'Tooth Extraction': ServiceType.Extraction,
    'Dental Crowns & Bridges': ServiceType.CrownAndExam,
    'Dentures (Full & Partial)': ServiceType.Extraction,
    'Oral Surgery': ServiceType.ExtractionConsult,
    'Emergency Dental Care': ServiceType.FirstExamAndXray,
    'Cosmetic Dentistry': ServiceType.BotoxConsultForCosmetic,
    'Dental Veneers': ServiceType.BotoxConsultForCosmetic,
    'Preventive Care': ServiceType.Hygiene,
    'TMJ Treatment': ServiceType.BotoxConsultForMigraines,
  };
  
  return mapping[serviceName] || ServiceType.FirstExamAndXray;
}

export default function AppointmentForm() {
  const { actor, isFetching: actorFetching } = useActor();
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>();

  const bookMutation = useBookAppointment();

  const onSubmit = (data: AppointmentFormData) => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    if (!actor) {
      console.error('[AppointmentForm] Actor not available during submission', {
        actorFetching,
        actor: !!actor,
      });
      toast.error('Backend connection not ready', {
        description: 'Please wait a moment for the system to initialize and try again.',
      });
      return;
    }

    // Validate actor is fully initialized
    if (actorFetching) {
      console.warn('[AppointmentForm] Actor still fetching during submission');
      toast.error('System is still initializing', {
        description: 'Please wait a moment and try again.',
      });
      return;
    }

    console.log('[AppointmentForm] Submitting appointment booking:', {
      patientName: data.patientName,
      contactInfo: data.contactInfo,
      serviceType: selectedService,
      date: date.toISOString(),
      actorAvailable: !!actor,
      actorFetching,
    });

    setRetryAttempt(0);

    const backendServiceType = mapServiceToBackendType(selectedService);

    bookMutation.mutate(
      {
        patientName: data.patientName,
        contactInfo: data.contactInfo,
        date,
        serviceType: backendServiceType,
        onRetry: (attempt, error) => {
          console.log(`[AppointmentForm] Retry attempt ${attempt} after error:`, error.message);
          setRetryAttempt(attempt);
          toast.info(`Retrying... (Attempt ${attempt} of 3)`, {
            description: 'Please wait while we process your request.',
          });
        },
      },
      {
        onSuccess: () => {
          console.log('[AppointmentForm] Booking successful');
          setRetryAttempt(0);
          setShowSuccess(true);
          toast.success('Appointment booked successfully!', {
            description: 'We will contact you shortly to confirm your appointment.',
          });
          
          setTimeout(() => {
            setShowSuccess(false);
            reset();
            setDate(undefined);
            setSelectedService('');
          }, 3000);
        },
        onError: (error) => {
          console.error('[AppointmentForm] Booking failed after all retries:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          
          setRetryAttempt(0);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          const isInstallError = errorMessage.toLowerCase().includes('installing');
          const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                                 errorMessage.toLowerCase().includes('connection');
          
          let userMessage = 'Failed to book appointment';
          let description = 'Please try again later.';
          
          if (isInstallError) {
            userMessage = 'System is still initializing';
            description = 'The booking system is starting up. Please wait a moment and try again.';
          } else if (isNetworkError) {
            userMessage = 'Connection error';
            description = 'Please check your internet connection and try again.';
          } else if (errorMessage.includes('not ready') || errorMessage.includes('not available')) {
            userMessage = 'Backend not ready';
            description = 'Please wait a moment for the system to initialize and try again.';
          } else {
            description = errorMessage;
          }
          
          toast.error(userMessage, { description });
        },
      }
    );
  };

  // Check if form should be disabled
  const isFormDisabled = actorFetching || !actor || bookMutation.isPending;

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary/5 via-background to-primary/10 p-1 shadow-2xl animate-success-celebration">
        <div className="rounded-[2.9rem] bg-card p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <CheckCircle2 className="relative w-24 h-24 text-primary animate-success-icon" />
              <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-sparkle" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Appointment Booked!
          </h3>
          <p className="text-lg text-muted-foreground">
            We'll contact you shortly to confirm your appointment details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-accent/10 p-1 shadow-2xl hover:shadow-3xl transition-all duration-500">
      <Card className="rounded-[2.9rem] border-0 shadow-none bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-8 pt-10 px-8">
          <div className="text-center space-y-3">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Book Your Appointment
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Fill out the form below and we will get back to you as soon as possible
            </CardDescription>
            {actorFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Initializing booking system...</span>
              </div>
            )}
            {!actor && !actorFetching && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-4 w-4" />
                <span>Waiting for backend connection...</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Patient Name */}
            <div className="space-y-2 form-field-group">
              <Label htmlFor="patientName" className="text-base font-semibold text-foreground/90">
                Full Name *
              </Label>
              <div className="relative">
                <Input
                  id="patientName"
                  placeholder="Enter your full name"
                  className="h-14 text-base transition-all duration-300 focus:scale-[1.01] focus:shadow-xl border-2 rounded-2xl bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/60 placeholder:text-muted-foreground/50"
                  disabled={isFormDisabled}
                  {...register('patientName', { required: 'Name is required' })}
                />
              </div>
              {errors.patientName && (
                <p className="text-sm text-destructive animate-slide-in-error flex items-center gap-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  {errors.patientName.message}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 form-field-group">
              <Label htmlFor="contactInfo" className="text-base font-semibold text-foreground/90">
                Phone Number *
              </Label>
              <div className="relative">
                <Input
                  id="contactInfo"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="h-14 text-base transition-all duration-300 focus:scale-[1.01] focus:shadow-xl border-2 rounded-2xl bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/60 placeholder:text-muted-foreground/50"
                  disabled={isFormDisabled}
                  {...register('contactInfo', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                />
              </div>
              {errors.contactInfo && (
                <p className="text-sm text-destructive animate-slide-in-error flex items-center gap-2 mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive"></span>
                  {errors.contactInfo.message}
                </p>
              )}
            </div>

            {/* Service Selection */}
            <div className="space-y-2 form-field-group">
              <Label htmlFor="serviceType" className="text-base font-semibold text-foreground/90">
                Service Type *
              </Label>
              <Select value={selectedService} onValueChange={setSelectedService} disabled={isFormDisabled}>
                <SelectTrigger className="h-14 text-base transition-all duration-300 hover:scale-[1.005] hover:shadow-lg border-2 rounded-2xl bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/60 animate-dropdown-trigger">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="animate-dropdown-content rounded-2xl border-2 bg-white dark:bg-gray-950 z-50">
                  {services.map((service) => (
                    <SelectItem 
                      key={service} 
                      value={service}
                      className="text-base py-3 cursor-pointer transition-all duration-200 rounded-xl my-1 focus:bg-primary/10"
                    >
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2 form-field-group">
              <Label className="text-base font-semibold text-foreground/90">Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-start text-left font-normal text-base transition-all duration-300 hover:scale-[1.005] hover:shadow-lg border-2 rounded-2xl bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/60"
                    disabled={isFormDisabled}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {date ? format(date, 'PPP') : <span className="text-muted-foreground/70">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 animate-calendar-slide rounded-2xl border-2 bg-white dark:bg-gray-950 z-50">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2 form-field-group">
              <Label htmlFor="additionalNotes" className="text-base font-semibold text-foreground/90">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any specific concerns or requirements?"
                rows={4}
                className="text-base transition-all duration-300 focus:scale-[1.005] focus:shadow-xl border-2 rounded-2xl bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/60 resize-none placeholder:text-muted-foreground/50"
                disabled={isFormDisabled}
                {...register('additionalNotes')}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-16 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] animate-button-pulse group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" 
              size="lg"
              disabled={isFormDisabled}
            >
              <span className="relative z-10 flex items-center justify-center">
                {actorFetching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : bookMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {retryAttempt > 0 ? `Retrying... (${retryAttempt}/3)` : 'Booking...'}
                  </>
                ) : (
                  <>
                    Book Appointment
                    <Sparkles className="ml-2 h-5 w-5 group-hover:animate-bounce" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
