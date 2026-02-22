import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Appointment, ServiceType, UserProfile, OpeningHours } from '../backend';

export function useGetAllAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      try {
        const result = await actor.getAll();
        return result;
      } catch (error) {
        console.error('[useGetAllAppointments] Error fetching appointments:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAllAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['allAppointments'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      try {
        const result = await actor.getAllAppointments();
        return result;
      } catch (error) {
        console.error('[useAllAppointments] Error fetching all appointments:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useSearchAppointmentsByService(serviceType: ServiceType) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'service', serviceType],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.searchByService(serviceType);
    },
    enabled: !!actor && !actorFetching && !!identity && !!serviceType,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await actor.getCallerUserProfile();
        return result;
      } catch (error) {
        console.error('[useGetCallerUserProfile] Error fetching user profile:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 10 * 60 * 1000, // 10 minutes - user profile changes infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.saveCallerUserProfile(profile);
      } catch (error) {
        console.error('[useSaveCallerUserProfile] Error saving user profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
  });
}

// Clinic status hooks
export function useGetClinicOpen() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['clinicOpen'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getClinicOpen();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useSetClinicOpen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isOpen: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setClinicOpen(isOpen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicOpen'] });
    },
  });
}

// Opening hours hooks
export function useGetAllOpeningHours() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, OpeningHours]>>({
    queryKey: ['openingHours', 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOpeningHours();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useGetOpeningHours(day: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OpeningHours | null>({
    queryKey: ['openingHours', day],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOpeningHours(day);
    },
    enabled: !!actor && !actorFetching && !!day,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useSetOpeningHours() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { day: string; openTime: number; closeTime: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setOpeningHoursForDay(data.day, BigInt(data.openTime), BigInt(data.closeTime));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openingHours'] });
    },
  });
}

// Helper function to implement exponential backoff retry logic with configurable timeout
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  timeoutMs: number = 30000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout to each attempt (30 seconds as per requirements)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - the booking request took too long to complete')), timeoutMs);
      });
      
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error) {
      lastError = error as Error;
      
      // Check if this is a retryable error
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      const isRetryable = 
        errorMessage.includes('installing') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('not ready') ||
        errorMessage.includes('initializing');
      
      // If not retryable or last attempt, throw immediately
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }
      
      // Exponential backoff: 2s, 4s, 8s as per requirements
      const delay = Math.pow(2, attempt + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export function useBookAppointment() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientName: string;
      contactInfo: string;
      date: Date;
      serviceType: ServiceType;
      onRetry?: (attempt: number, error: Error) => void;
    }) => {
      // Validate actor is available and not fetching
      if (!actor || isFetching) {
        throw new Error('Backend connection not ready. Please wait for the system to initialize and try again.');
      }

      const timestamp = BigInt(data.date.getTime() * 1000000);

      // Use retry logic with exponential backoff and 30-second timeout
      return await retryWithBackoff(
        async () => {
          try {
            await actor.book(
              data.patientName,
              data.contactInfo,
              timestamp,
              data.serviceType
            );
          } catch (error) {
            console.error('[Booking] Error during booking:', error);
            throw error;
          }
        },
        3, // Max 3 retries
        30000, // 30 second timeout per attempt
        data.onRetry
      );
    },
    onSuccess: () => {
      // Invalidate queries to refresh appointment list
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
    onError: (error) => {
      console.error('[Booking] Final error after all retries:', error);
    },
  });
}
