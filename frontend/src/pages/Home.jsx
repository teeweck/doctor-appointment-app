import { useEffect, useState } from "react";
import CalendarView from "../components/CalendarView";
import axios from "axios";

export default function Home({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/doctors/").then((res) => {
      setDoctors(res.data);
      if (res.data.length > 0) setDoctorName(res.data[0].name);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/").then((res) => {
      setUsers(res.data);
      if (res.data.length > 0) setUserName(res.data[0].name);
    });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to the Doctor Appointment App</h1>
      <p>
        Logged in as: {user.name} ({user.is_doctor ? "Doctor" : "Patient"})
      </p>
      <button onClick={onLogout}>Logout</button>

      <h3>Just for debugging</h3>
      <p>Number of doctors: {doctors.length}</p>
      <p>Number of patients: {users.length}</p>

      <div style={{ display: "flex", marginTop: "2rem" }}>
        <div style={{ flex: 1 }}>
          {doctors.length > 0 && (
            <label>
              Select Doctor:
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              >
                {doctors.map((doc) => (
                  <option key={doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {users.length > 0 && (
            <label>
              Just for debugging, show Users:
              <select
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ marginLeft: "0.5rem" }}
              >
                {users.map((doc) => (
                  <option key={doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div style={{ flex: 2, marginLeft: "2rem" }}>
          <CalendarView doctorName={doctorName} user={user} />
        </div>
      </div>
    </div>
  );
}
