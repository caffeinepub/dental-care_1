import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Appointment } from '../backend';

export function useGetAllAppointments() {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAll();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchAppointmentsByService(serviceType: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'service', serviceType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchByService(serviceType);
    },
    enabled: !!actor && !isFetching && !!serviceType,
  });
}
