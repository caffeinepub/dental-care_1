import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldClinicStatus = {
    isOpen : Bool;
    manualOverride : Bool;
  };

  type ServiceType = {
    #FirstExamAndXray;
    #Hygiene;
    #HygieneAndExam;
    #PeriodontalScaling;
    #PediatricExamAndCleaning;
    #CrownAndExam;
    #ExtractionConsult;
    #Extraction;
    #InvisalignConsult;
    #BotoxConsultForMigraines;
    #BotoxConsultForCosmetic;
  };

  type OldActor = {
    openingHours : Map.Map<Text, { openTime : Nat; closeTime : Nat }>;
    nextAppointmentId : Nat;
    appointments : Map.Map<Nat, { patientName : Text; contactInfo : Text; date : Int; serviceType : ServiceType }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    clinicStatus : OldClinicStatus;
  };

  type NewActor = {
    openingHours : Map.Map<Text, { openTime : Nat; closeTime : Nat }>;
    nextAppointmentId : Nat;
    appointments : Map.Map<Nat, { patientName : Text; contactInfo : Text; date : Int; serviceType : ServiceType }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      openingHours = old.openingHours;
      nextAppointmentId = old.nextAppointmentId;
      appointments = old.appointments;
      userProfiles = old.userProfiles;
    };
  };
};
