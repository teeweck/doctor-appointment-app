import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      const { access_token } = res.data;
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      onLogin(access_token, payload.sub);
    } catch (err) {
      alert('Login failed: Wrong email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <input placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button type='submit'>Login</button>
      <p>
        Don't have an account?{' '}
        <button type='button' onClick={onShowRegister}>Sign up</button>
      </p>
    </form>
  );
}
