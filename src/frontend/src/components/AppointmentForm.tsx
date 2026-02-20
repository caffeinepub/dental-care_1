import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface AppointmentFormData {
  patientName: string;
  contactInfo: string;
  date: string;
  time: string;
  serviceType: string;
}

const services = [
  'Check-up & Cleaning',
  'Root Canal Treatment (RCT)',
  'Dental Implants',
  'Teeth Whitening',
  'Braces & Aligners',
  'Pediatric Dentistry',
];

export default function AppointmentForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AppointmentFormData>();

  const serviceType = watch('serviceType');

  const bookMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      if (!actor) throw new Error('Actor not initialized');

      // Combine date and time into a timestamp
      const dateTime = new Date(`${data.date}T${data.time}`);
      const timestamp = BigInt(dateTime.getTime() * 1_000_000); // Convert to nanoseconds

      await actor.book(data.patientName, data.contactInfo, timestamp, data.serviceType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsSuccess(true);
      toast.success('Appointment book ho gayi!', {
        description: 'Hum jald hi aapse sampark karenge.',
      });
      reset();
    },
    onError: (error) => {
      toast.error('Kuch galat ho gaya', {
        description: error instanceof Error ? error.message : 'Kripya phir se koshish karein',
      });
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    bookMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Appointment Confirm Ho Gayi!</h3>
          <p className="text-muted-foreground mb-6">
            Aapki appointment successfully book ho gayi hai. Hum jald hi aapse sampark karenge.
          </p>
          <Button onClick={() => setIsSuccess(false)}>Ek Aur Appointment Book Karein</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
        <CardDescription>Apni jaankari neeche bharen</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patientName">Aapka Naam *</Label>
            <Input
              id="patientName"
              placeholder="Apna poora naam likhein"
              {...register('patientName', { required: 'Naam zaroori hai' })}
            />
            {errors.patientName && (
              <p className="text-sm text-destructive">{errors.patientName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Number *</Label>
            <Input
              id="contactInfo"
              type="tel"
              placeholder="+91 98765 43210"
              {...register('contactInfo', {
                required: 'Contact number zaroori hai',
                pattern: {
                  value: /^[+]?[\d\s-()]+$/,
                  message: 'Valid phone number daalein',
                },
              })}
            />
            {errors.contactInfo && (
              <p className="text-sm text-destructive">{errors.contactInfo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('date', { required: 'Date zaroori hai' })}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time *</Label>
              <Input
                id="time"
                type="time"
                {...register('time', { required: 'Time zaroori hai' })}
              />
              {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={serviceType}
              onValueChange={(value) => setValue('serviceType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Service chunein" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-destructive">{errors.serviceType.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={bookMutation.isPending}
          >
            {bookMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Book Ho Rahi Hai...
              </>
            ) : (
              'Appointment Book Karein'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
