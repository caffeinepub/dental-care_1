import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OpeningHours {
    closeTime: bigint;
    openTime: bigint;
}
export type Time = bigint;
export interface AppointmentResponse {
    id: bigint;
    serviceType: ServiceType;
    contactInfo: string;
    date: Time;
    patientName: string;
}
export interface AppointmentRequest {
    serviceType: ServiceType;
    contactInfo: string;
    date: Time;
    patientName: string;
}
export interface Appointment {
    serviceType: ServiceType;
    contactInfo: string;
    date: Time;
    patientName: string;
}
export interface UserProfile {
    name: string;
}
export enum ServiceType {
    PediatricExamAndCleaning = "PediatricExamAndCleaning",
    PeriodontalScaling = "PeriodontalScaling",
    BotoxConsultForMigraines = "BotoxConsultForMigraines",
    Extraction = "Extraction",
    InvisalignConsult = "InvisalignConsult",
    HygieneAndExam = "HygieneAndExam",
    Hygiene = "Hygiene",
    BotoxConsultForCosmetic = "BotoxConsultForCosmetic",
    FirstExamAndXray = "FirstExamAndXray",
    CrownAndExam = "CrownAndExam",
    ExtractionConsult = "ExtractionConsult"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    book(request: AppointmentRequest): Promise<bigint>;
    cancel(appointmentId: bigint): Promise<void>;
    getAll(): Promise<Array<AppointmentResponse>>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllOpeningHours(): Promise<Array<[string, OpeningHours]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClinicOpen(): Promise<boolean>;
    getEmptyAppointments(): Promise<Array<AppointmentResponse>>;
    getOpeningHours(day: string): Promise<OpeningHours | null>;
    getPastAppointments(): Promise<Array<Appointment>>;
    getShouldBeOpen(): Promise<boolean>;
    getUpcoming(): Promise<Array<Appointment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchByPatient(patientName: string): Promise<Array<Appointment>>;
    searchByService(serviceType: ServiceType): Promise<Array<Appointment>>;
    serviceTypeToText(serviceType: ServiceType): Promise<string>;
    setOpeningHoursForDay(day: string, openTime: bigint, closeTime: bigint): Promise<void>;
}
