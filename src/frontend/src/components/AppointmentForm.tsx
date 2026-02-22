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
import { CalendarIcon, Loader2, CheckCircle2, Sparkles, AlertCircle, RefreshCw, Clock, WifiOff } from 'lucide-react';
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
      id: 'booking-progress',
    });

    bookMutation.mutate(
      {
        patientName: data.patientName,
        contactInfo: data.contactInfo,
        date,
        serviceType: backendServiceType,
        onRetry: (attempt, error) => {
          setBookingRetryAttempt(attempt);
          const delays = [2, 4, 8];
          toast.loading(`Retrying... (Attempt ${attempt} of 3, waiting ${delays[attempt - 1]}s)`, {
            id: 'booking-progress',
            description: 'Please wait while we process your request.',
          });
        },
      },
      {
        onSuccess: () => {
          setBookingRetryAttempt(0);
          toast.dismiss('booking-progress');
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
          setBookingRetryAttempt(0);
          toast.dismiss('booking-progress');
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          const isInstallError = errorMessage.toLowerCase().includes('installing');
          const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                                 errorMessage.toLowerCase().includes('connection');
          const isTimeoutError = errorMessage.toLowerCase().includes('timeout');
          
          let userMessage = 'Failed to book appointment';
          let description = 'Please try again later.';
          
          if (isTimeoutError) {
            userMessage = 'Request timeout';
            description = 'The booking request took too long. Please check your internet connection and try again.';
          } else if (isInstallError) {
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
  }, [date, selectedService, actor, actorFetching, connectionTimeout, bookMutation, reset, clinicOpen, isOnline]);

  // Memoized computed values
  const isActorReady = useMemo(() => !actorFetching && !!actor, [actorFetching, actor]);
  const isFormDisabled = useMemo(() => 
    !isActorReady || bookMutation.isPending || clinicOpen === false || !isOnline, 
    [isActorReady, bookMutation.isPending, clinicOpen, isOnline]
  );
  const showConnectionError = useMemo(() => connectionTimeout && !actor, [connectionTimeout, actor]);

  if (showSuccess) {
    return <SuccessScreen />;
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
            
            {/* Network Status Indicator */}
            {(!isOnline || isChecking) && (
              <div className="flex justify-center">
                <NetworkStatusIndicator />
              </div>
            )}
            
            {/* Offline Alert */}
            {!isOnline && !isChecking && (
              <Alert variant="destructive" className="mt-4">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>No Internet Connection</AlertTitle>
                <AlertDescription>
                  You are currently offline. Please check your internet connection to book an appointment.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Clinic Closed Alert */}
            {!clinicOpenLoading && clinicOpen === false && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Clinic Currently Closed</AlertTitle>
                <AlertDescription>
                  We are not accepting new appointments at this time. For urgent dental needs, please contact us directly at{' '}
                  <a href="tel:+916352174912" className="font-semibold underline">
                    +91 635-217-4912
                  </a>
                  .
                </AlertDescription>
              </Alert>
            )}
            
            {/* Connection Status Messages */}
            {actorFetching && !actor && !connectionTimeout && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing booking system... ({Math.floor(initializationTime / 1000)}s)</span>
              </div>
            )}

            {showConnectionError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Timeout</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>The booking system is taking longer than expected to load. This might be due to:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Slow internet connection</li>
                    <li>System initialization in progress</li>
                    <li>Network connectivity issues</li>
                  </ul>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Retry Attempt Indicator */}
            {bookingRetryAttempt > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Retrying booking request... (Attempt {bookingRetryAttempt} of 3)</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Name */}
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-base font-semibold">
                Full Name *
              </Label>
              <Input
                id="patientName"
                placeholder="Enter your full name"
                {...register('patientName', { required: 'Name is required' })}
                disabled={isFormDisabled}
                className="h-12 text-base"
              />
              {errors.patientName && (
                <p className="text-sm text-destructive animate-slide-in">
                  {errors.patientName.message}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-base font-semibold">
                Contact Information *
              </Label>
              <Input
                id="contactInfo"
                type="tel"
                placeholder="Phone number or email"
                {...register('contactInfo', { required: 'Contact information is required' })}
                disabled={isFormDisabled}
                className="h-12 text-base"
              />
              {errors.contactInfo && (
                <p className="text-sm text-destructive animate-slide-in">
                  {errors.contactInfo.message}
                </p>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-base font-semibold">
                Service Type *
              </Label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
                disabled={isFormDisabled}
              >
                <SelectTrigger id="serviceType" className="h-12 text-base">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedService && (
                <p className="text-sm text-muted-foreground">
                  Please select the type of service you need
                </p>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isFormDisabled}
                    className={`w-full h-12 justify-start text-left font-normal text-base ${
                      !date && 'text-muted-foreground'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </Suspense>
                </PopoverContent>
              </Popover>
              
              {/* Display operating hours for selected date */}
              {date && !openingHoursLoading && openingHours && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Clock className="w-4 h-4" />
                  <span>
                    Clinic hours on {selectedDayName}: {Number(openingHours.openTime)}:00 - {Number(openingHours.closeTime)}:00
                  </span>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-base font-semibold">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any specific concerns or requirements?"
                {...register('additionalNotes')}
                disabled={isFormDisabled}
                className="min-h-[100px] text-base resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isFormDisabled}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="mr-2 h-5 w-5" />
                  No Connection
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(AppointmentForm);
