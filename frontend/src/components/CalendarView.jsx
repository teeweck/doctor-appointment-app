import { useState, useEffect } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
  const [date, setDate] = useState(new Date()); // Add this line
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");

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
      const time = selectedSlot.start.toTimeString().slice(0, 5);
      const res = await fetch(
        `http://localhost:5000/api/doctors/name/${encodeURIComponent(
          doctorName
        )}/book`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, time, patient_id: user.id }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Appointment booked!");
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
      const appt = allAppointments.find(
        (a) =>
          a.patient_id === user.id &&
          a.date === selectedSlot.start.toISOString().slice(0, 10) &&
          a.time.slice(0, 5) === selectedSlot.start.toTimeString().slice(0, 5)
      );
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
        view={view} // Add this line
        date={date} // Add this line
        onView={setView}
        onNavigate={setDate} // Add this line
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
      />

      {selectedSlot && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#f9f9f9",
          }}
        >
          <div>
            Book appointment for: <b>{selectedSlot.start.toLocaleString()}</b>
          </div>
          <button
            onClick={handleBook}
            disabled={booking}
            style={{ marginTop: "0.5rem" }}
          >
            Book Slot
          </button>
          {selectedSlot.status === "booked" && (
            <button
              onClick={handleCancelBooking}
              disabled={booking}
              style={{
                marginLeft: "1rem",
                background: "#ef4444",
                color: "white",
              }}
            >
              Cancel Booking
            </button>
          )}
          <button
            onClick={() => setSelectedSlot(null)}
            style={{ marginLeft: "1rem" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
