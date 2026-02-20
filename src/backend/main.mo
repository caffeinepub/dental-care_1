import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

actor {
  type Appointment = {
    patientName : Text;
    contactInfo : Text;
    date : Time.Time;
    serviceType : Text;
  };

  var nextAppointmentId = 0;

  let appointments = Map.empty<Nat, Appointment>();

  module Appointment {
    public func compare(app1 : Appointment, app2 : Appointment) : Order.Order {
      Text.compare(app1.patientName, app2.patientName);
    };
  };

  public shared ({ caller }) func book(patientName : Text, contactInfo : Text, date : Time.Time, serviceType : Text) : async () {
    let appointment : Appointment = {
      patientName;
      contactInfo;
      date;
      serviceType;
    };
    appointments.add(nextAppointmentId, appointment);
    nextAppointmentId += 1;
  };

  public query ({ caller }) func getAll() : async [Appointment] {
    appointments.values().toArray();
  };

  public shared ({ caller }) func cancel(appointmentId : Nat) : async () {
    if (not appointments.containsKey(appointmentId)) {
      Runtime.trap("Appointment does not exist. ");
    };
    appointments.remove(appointmentId);
  };

  public query ({ caller }) func searchByService(serviceType : Text) : async [Appointment] {
    appointments.values().filter(
      func(appointment) {
        appointment.serviceType == serviceType;
      }
    ).toArray();
  };
};
