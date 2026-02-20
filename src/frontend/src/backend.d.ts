import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Appointment {
    serviceType: string;
    contactInfo: string;
    date: Time;
    patientName: string;
}
export type Time = bigint;
export interface backendInterface {
    book(patientName: string, contactInfo: string, date: Time, serviceType: string): Promise<void>;
    cancel(appointmentId: bigint): Promise<void>;
    getAll(): Promise<Array<Appointment>>;
    searchByService(serviceType: string): Promise<Array<Appointment>>;
}
