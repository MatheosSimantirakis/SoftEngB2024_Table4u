'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Consumer, Reservation, Restaurant } from '../../model';
import axios from 'axios';

// Function to create API instances with base URLs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

// Placeholder API instances for backend endpoints
const listActiveRestaurantsApi = createApiInstance('https://m0ppkn17qc.execute-api.us-east-2.amazonaws.com/listActiveRestaurants');
const searchAvailableRestaurantsApi = createApiInstance('https://example.com');
const searchSpecificRestaurantApi = createApiInstance('https://example.com');
const makeReservationApi = createApiInstance('https://cogjtdgnmh.execute-api.us-east-2.amazonaws.com/makeReservation');
const findExistingReservationApi = createApiInstance('https://example.com');
const cancelExistingReservationApi = createApiInstance('https://vqo7mqf378.execute-api.us-east-2.amazonaws.com/cancelReservation');
const loginInfoApi = createApiInstance('https://example.com');

// Reusable component for account creation modal
const AccountCreationModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="modal-overlay">
    <div className="login-modal">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h2 className="login-title">{title}</h2>
      <div className="login-inputs-container">
        <input type="text" placeholder="Username" className="login-input" />
        <input type="password" placeholder="Password" className="login-input" />
      </div>
      <div className="login-buttons">
        <button className="create-account-button">Create Account</button>
      </div>
    </div>
  </div>
);

// Notification component
const Notification = ({ message, visible, type }: { message: string; visible: boolean; type: string }) => {
  if (!visible) return null;
  return <div className={`notification ${type}`}>{message}</div>;
};

const ConsumerView: React.FC = () => {
  const [isLoginVisible, setLoginVisible] = useState(false); // Login modal visibility
  const [isCreateManagerVisible, setCreateManagerVisible] = useState(false); // Manager account modal visibility
  const [isCreateAdminVisible, setCreateAdminVisible] = useState(false); // Admin account modal visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state for transitions
  const [username, setUsername] = useState(''); // Username input state
  const [password, setPassword] = useState(''); // Password input state
  const [selectedDate, setSelectedDate] = useState(''); // Date filter state
  const [restaurants, setRestaurants] = useState([]); // State to hold restaurant data
  const [isReservationModalVisible, setReservationModalVisible] = useState(false); // Tracks visibility of the reservation modal
  const [reservationTime, setReservationTime] = useState(''); // Stores the selected reservation time
  const [reservationDate, setReservationDate] = useState(''); // Stores the selected reservation date
  const [reservationSeats, setReservationSeats] = useState(''); // Stores the selected number of seats for the reservation
  const [email, setEmail] = useState(''); // Stores the email entered by the user
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null); // Restaurant ID as a string or null
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>(''); // Restaurant name as a string
  const [validationMessage, setValidationMessage] = useState<string>(''); // Stores form validation message
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

  // Navigate to the manager view
  const handleManager = () => {
    router.push('/manager');
  };

  // Navigate to account creation based on the role
  const handleCreateAccount = (role: String) => {
    if (role === 'manager') {
      router.push('/createAdmin'); // Redirect to create admin account page
    } else if (role === 'admin') {
      /// Placeholder for admin-specific logic
    }
  };

  // Opens the reservation modal for a specific restaurant ID
  const handleFindReservation = (restaurantId: string, restaurantName: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedRestaurantName(restaurantName);
    setReservationModalVisible(true);
  };

  // Update the selected date for filtering
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    console.log(`Selected date: ${event.target.value}`);
  };

  // API: Make Reservation
  const handleMakeReservation = async () => {
    console.log("handleMakeReservation called");

    // Input validation
    if (!reservationTime || !reservationDate || !reservationSeats || !email) {
      console.warn("Validation failed: missing required fields");
      setValidationMessage('All fields are required.');
      return;
    }

    console.log("Input validation passed. Proceeding with API call.");
    console.log("Reservation Details:", {
      restaurantId: selectedRestaurantId,
      date: reservationDate,
      time: reservationTime,
      seats: reservationSeats,
      email,
    });

    setValidationMessage('');

    try {
      setIsLoading(true);
      console.log("Sending API request...");

      // Call the API
      const response = await makeReservationApi.post('/', {
        restaurantId: selectedRestaurantId,
        date: reservationDate,
        time: reservationTime,
        seats: parseInt(reservationSeats),
        email,
      });

      console.log("API response received:", response);

      if (response.status === 200 && response.data.statusCode === 200) {
        const responseBody = JSON.parse(response.data.body);
        const reservationId = responseBody.reservationId; // Extract reservationId from the parsed body

        if (reservationId) {
          console.log("Reservation created successfully with ID:", reservationId);

          // Show success notification with the reservation ID
          showNotification(
            `Reservation created successfully! ID: ${reservationId}`,
            {},
            'success'
          );
          setReservationModalVisible(false);
        } else {
          console.error("Reservation ID not found in the response.");
          showNotification("Reservation created, but ID could not be retrieved.", {}, "error");
        }
      } else if (response.data.statusCode === 400) {
        const errorMessage = response.data?.message || "An error occurred.";
        console.warn("Backend validation failed:", errorMessage);
        showNotification(errorMessage, {}, 'error');
      } else {
        console.warn("Unknown API response:", response);
        showNotification('Failed to create reservation. Try again.', {}, 'error');
      }
    } catch (error: any) {
      console.error("Error occurred during reservation creation:", error);

      // Parse the error message from the response
      const backendMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string'
          ? JSON.parse(error.response.data)?.message
          : 'An unexpected error occurred. Please try again.');

      console.warn("Error message:", backendMessage);
      showNotification(backendMessage, {}, 'error');
    } finally {
      setIsLoading(false);
      console.log("handleMakeReservation process completed");
    }
  };

  // API: List Active Restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await listActiveRestaurantsApi.get('');
        if (response.status === 200) {
          const fetchedRestaurants = response.data.restaurants.map((restaurant: any) => ({
            restaurantId: restaurant.restaurantId,
            name: restaurant.name,
            address: restaurant.address,
            startTime: restaurant.startTime,
            endTime: restaurant.endTime,
          }));

          setRestaurants(fetchedRestaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showNotification('Failed to load restaurants. Please try again', {}, 'error');
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="consumer-view">
      {/* Header with logo, login button, and search bar */}
      <header className="consumer-header">
        <img src="/logo.svg" alt="Tables4U Logo" className="logo-consumer" />
        <button className="login-button-consumer" onClick={handleOpenLogin}>
          Log in
        </button>
        <div className="search-container-consumer">
          <input type="text" placeholder="Search for a restaurant..." className="search-input-consumer" />
          <button className="search-button-consumer">Search</button>
        </div>
      </header>

      {/* Filters for reservations (date and time) */}
      <section className="filters-section-consumer">
        <button className="my-reservations-button-consumer">My Reservations</button>
        <input type="date" className="date-input-consumer" value={selectedDate} onChange={handleDateChange} />
        <select className="dropdown-consumer">
          <option value="All times">Time</option>
          {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => (
            <option key={hour} value={`${hour}:00`}>
              {`${hour}:00`}
            </option>
          ))}
        </select>
      </section>

      {/* Display list of available restaurants */}
      <section className="results-section-consumer">
        <h3 className="results-title-consumer">Available Restaurants</h3>
        <div className="results-content-consumer">
          {restaurants.length > 0 ? (
            <ul className="results-list-consumer">
              {restaurants.map((restaurant: Restaurant) => (
                <li key={restaurant.restaurantId} className="result-item-consumer">
                  <h4 className="restaurant-name-consumer">{restaurant.name}</h4>
                  <p className="restaurant-info-consumer">
                    <strong>Address:</strong> {restaurant.address}
                  </p>
                  <p className="restaurant-info-consumer">
                    <strong>Open:</strong> {restaurant.startTime.slice(0, 5)}
                  </p>
                  <p className="restaurant-info-consumer">
                    <strong>Close:</strong> {restaurant.endTime.slice(0, 5)}
                  </p>
                  {/* New "Find Reservation" button */}
                  <button
                    className="find-reservation-button-consumer"
                    onClick={() => handleFindReservation(restaurant.restaurantId.toString(), restaurant.name)}
                  >
                    Find Reservation
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-consumer">No restaurants available</div>
          )}
        </div>
      </section>

      {/* Reservation Modal */}
      {isReservationModalVisible && (
        <div className="modal-overlay" onClick={() => setReservationModalVisible(false)}>
          <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setReservationModalVisible(false)}>
              ✕
            </button>
            <h2 className="reservation-title">Make a Reservation for {selectedRestaurantName}</h2>
            <div className="reservation-inputs-container">
              {/* Time Dropdown */}
              <div className="form-group">
                <label htmlFor="reservationTime" className="label-make-reservation">Time:</label>
                <select
                  id="reservationTime"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="reservation-input"
                >
                  <option value="" disabled>Select Time</option>
                  {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => (
                    <option key={hour} value={`${hour}:00`}>
                      {`${hour}:00`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div className="form-group">
                <label htmlFor="reservationDate" className="label-make-reservation">Date:</label>
                <input
                  type="date"
                  id="reservationDate"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="reservation-input"
                />
              </div>

              {/* Seats Dropdown */}
              <div className="form-group">
                <label htmlFor="reservationSeats" className="label-make-reservation">Seats:</label>
                <select
                  id="reservationSeats"
                  value={reservationSeats}
                  onChange={(e) => setReservationSeats(e.target.value)}
                  className="reservation-input"
                >
                  <option value="" disabled>Select Seats</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((seat) => (
                    <option key={seat} value={seat}>
                      {seat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email" className="label-make-reservation">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="reservation-input"
                />
              </div>

              {/* Validation Message */}
              {validationMessage && (
                <p className="form-error-message">{validationMessage}</p>
              )}

              {/* Submit Button */}
              <button
                className="reservation-button"
                onClick={handleMakeReservation}
                disabled={isLoading}
              >
                {isLoading ? 'Making Reservation...' : 'Make Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginVisible && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-button" onClick={handleCloseLogin}>
              ✕
            </button>
            <h2 className="login-title">Log in</h2>
            <div className="login-inputs-container">
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
              <button className="login-button" onClick={handleManager}>
                Login Manager/ Create Restaurant
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