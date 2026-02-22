import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type OpeningHours = {
    openTime : Nat;
    closeTime : Nat;
  };

  var clinicOpen : Bool = false;

  let daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let openingHours = Map.empty<Text, OpeningHours>();

  type Appointment = {
    patientName : Text;
    contactInfo : Text;
    date : Time.Time;
    serviceType : ServiceType;
  };

  public type ServiceType = {
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

  module ServiceType {
    public func toText(serviceType : ServiceType) : Text {
      switch (serviceType) {
        case (#FirstExamAndXray) { "First Exam & X-ray" };
        case (#Hygiene) { "Hygiene" };
        case (#HygieneAndExam) { "Hygiene + Exam" };
        case (#PeriodontalScaling) { "Periodontal Scaling (Deep Cleaning)" };
        case (#PediatricExamAndCleaning) { "Pediatric Exam + Cleaning" };
        case (#CrownAndExam) { "Crown + Exam" };
        case (#ExtractionConsult) { "Extraction Consult" };
        case (#Extraction) { "Extraction" };
        case (#InvisalignConsult) { "Invisalign Consult" };
        case (#BotoxConsultForMigraines) { "Botox Consult for Migraines" };
        case (#BotoxConsultForCosmetic) { "Botox Consult for Cosmetic" };
      };
    };
  };

  public type UserProfile = {
    name : Text;
    // Could add more user metadata here
  };

  var nextAppointmentId = 0;
  let appointments = Map.empty<Nat, Appointment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize default opening hours for each day of the week
  for (day in daysOfWeek.values()) {
    openingHours.add(
      day,
      {
        openTime = 9;
        closeTime = 17;
      },
    );
  };

  private func ensureAdminAccess(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access this resource");
    };
  };

  public shared ({ caller }) func setClinicOpen(isOpen : Bool) : async () {
    ensureAdminAccess(caller);
    clinicOpen := isOpen;
  };

  public query ({ caller }) func getClinicOpen() : async Bool {
    clinicOpen;
  };

  public shared ({ caller }) func setOpeningHoursForDay(day : Text, openTime : Nat, closeTime : Nat) : async () {
    ensureAdminAccess(caller);
    let hours : OpeningHours = {
      openTime;
      closeTime;
    };
    openingHours.add(day, hours);
  };

  public query ({ caller }) func getOpeningHours(day : Text) : async ?OpeningHours {
    openingHours.get(day);
  };

  public query ({ caller }) func getAllOpeningHours() : async [(Text, OpeningHours)] {
    openingHours.toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func book(patientName : Text, contactInfo : Text, date : Time.Time, serviceType : ServiceType) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };
    let appointment : Appointment = {
      patientName;
      contactInfo;
      date;
      serviceType;
    };
    appointments.add(nextAppointmentId, appointment);
    nextAppointmentId += 1;
  };

  public shared ({ caller }) func cancel(appointmentId : Nat) : async () {
    ensureAdminAccess(caller);
    if (not appointments.containsKey(appointmentId)) {
      Runtime.trap("Appointment does not exist.");
    };
    appointments.remove(appointmentId);
  };

  public query ({ caller }) func getAll() : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().toArray();
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().toArray();
  };

  public query ({ caller }) func searchByService(serviceType : ServiceType) : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().filter(
      func(appointment) {
        appointment.serviceType == serviceType;
      }
    ).toArray();
  };

  public query ({ caller }) func getUpcoming() : async [Appointment] {
    ensureAdminAccess(caller);
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) {
        appointment.date > currentTime;
      }
    ).toArray();
  };

  public query ({ caller }) func getPastAppointments() : async [Appointment] {
    ensureAdminAccess(caller);
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) {
        appointment.date <= currentTime;
      }
    ).toArray();
  };

  public query ({ caller }) func searchByPatient(patientName : Text) : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().filter(
      func(appointment) {
        Text.equal(appointment.patientName, patientName);
      }
    ).toArray();
  };

  public query ({ caller }) func serviceTypeToText(serviceType : ServiceType) : async Text {
    ServiceType.toText(serviceType);
  };
};
