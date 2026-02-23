import { useState, useEffect, lazy, Suspense, useCallback, useMemo, memo } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, Loader2, CheckCircle2, Sparkles, AlertCircle, RefreshCw, Clock, WifiOff, CheckCircle, ArrowRight } from 'lucide-react';
import { format, getDay } from 'date-fns';
import { useActor } from '@/hooks/useActor';
import { useBookAppointment, useGetClinicOpen, useGetOpeningHours } from '@/hooks/useQueries';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { toast } from 'sonner';
import { ServiceType } from '../backend';

// Lazy load Calendar component to reduce initial bundle size
const Calendar = lazy(() => import('@/components/ui/calendar').then(module => ({ default: module.Calendar })));

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

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// Success screen component memoized to prevent unnecessary re-renders
const SuccessScreen = memo(() => (
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
));

SuccessScreen.displayName = 'SuccessScreen';

function AppointmentForm() {
  const { actor, isFetching: actorFetching } = useActor();
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRetryAttempt, setBookingRetryAttempt] = useState(0);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [initializationTime, setInitializationTime] = useState(0);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>();

  const bookMutation = useBookAppointment();
  const { data: clinicOpen, isLoading: clinicOpenLoading } = useGetClinicOpen();
  const { isOnline, isChecking, checkConnectivity } = useNetworkStatus();
  
  // Get day name for selected date
  const selectedDayName = date ? daysOfWeek[getDay(date)] : '';
  const { data: openingHours, isLoading: openingHoursLoading } = useGetOpeningHours(selectedDayName);

  // Track initialization time with timeout detection (30 seconds as per requirements)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let startTime = Date.now();

    if (actorFetching && !actor) {
      // Start tracking initialization time
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setInitializationTime(elapsed);
        
        // Set timeout flag after 30 seconds
        if (elapsed > 30000) {
          setConnectionTimeout(true);
          clearInterval(intervalId);
        }
      }, 1000);

      timeoutId = intervalId;
    } else if (actor) {
      // Actor loaded successfully
      setConnectionTimeout(false);
      setInitializationTime(0);
    }

    return () => {
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [actorFetching, actor]);

  // Memoized retry handler
  const handleRetry = useCallback(async () => {
    setConnectionTimeout(false);
    setInitializationTime(0);
    
    // Check network connectivity first
    const isConnected = await checkConnectivity();
    if (!isConnected) {
      toast.error('No internet connection', {
        description: 'Please check your network connection and try again.',
      });
      return;
    }
    
    window.location.reload();
  }, [checkConnectivity]);

  // Memoized form submission handler
  const onSubmit = useCallback((data: AppointmentFormData) => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    // Check network connectivity first
    if (!isOnline) {
      toast.error('No internet connection', {
        description: 'Please check your network connection and try again.',
      });
      return;
    }

    // Check if clinic is closed
    if (clinicOpen === false) {
      toast.error('Clinic is currently closed', {
        description: 'We are not accepting new appointments at this time. Please contact us for urgent needs.',
      });
      return;
    }

    // Validate actor is available
    if (!actor) {
      if (connectionTimeout) {
        toast.error('Connection timeout', {
          description: 'The system took too long to respond. Please check your internet connection and try again.',
        });
      } else {
        toast.error('System not ready', {
          description: 'Please wait for the system to finish initializing and try again.',
        });
      }
      return;
    }

    // Prevent submission while actor is still initializing
    if (actorFetching) {
      toast.error('System is still initializing', {
        description: 'Please wait a moment and try again.',
      });
      return;
    }

    setBookingRetryAttempt(0);

    const backendServiceType = mapServiceToBackendType(selectedService);

    // Show immediate loading feedback
    toast.loading('Booking your appointment...', {
      id: 'booking-toast',
    });

    bookMutation.mutate(
      {
        patientName: data.patientName,
        contactInfo: data.contactInfo,
        date,
        serviceType: backendServiceType,
        onRetry: (attempt, error) => {
          setBookingRetryAttempt(attempt);
          toast.loading(`Retrying... (Attempt ${attempt}/3)`, {
            id: 'booking-toast',
            description: error.message,
          });
        },
      },
      {
        onSuccess: () => {
          toast.dismiss('booking-toast');
          toast.success('Appointment booked successfully!');
          setShowSuccess(true);
          reset();
          setDate(undefined);
          setSelectedService('');
          setBookingRetryAttempt(0);
        },
        onError: (error) => {
          toast.dismiss('booking-toast');
          setBookingRetryAttempt(0);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          // Provide user-friendly error messages
          if (errorMessage.toLowerCase().includes('timeout')) {
            toast.error('Request timeout', {
              description: 'The booking request took too long. Please check your connection and try again.',
            });
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
            toast.error('Network error', {
              description: 'Unable to connect to the server. Please check your internet connection.',
            });
          } else if (errorMessage.toLowerCase().includes('not ready') || errorMessage.toLowerCase().includes('initializing')) {
            toast.error('System not ready', {
              description: 'The system is still initializing. Please wait a moment and try again.',
            });
          } else {
            toast.error('Booking failed', {
              description: errorMessage,
            });
          }
        },
      }
    );
  }, [date, selectedService, isOnline, clinicOpen, actor, connectionTimeout, actorFetching, bookMutation, reset, checkConnectivity]);

  // Show success screen after booking
  if (showSuccess) {
    return <SuccessScreen />;
  }

  // Show loading state while checking clinic status
  if (clinicOpenLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading clinic status...</p>
        </CardContent>
      </Card>
    );
  }

  // Determine if form should be disabled
  const isFormDisabled = clinicOpen === false || bookMutation.isPending || actorFetching || !actor;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl">Book Your Appointment</CardTitle>
        <CardDescription>
          Fill in your details and we'll get back to you to confirm your appointment.
        </CardDescription>

        {/* Clinic Status Alert */}
        {clinicOpen === true && (
          <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300 font-semibold">
              Clinic is Open
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              We are accepting appointments. Book your visit today!
            </AlertDescription>
          </Alert>
        )}

        {clinicOpen === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Clinic Currently Closed</AlertTitle>
            <AlertDescription>
              We are not accepting new appointments at this time. For urgent dental needs, please contact us directly.
            </AlertDescription>
          </Alert>
        )}

        {/* Network Status Indicator */}
        <NetworkStatusIndicator />

        {/* Connection Timeout Warning */}
        {connectionTimeout && (
          <Alert variant="destructive" className="animate-error-slide-in">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Connection Timeout</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>The system took too long to respond. This might be due to:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Slow internet connection</li>
                <li>Server initialization delay</li>
                <li>Network connectivity issues</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Initialization Progress */}
        {actorFetching && !actor && initializationTime > 5000 && (
          <Alert>
            <Clock className="h-5 w-5 animate-pulse" />
            <AlertTitle>Initializing System</AlertTitle>
            <AlertDescription>
              Please wait while we connect to the backend... ({Math.floor(initializationTime / 1000)}s)
            </AlertDescription>
          </Alert>
        )}

        {/* Retry Attempt Indicator */}
        {bookingRetryAttempt > 0 && (
          <Alert>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <AlertTitle>Retrying Connection</AlertTitle>
            <AlertDescription>
              Attempt {bookingRetryAttempt} of 3... Please wait.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patientName">Full Name *</Label>
            <Input
              id="patientName"
              placeholder="Enter your full name"
              {...register('patientName', { required: 'Name is required' })}
              disabled={isFormDisabled}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
            {errors.patientName && (
              <p className="text-sm text-destructive animate-error-slide-in">{errors.patientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information *</Label>
            <Input
              id="contactInfo"
              type="tel"
              placeholder="Phone number or email"
              {...register('contactInfo', { required: 'Contact information is required' })}
              disabled={isFormDisabled}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
            {errors.contactInfo && (
              <p className="text-sm text-destructive animate-error-slide-in">{errors.contactInfo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
              disabled={isFormDisabled}
            >
              <SelectTrigger id="serviceType" className="transition-all focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] animate-dropdown-in">
                {services.map((service) => (
                  <SelectItem key={service} value={service} className="cursor-pointer hover:bg-accent">
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedService && errors.serviceType && (
              <p className="text-sm text-destructive animate-error-slide-in">Please select a service</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal transition-all focus:ring-2 focus:ring-primary"
                  disabled={isFormDisabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 animate-calendar-in" align="start">
                <Suspense fallback={
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                }>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </Suspense>
              </PopoverContent>
            </Popover>
            {!date && errors.serviceType && (
              <p className="text-sm text-destructive animate-error-slide-in">Please select a date</p>
            )}
            
            {/* Display opening hours for selected day */}
            {date && selectedDayName && (
              <div className="text-sm text-muted-foreground mt-2 p-3 bg-muted/50 rounded-md">
                {openingHoursLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading hours...</span>
                  </div>
                ) : openingHours ? (
                  <p>
                    <strong>{selectedDayName}:</strong> {Number(openingHours.openTime)}:00 - {Number(openingHours.closeTime)}:00
                  </p>
                ) : (
                  <p>Opening hours not available for {selectedDayName}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any specific concerns or requests?"
              {...register('additionalNotes')}
              disabled={isFormDisabled}
              className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-6 font-semibold group hover:scale-[1.02] transition-all"
            disabled={isFormDisabled}
          >
            {bookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Booking...
              </>
            ) : actorFetching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initializing...
              </>
            ) : clinicOpen === false ? (
              'Clinic Closed - Cannot Book'
            ) : (
              <>
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {!isOnline && (
            <p className="text-sm text-center text-destructive flex items-center justify-center gap-2 animate-error-slide-in">
              <WifiOff className="w-4 h-4" />
              No internet connection. Please check your network.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default AppointmentForm;
