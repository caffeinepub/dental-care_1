import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Debug "mo:core/Debug";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

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

  module Appointment {
    public func compare(app1 : Appointment, app2 : Appointment) : Order.Order {
      if (app1.date < app2.date) { return #less };
      if (app1.date > app2.date) { return #greater };
      #equal;
    };
  };

  private func ensureAdminAccess(caller : Principal) {
    Debug.print("ensureAdminAccess called by: " # caller.toText());
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    Debug.print("Admin check result for caller " # caller.toText() # ": " # debug_show(isAdmin));
    if (not isAdmin) {
      Debug.print("Unauthorized access attempt by " # caller.toText());
      Runtime.trap("Unauthorized: Only admins can access this resource");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.print("Unauthorized: Only users can view profiles");
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.print("Unauthorized: Can only view your own profile");
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Debug.print("Unauthorized: Only users can save profiles");
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    Debug.print("Profile saved for user: " # caller.toText());
  };

  public shared ({ caller }) func book(patientName : Text, contactInfo : Text, date : Time.Time, serviceType : ServiceType) : async () {
    let appointment : Appointment = {
      patientName;
      contactInfo;
      date;
      serviceType;
    };
    appointments.add(nextAppointmentId, appointment);
    nextAppointmentId += 1;

    Debug.print("Appointment booked by: " # caller.toText());
  };

  public shared ({ caller }) func cancel(appointmentId : Nat) : async () {
    ensureAdminAccess(caller);
    if (not appointments.containsKey(appointmentId)) {
      Debug.print("Appointment does not exist for ID: " # appointmentId.toText());
      Runtime.trap("Appointment does not exist. ");
    };
    appointments.remove(appointmentId);
    Debug.print("Appointment cancelled by admin: " # caller.toText());
  };

  public query ({ caller }) func getAll() : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().toArray();
  };

  public shared ({ caller }) func getAllAppointments() : async [Appointment] {
    Debug.print("getAllAppointments called by: " # caller.toText());
    ensureAdminAccess(caller);
    appointments.values().toArray();
  };

  public shared ({ caller }) func searchByService(serviceType : ServiceType) : async [Appointment] {
    ensureAdminAccess(caller);
    appointments.values().filter(
      func(appointment) {
        appointment.serviceType == serviceType;
      }
    ).toArray();
  };

  public shared ({ caller }) func getUpcoming() : async [Appointment] {
    ensureAdminAccess(caller);
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) {
        appointment.date > currentTime;
      }
    ).toArray();
  };

  public shared ({ caller }) func getPastAppointments() : async [Appointment] {
    ensureAdminAccess(caller);
    let currentTime = Time.now();
    appointments.values().filter(
      func(appointment) {
        appointment.date <= currentTime;
      }
    ).toArray();
  };

  public shared ({ caller }) func searchByPatient(patientName : Text) : async [Appointment] {
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
