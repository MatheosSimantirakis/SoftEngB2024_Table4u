'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ConsumerView: React.FC = () => {
  const [isLoginVisible, setLoginVisible] = useState(false); // Login modal visibility
  const [isCreateManagerVisible, setCreateManagerVisible] = useState(false); // Manager account modal visibility
  const [isCreateAdminVisible, setCreateAdminVisible] = useState(false); // Admin account modal visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state for transitions
  const [username, setUsername] = useState(''); // Username input state
  const [password, setPassword] = useState(''); // Password input state
  const [selectedDate, setSelectedDate] = useState(''); // Date filter state
  const [restaurants, setRestaurants] = useState([]); // State to hold restaurant data

  const router = useRouter(); // Router instance for navigation

  // Function for on-screen notifications
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });

  // Helper function to show notifications
  const showNotification = (
    message: string,
    params: Record<string, string> = {},
    type: string = 'success',
    duration: number = 10000 // Default duration: 10 seconds
  ) => {
    const formattedMessage = Object.keys(params).reduce(
      (msg, key) => msg.replace(`{${key}}`, params[key]),
      message
    );

    setNotification({ message: formattedMessage, visible: true, type });

    // Clear notification after specified duration
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: '' });
    }, duration);
  };


  // Show/hide the login modal
  const handleOpenLogin = () => setLoginVisible(true);
  const handleCloseLogin = () => setLoginVisible(false);

  // Functions to toggle manager account creation modal visibility
  const openCreateManager = () => {
    setLoginVisible(false);
    setCreateManagerVisible(true);
  };
  const closeCreateManager = () => setCreateManagerVisible(false);

  // Functions to toggle admin account creation modal visibility
  const openCreateAdmin = () => {
    setLoginVisible(false);
    setCreateAdminVisible(true);
  };
  const closeCreateAdmin = () => setCreateAdminVisible(false);

  // Handle login based on role and redirect
  const handleLogin = async (role: string) => {
    setIsLoading(true); // Set loading state
    if (role === 'manager') {
      await router.push('/manager'); 
    } else if (role === 'admin') {
      await router.push('/admin'); 
    }
    setIsLoading(false); 
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
      {/* Header with logo, login button, and search bar */}
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
          <option value="All times">Time</option>
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
                onClick={async () => {
                  try {
                    const response = await loginInfoApi.post('/', {
                      action: 'register',
                      username,
                      password,
                      role: 'Admin',
                    });

                    if (response.status === 201) {
                      alert('Administrator created successfully');
                      closeCreateAdmin();
                    } else {
                      alert('Error creating administrator: ' + response.data.message);
                    }
                  } catch (err) {
                    console.error('Error creating administrator:', err);
                    alert('An error occurred. Please try again.');
                  }
                }}
              >
                Login as Administrator
              </button>
            </div>
            <div className="create-account-link-container">
              <span className="create-account-link" onClick={openCreateAdmin}>
                Create Administrator Account
              </span>
            </div>
          </div>
        </div>
      )}
      {notification.visible && (
          <Notification
            message={notification.message}
            visible={notification.visible}
            type={notification.type}
          />
        )}

      {/* Account Creation Modals */}
      {isCreateManagerVisible && <AccountCreationModal title="Create Manager Account" onClose={closeCreateManager} />}
      {isCreateAdminVisible && <AccountCreationModal title="Create Administrator Account" onClose={closeCreateAdmin} />}
    </div>
  );
};

export default ConsumerView;
