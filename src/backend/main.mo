import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type OpeningHours = {
    openTime : Nat;
    closeTime : Nat;
  };

  type Appointment = {
    patientName : Text;
    contactInfo : Text;
    date : Time.Time;
    serviceType : ServiceType;
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

  type UserProfile = {
    name : Text;
  };

  type AppointmentResponse = {
    id : Nat;
    patientName : Text;
    contactInfo : Text;
    date : Time.Time;
    serviceType : ServiceType;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  var openingHours = Map.empty<Text, OpeningHours>();
  var nextAppointmentId = 0;
  var appointments = Map.empty<Nat, Appointment>();
  var userProfiles = Map.empty<Principal, UserProfile>();

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

  public type AppointmentRequest = {
    patientName : Text;
    contactInfo : Text;
    date : Time.Time;
    serviceType : ServiceType;
  };

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

  // Clinic is permanently open - status functions always return true
  public query func getClinicOpen() : async Bool {
    true; // Always open
  };

  public query func getShouldBeOpen() : async Bool {
    true; // Always open
  };

  // Opening hours management - Admin only
  public shared ({ caller }) func setOpeningHoursForDay(day : Text, openTime : Nat, closeTime : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let hours : OpeningHours = {
      openTime;
      closeTime;
    };
    openingHours.add(day, hours);
  };

  // Public queries - no auth needed
  public query func getOpeningHours(day : Text) : async ?OpeningHours {
    openingHours.get(day);
  };

  public query func getAllOpeningHours() : async [(Text, OpeningHours)] {
    openingHours.toArray();
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Appointment management - booking requires user auth
  public shared ({ caller }) func book(request : AppointmentRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };
    let appointment : Appointment = {
      patientName = request.patientName;
      contactInfo = request.contactInfo;
      date = request.date;
      serviceType = request.serviceType;
    };
    let appointmentId = nextAppointmentId;
    appointments.add(appointmentId, appointment);
    nextAppointmentId += 1;
    appointmentId;
  };

  // Cancel appointment - Admin only
  public shared ({ caller }) func cancel(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not appointments.containsKey(appointmentId)) {
      return;
    };
    appointments.remove(appointmentId);
  };

  // Admin-only queries
  public query ({ caller }) func getAll() : async [AppointmentResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    appointments.toArray().map(
      func((id, appointment)) : AppointmentResponse {
        {
          id;
          patientName = appointment.patientName;
          contactInfo = appointment.contactInfo;
          date = appointment.date;
          serviceType = appointment.serviceType;
        };
      }
    );
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    appointments.values().toArray();
  };

  public query ({ caller }) func searchByService(serviceType : ServiceType) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    appointments.values().filter(
      func(appointment) : Bool {
        appointment.serviceType == serviceType;
      }
    ).toArray();
  };

  public query ({ caller }) func getUpcoming() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) : Bool {
        appointment.date > currentTime;
      }
    ).toArray();
  };

  public query ({ caller }) func getPastAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) : Bool {
        appointment.date <= currentTime;
      }
    ).toArray();
  };

  public query ({ caller }) func searchByPatient(patientName : Text) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    appointments.values().filter(
      func(appointment) : Bool {
        Text.equal(appointment.patientName, patientName);
      }
    ).toArray();
  };

  // Public utility function - no auth needed
  public query func serviceTypeToText(serviceType : ServiceType) : async Text {
    ServiceType.toText(serviceType);
  };

  // Query returning empty array - no auth needed (public endpoint)
  public query ({ caller }) func getEmptyAppointments() : async [AppointmentResponse] {
    [];
  };
};
