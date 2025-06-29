import { useState, useEffect } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AppointmentDialog from "./AppointmentDialog";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView({ doctorName, user }) {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!doctorName) return;
    fetch(
      `http://localhost:5000/api/doctors/name/${encodeURIComponent(
        doctorName
      )}/availability`
    )
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(formatted);
      });
  }, [doctorName]);

  const eventStyleGetter = (event) => {
    const bgColor = event.status === "booked" ? "#ef4444" : "#10b981";
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "5px",
        color: "white",
        padding: "2px 6px",
      },
    };
  };

  // Handler for selecting a slot
  const handleSelectEvent = (event) => {
    setSelectedSlot(event);
    setMessage("");
  };

  // Handler for booking
  const handleBook = async () => {
    if (!selectedSlot || !user) {
      setMessage("Error booking appointment. Please try again.");
      return;
    }
    setBooking(true);
    setMessage("");
    try {
      const date = selectedSlot.start.toISOString().slice(0, 10);
      const time_start = selectedSlot.start.toTimeString().slice(0, 5);
      const time_end = selectedSlot.end.toTimeString().slice(0, 5);
      console.log("Booking appointment for:", {
        date,
        time_start,
        time_end,
        user,
      });
      const res = await fetch(
        `http://localhost:5000/api/doctors/name/${encodeURIComponent(
          doctorName
        )}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            time_start,
            time_end,
            patient_id: user.id,
            patient_name: user.name, // Include patient's name
            description,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Appointment booked!");
        setSelectedSlot(null);
        setDescription("");
        // Refresh events
        fetch(
          `http://localhost:5000/api/doctors/name/${encodeURIComponent(
            doctorName
          )}/availability`
        )
          .then((res) => res.json())
          .then((data) => {
            const formatted = data.map((e) => ({
              ...e,
              start: new Date(e.start),
              end: new Date(e.end),
            }));
            setEvents(formatted);
          });
      } else {
        setMessage(data.error || "Booking failed.");
      }
    } catch (e) {
      setMessage("Booking failed.");
    }
    setBooking(false);
  };

  // Handler for cancelling a booking
  const handleCancelBooking = async () => {
    if (!selectedSlot || !user) {
      setMessage("Error cancelling booking. Please try again.");
      return;
    }
    setBooking(true);
    setMessage("");
    try {
      // Fetch all appointments for this user
      const res = await fetch(`http://localhost:5000/api/appointments/`);
      const allAppointments = await res.json();
      // Find the appointment that matches the selected slot (30-min interval)
      const appt = allAppointments.find((a) => {
        if (user.is_doctor) {
          // Doctor: match by doctor_id and slot time
          return (
            a.doctor_id === user.id &&
            a.date === selectedSlot.start.toISOString().slice(0, 10) &&
            a.time_start.slice(0, 5) ===
              selectedSlot.start.toTimeString().slice(0, 5)
          );
        } else {
          // Patient: match by patient_id and slot time
          return (
            a.patient_id === user.id &&
            a.date === selectedSlot.start.toISOString().slice(0, 10) &&
            a.time_start.slice(0, 5) ===
              selectedSlot.start.toTimeString().slice(0, 5)
          );
        }
      });
      console.log("Cancelling appointment:", appt);
      if (appt) {
        // Send DELETE request to cancel the appointment
        const delRes = await fetch(
          `http://localhost:5000/api/appointments/${appt.id}/delete`,
          { method: "DELETE" }
        );
        const delData = await delRes.json();
        if (delRes.ok) {
          setMessage("Booking cancelled!");
          setSelectedSlot(null);
          // Refresh events
          fetch(
            `http://localhost:5000/api/doctors/name/${encodeURIComponent(
              doctorName
            )}/availability`
          )
            .then((res) => res.json())
            .then((data) => {
              const formatted = data.map((e) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.end),
              }));
              setEvents(formatted);
            });
        } else {
          setMessage(delData.error || "Cancellation failed.");
        }
      } else {
        setMessage("No matching appointment found for cancellation.");
      }
    } catch (e) {
      setMessage("Failed to fetch user appointments.");
    }
    setBooking(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {message && (
          <div style={{ color: message.includes("booked") ? "green" : "red" }}>
            {message}
          </div>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={view}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        style={{ height: 500, width: "100%" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
      />

      <AppointmentDialog
        selectedSlot={selectedSlot}
        description={description}
        setDescription={setDescription}
        booking={booking}
        handleBook={handleBook}
        handleCancelBooking={handleCancelBooking}
        setSelectedSlot={setSelectedSlot}
        user={user}
      />
    </div>
  );
}
