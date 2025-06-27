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
    if (event.status === "available") {
      setSelectedSlot(event);
      setMessage("");
    } else {
      setSelectedSlot(null);
    }
  };

  // Handler for booking
  const handleBook = async () => {
    // Uncomment this portion to enable the check for doctor
    // if (!selectedSlot || user.is_doctor) {
    //   setMessage("This feature is only available for patients.");
    //   return;
    // }
    if (!selectedSlot || !user) {
      setMessage("Error booking appointment. Please try again.");
      return;
    }
    setBooking(true);
    setMessage("");
    try {
      console.log("Booking slot:");
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
        onView={setView}
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
          <button
            onClick={() => setSelectedSlot(null)}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
