import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Appointment, ServiceType, UserProfile } from '../backend';

export function useGetAllAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      console.log('[useGetAllAppointments] ===== FETCHING APPOINTMENTS (getAll) =====');
      console.log('[useGetAllAppointments] Query state:', {
        timestamp: new Date().toISOString(),
        hasActor: !!actor,
        actorFetching,
        hasIdentity: !!identity,
        principal: identity?.getPrincipal().toString(),
        adminAuthFromSession: sessionStorage.getItem('admin_authenticated'),
        caffeineTokenFromSession: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
      });

      if (!actor) {
        console.error('[useGetAllAppointments] Actor not available');
        throw new Error('Actor not available');
      }
      
      console.log('[useGetAllAppointments] Calling actor.getAll()...');
      try {
        const result = await actor.getAll();
        console.log('[useGetAllAppointments] ===== SUCCESS =====');
        console.log('[useGetAllAppointments] Successfully fetched appointments:', {
          count: result.length,
          timestamp: new Date().toISOString(),
        });
        return result;
      } catch (error) {
        console.error('[useGetAllAppointments] ===== ERROR =====');
        console.error('[useGetAllAppointments] Error fetching appointments:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          principal: identity?.getPrincipal().toString(),
          adminAuthFromSession: sessionStorage.getItem('admin_authenticated'),
          caffeineTokenFromSession: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useAllAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Appointment[]>({
    queryKey: ['allAppointments'],
    queryFn: async () => {
      console.log('[useAllAppointments] ===== FETCHING ALL APPOINTMENTS (getAllAppointments) =====');
      console.log('[useAllAppointments] Query state:', {
        timestamp: new Date().toISOString(),
        hasActor: !!actor,
        actorFetching,
        hasIdentity: !!identity,
        principal: identity?.getPrincipal().toString(),
        adminAuthFromSession: sessionStorage.getItem('admin_authenticated'),
        caffeineTokenFromSession: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
      });

      if (!actor) {
        console.error('[useAllAppointments] Actor not available');
        throw new Error('Actor not available');
      }
      
      console.log('[useAllAppointments] Calling actor.getAllAppointments()...');
      console.log('[useAllAppointments] Actor methods available:', Object.keys(actor).filter(k => typeof (actor as any)[k] === 'function'));
      
      try {
        const result = await actor.getAllAppointments();
        console.log('[useAllAppointments] ===== SUCCESS =====');
        console.log('[useAllAppointments] Successfully fetched all appointments:', {
          count: result.length,
          timestamp: new Date().toISOString(),
        });
        return result;
      } catch (error) {
        console.error('[useAllAppointments] ===== ERROR =====');
        console.error('[useAllAppointments] Error fetching all appointments:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          errorName: error instanceof Error ? error.name : undefined,
          principal: identity?.getPrincipal().toString(),
          adminAuthFromSession: sessionStorage.getItem('admin_authenticated'),
          caffeineTokenFromSession: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
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
    retry: false,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      console.log('[useGetCallerUserProfile] Fetching user profile:', {
        timestamp: new Date().toISOString(),
        hasActor: !!actor,
        actorFetching,
        hasIdentity: !!identity,
        principal: identity?.getPrincipal().toString(),
      });

      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await actor.getCallerUserProfile();
        console.log('[useGetCallerUserProfile] Successfully fetched user profile:', {
          hasProfile: !!result,
          profileName: result?.name,
        });
        return result;
      } catch (error) {
        console.error('[useGetCallerUserProfile] Error fetching user profile:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
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
      console.log('[useSaveCallerUserProfile] Saving user profile:', {
        timestamp: new Date().toISOString(),
        profileName: profile.name,
      });

      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.saveCallerUserProfile(profile);
        console.log('[useSaveCallerUserProfile] Successfully saved user profile');
      } catch (error) {
        console.error('[useSaveCallerUserProfile] Error saving user profile:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
  });
}

// Helper function to implement exponential backoff retry logic
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
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
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
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

      // Use retry logic with exponential backoff
      return await retryWithBackoff(
        async () => {
          console.log('[Booking] Attempting to book appointment:', {
            patientName: data.patientName,
            contactInfo: data.contactInfo,
            date: data.date.toISOString(),
            serviceType: data.serviceType,
            actorAvailable: !!actor,
            isFetching,
          });

          try {
            await actor.book(
              data.patientName,
              data.contactInfo,
              timestamp,
              data.serviceType
            );
            console.log('[Booking] Appointment booked successfully');
          } catch (error) {
            console.error('[Booking] Error during booking:', {
              error,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
          }
        },
        3, // Max 3 retries
        data.onRetry
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] });
    },
    onError: (error) => {
      console.error('[Booking] Final error after all retries:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      });
    },
  });
}
