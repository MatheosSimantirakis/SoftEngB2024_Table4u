'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Consumer, Reservation, Restaurant} from '../../model'


const Consumer: React.FC = () => {
  // State for toggling the login modal visibility
  const [isLoginVisible, setLoginVisible] = useState(false);

  // State for storing login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for storing the selected date from the calendar
  const [selectedDate, setSelectedDate] = useState('');

  const router = useRouter();

  // Handlers for showing and hiding the login modal
  const handleOpenLogin = () => {
    setLoginVisible(true);
  };

  const handleCloseLogin = () => {
    setLoginVisible(false);
  };

  // Handler for login action based on role (manager or admin)
  const handleLogin = (role: string) => {
    if (role === 'manager') {
      console.log(`Logging in as Manager with username: ${username}`);
      router.push('/manager'); // Redirect to manager page
    } else if (role === 'admin') {
      console.log(`Logging in as Admin with username: ${username}`);
      router.push('/admin'); // Redirect to admin page
    }
    setLoginVisible(false); // Close the modal after login
  };

  // Handler for date selection from the calendar input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    console.log(`Selected date: ${event.target.value}`);
  };

  return (
    <div className="consumer-view">
      {/* Header Section: Contains the logo, login button, and search bar */}
      <header className="consumer-header">
        <img src="/logo.svg" alt="Tables4U Logo" className="logo-consumer" />
        <button className="login-button-consumer" onClick={handleOpenLogin}>
          Log in
        </button>
        <div className="search-container-consumer">
          <input
            type="text"
            placeholder="Search for a restaurant..."
            className="search-input-consumer"
          />
          <button className="search-button-consumer">Search</button>
        </div>
      </header>

      {/* Filters Section: Buttons and dropdowns for filtering reservations */}
      <section className="filters-section-consumer">
        <button className="my-reservations-button-consumer">My Reservations</button>
        <input
          type="date" // Calendar input for selecting a date
          className="date-input-consumer"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <select className="dropdown-consumer">
          <option value="All times">Times</option>
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="13:00">13:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
          <option value="18:00">18:00</option>
          <option value="19:00">19:00</option>
          <option value="20:00">20:00</option>
          <option value="21:00">21:00</option>
          <option value="22:00">22:00</option>
          <option value="23:00">23:00</option>
        </select>
      </section>

      {/* Results Section: List of available restaurants */}
      <section className="results-section-consumer">
        <h3 className="results-title-consumer">Available Restaurants</h3>
        <ul className="results-list-consumer">
          {/* Example of a restaurant card */}
          <li className="result-item-consumer">
            <h4 className="restaurant-name-consumer">Tech Pizza</h4>
            <p className="restaurant-info-consumer">
              <strong>Address:</strong> 123 Main St
            </p>
            <p className="restaurant-info-consumer">
              <strong>Open:</strong> 9:00 AM
            </p>
            <p className="restaurant-info-consumer">
              <strong>Close:</strong> 10:00 PM
            </p>
            <button className="action-button-consumer">Reserve</button>
          </li>
          <li className="result-item-consumer">
            <h4 className="restaurant-name-consumer">Boomers</h4>
            <p className="restaurant-info-consumer">
              <strong>Address:</strong> 123 Main St
            </p>
            <p className="restaurant-info-consumer">
              <strong>Open:</strong> 11:00 AM
            </p>
            <p className="restaurant-info-consumer">
              <strong>Close:</strong> 11:00 PM
            </p>
            <button className="action-button-consumer">Reserve</button>
          </li>
        </ul>
      </section>

      {/* Login Modal: Displayed when the login button is clicked */}
      {isLoginVisible && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-button" onClick={handleCloseLogin}>
              ✕
            </button>
            <h2 className="login-title">Log in</h2>
            <p className="login-subtitle">Enter your credentials</p>
            <div className="login-inputs">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>
            <div className="login-buttons">
              <button
                className="login-button"
                onClick={() => handleLogin('manager')}
              >
                Login as Manager
              </button>
              <button
                className="login-button"
                onClick={() => handleLogin('admin')}
              >
                Login as Administrator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consumer;
