import React from "react";

export default function AppointmentDialog({
  selectedSlot,
  description,
  setDescription,
  booking,
  handleBook,
  handleCancelBooking,
  setSelectedSlot,
  user,
}) {
  if (!selectedSlot) return null;
  return (
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
      {selectedSlot.status !== "booked" && !user.is_doctor && (
        <div style={{ margin: "0.5rem 0" }}>
          <label>
            Short description of health issue:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Describe your health issue (optional)"
            />
          </label>
        </div>
      )}
      {selectedSlot.status === "booked" && selectedSlot.description && (
        <div style={{ margin: "0.5rem 0", color: "#555" }}>
          <b>Patient's description:</b> {selectedSlot.description}
        </div>
      )}
      {!user.is_doctor && (
        <button
          onClick={handleBook}
          disabled={booking}
          style={{ marginTop: "0.5rem" }}
        >
          Book Slot
        </button>
      )}
      {selectedSlot.status === "booked" && user.is_doctor && (
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
  );
}
