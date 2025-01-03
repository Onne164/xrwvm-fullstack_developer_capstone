import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './Login.css';
import Header from '../Header/Header';

const Login = ({ onClose }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(true);

  const loginUrl = `${window.location.origin}/djangoapp/login/`;

  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName,
          password: password,
        }),
      });

      const json = await res.json();
      if (json.status && json.status === 'Authenticated') {
        sessionStorage.setItem('username', json.userName);
        setOpen(false);
      } else {
        alert('The user could not be authenticated.');
      }
    } catch (err) {
      alert('An error occurred while trying to authenticate. Please try again.');
    }
  };

  if (!open) {
    window.location.href = '/';
  }

  return (
    <div>
      <Header />
      <div onClick={onClose}>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="modalContainer"
        >
          <form className="login_panel" onSubmit={login}>
            <div>
              <label htmlFor="username" className="input_field">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Username"
                className="input_field"
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="input_field">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="input_field"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input className="action_button" type="submit" value="Login" />
              <input
                className="action_button"
                type="button"
                value="Cancel"
                onClick={() => setOpen(false)}
              />
            </div>
            <a className="loginlink" href="/register">
              Register Now
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Login;
