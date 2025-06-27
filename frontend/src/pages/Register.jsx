import { useState } from 'react';
import axios from 'axios';

export default function Register({ onRegisterSuccess, onUserExists }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', {
        name,
        email,
        password,
        is_doctor: isDoctor,
      });
      alert('Registered successfully! Please login.');
      onRegisterSuccess();
    } catch (err) {
        // // Log backend response if available
        // if (err.response) {
        //     // console.log("Backend error data:", err.response.data);
        //     console.log("Backend error status:", err.response.status);
        // }
        if (err.response && err.response.status === 409) {
            // console.log("user alr exists");
            alert('User already exists');
            if (onUserExists) onUserExists();
        }
        if (err.response && err.response.status === 400) {
            alert('Ensure all fields are filled correctly');
        }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
      <h2>Register</h2>
      <input placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} /><br />
      <input placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <label>
        <input 
        type='checkbox' 
        checked={isDoctor} 
        onChange={(e) => setIsDoctor(e.target.checked)} 
        /> {''} 
        Register as Doctor
      </label><br />
      <button type='submit'>Sign Up</button>
    </form>
  );
}
