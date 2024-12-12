'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AxiosError } from 'axios';
import {
  Reservation,
  Restaurant
} from '../types';

// Function to create API instances with base URLs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

// Placeholder API instances for backend endpoints
const listActiveRestaurantsApi = createApiInstance('https://m0ppkn17qc.execute-api.us-east-2.amazonaws.com/listActiveRestaurants');
const searchSpecificRestaurantsApi = createApiInstance('https://qdvwwcho2c.execute-api.us-east-2.amazonaws.com/searchSpecificRestaurants');
const searchActiveRestaurantsApi = createApiInstance('https://isfqvx6a4g.execute-api.us-east-2.amazonaws.com/searchActiveRestaurants');
const makeReservationApi = createApiInstance('https://cogjtdgnmh.execute-api.us-east-2.amazonaws.com/makeReservation');
const findReservationApi = createApiInstance('https://0lfhd5uy74.execute-api.us-east-2.amazonaws.com/findReservation');
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
  const [isFindReservationModalVisible, setIsFindReservationModalVisible] = useState(false); // Tracks visibility of the Find Reservation modal
  const [findEmail, setFindEmail] = useState(''); // Stores the email input for the Find Reservation modal
  const [confirmationId, setConfirmationId] = useState(''); // Stores the confirmation ID input for the Find Reservation modal
  const [reservationDetails, setReservationDetails] = useState<Reservation | null>(null); // Store retrieved reservation details
  const [isViewingReservation, setIsViewingReservation] = useState(false); // Toggle to show reservation details
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false); // Toggle Search Functionality
  const router = useRouter(); // Router instance for navigation'

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

  // Function to adjust for timezone 
  const getESTDateString = (date = new Date()) => {
    const estOffset = -5; // EST is UTC-5
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000); // Convert to UTC
    const estDate = new Date(utcDate.getTime() + estOffset * 60 * 60 * 1000); // Apply EST offset
    return estDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
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
    setIsLoading(true);
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
  const handleMakeReservationModal = (restaurantId: string, restaurantName: string) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedRestaurantName(restaurantName);
    setReservationModalVisible(true);
  };

  // Opens the Find Reservation modal by setting its visibility to true
  const handleOpenFindReservationModal = () => setIsFindReservationModalVisible(true);

  // Closes the Find Reservation modal by setting its visibility to false and resetting fields
  const handleCloseFindReservationModal = () => {
    setIsFindReservationModalVisible(false);
    setFindEmail(''); // Clear the email input
    setConfirmationId(''); // Clear the confirmation ID input
    setIsViewingReservation(false); // Reset viewing state if needed
  };

  // Handles the action for finding a reservation
  const handleFindReservationModalAction = () => {
    if (!findEmail || !confirmationId) {
      alert('Please fill in both Email and Confirmation ID');
      return;
    }
    // Placeholder action to simulate finding a reservation
    alert(`Finding reservation for Email: ${findEmail} and Confirmation ID: ${confirmationId}`);
    setIsFindReservationModalVisible(false);
  };

  // Update the selected date for filtering
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    console.log(`Selected date (EST): ${getESTDateString(new Date(event.target.value))}`);
  };

  // API: Make Reservation
  async function handleMakeReservation() {
    // Validate input
    if (!reservationTime || !reservationDate || !reservationSeats || !email) {
      console.warn("Validation failed: Missing required fields");
      setValidationMessage("All fields are required");
      return;
    }

    const requestData = {
      restaurantId: selectedRestaurantId,
      date: reservationDate,
      time: reservationTime,
      seats: parseInt(reservationSeats, 10),
      email,
    };

    console.log("Request Data:", requestData);

    setIsLoading(true);

    try {
      const response = await makeReservationApi.post("/", requestData);

      if (response.data.statusCode === 200) {
        const parsedBody = JSON.parse(response.data.body);
        console.log(`Reservation ID: ${parsedBody.reservationId}`);
        showNotification(`Reservation created successfully! ID: ${parsedBody.reservationId}`, {}, "success");
        setReservationModalVisible(false);
      } else if (response.data.statusCode === 400) {
        const parsedBody = JSON.parse(response.data.body);
        console.warn(`Bad request: ${parsedBody.message}`);
        showNotification(parsedBody.message || "Error creating reservation.", {}, "error");
      } else {
        console.error(`Unexpected status code: ${response.status}`);
        showNotification("An unexpected error occurred. Please try again.", {}, "error");
      }
    } catch (error: any) {
      console.error("Error during reservation creation:", error);
      const errorMessage = error?.response?.data?.message || "Unexpected error occurred.";
      showNotification(errorMessage, {}, "error");
    }
    setIsLoading(false);
  }

  // API: Find Reservation
  const handleFindReservation = async () => {
    console.log("Starting find reservation process...");

    // Validate input fields
    if (!findEmail || !confirmationId) {
      console.log("Validation failed: Missing Email or Confirmation ID");
      showNotification("Please fill in both Email and Confirmation ID", {}, "error");
      return;
    }

    try {
      console.log("Sending API request with:", { email: findEmail, reservationId: confirmationId });

      // API request to find reservation
      const response = await findReservationApi.post("/", { email: findEmail, reservationId: confirmationId });
      console.log("API response received:", response.data);

      if (response.data.statusCode === 200) {
        const reservation = JSON.parse(response.data.body)?.message[0];

        if (reservation) {
          console.log("Reservation found:", reservation);

          // Save the reservation details, including the ID
          setReservationDetails({
            ...reservation,
            id: confirmationId, // Ensure the reservation ID is stored correctly
          });

          setIsViewingReservation(true);
          showNotification("Reservation found successfully!", {}, "success");
        } else {
          console.error("Reservation details are missing in the response.");
          showNotification("Unable to retrieve reservation details.", {}, "error");
        }
      } else if (response.data.statusCode === 400) {
        const parsedBody = JSON.parse(response.data.body); // Parse the body to extract the error message
        console.warn("API returned error with status 400:", parsedBody.message);
        showNotification(parsedBody.message || "Could not find reservation.", {}, "error");
      } else {
        console.error("Unexpected status code:", response.data.statusCode);
        showNotification("An unexpected error occurred. Please try again.", {}, "error");
      }
    } catch (error: any) {
      console.error("Error occurred during find reservation:", error);
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred.";
      showNotification(errorMessage, {}, "error");
    } finally {
      setIsLoading(false);
      console.log("Find reservation process completed.");
    }
  };

  // API: Cancel Reservation
  const handleCancelReservation = async () => {
    console.log("Starting cancel reservation process...");

    // Validate if reservationDetails contains an id
    if (!reservationDetails?.id) {
      console.error("Reservation ID not available for cancellation.");
      showNotification("Reservation ID is missing. Cannot cancel the reservation.", {}, "error");
      return;
    }

    const requestData = {
      reservationId: reservationDetails.id, // Use the saved ID
      date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    };

    try {
      console.log("Sending cancellation request with:", requestData);

      // Send API request to cancel the reservation
      const response = await cancelExistingReservationApi.post("/", requestData);
      console.log("API  response:", response);
      
      if (response.status === 200) {
        const { message } = response.data;
        console.log("Cancellation successful:", message);
        showNotification("Reservation canceled successfully", {}, "success");

        // Clear the reservation details and input fields after successful cancellation
        setReservationDetails(null);
        setIsViewingReservation(false);
        setFindEmail(""); // Clear the email input
        setConfirmationId(""); // Clear the confirmation ID input
      } else if (response.status === 400) {
        const { message } = response.data;
        console.warn("Cancellation failed:", message);
        showNotification(message || "Unable to cancel the reservation.", {}, "error");
      } else {
        console.error("Unexpected status code:", response.data.StatusCode);
        showNotification("An unexpected error occurred. Please try again.", {}, "error");
      }
    } catch (error: any) {
      console.error("Error during cancellation:", error);
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred.";
      showNotification(errorMessage, {}, "error");
    } finally {
      console.log("Cancel reservation process completed.");
    }
  };

  // API: Search Active Restaurants
  const handleSearchActiveRestaurants = async () => {
    // Check if the search query is empty or only contains spaces
    if (!searchQuery.trim()) {
      showNotification("Please enter a search query.", {}, "error");
      return; // Exit the function if the search query is invalid
    }

    setIsLoading(true);

    try {
      const response = await searchActiveRestaurantsApi.post('', { name: searchQuery.trim() });

      if (response.data.statusCode === 200) {
        // If the response is successful, update the restaurants state with the search results
        const restaurants = response.data.restaurants;
        setRestaurants(restaurants);

        // Mark the search as active to show the "Go Back" button
        setIsSearchActive(true);
      } else if (response.data.statusCode === 400) {
        // Handle the case where no matching restaurants are found
        showNotification("No matching restaurants found.", {}, "error");
      } else {
        // Handle unexpected status codes
        console.error("Unexpected status code:", response.data.statusCode);
        showNotification("An unexpected error occurred. Please try again.", {}, "error");
      }
    } catch (error) {
      // Handle errors that occur during the API request
      console.error("Error searching for active restaurants:", error);
      showNotification("An error occurred while searching. Please try again.", {}, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // API: Search Specific Restaurants
  const handleSearchSpecificRestaurants = async () => {
    // Validate that at least one filter option (date, time, or seats) is selected
    if (!selectedDate && !reservationTime && !reservationSeats) {
      console.log("No filters selected. Prompting user to select a filter."); // Debugging log
      showNotification("Please select at least one filter option (date, time, or seats).", {}, "error");
      return; // Exit if no filters are selected
    }

    const requestData = {
      date: selectedDate || null,
      time: reservationTime || null,
      seats: reservationSeats ? parseInt(reservationSeats, 10) : null,
    };

    console.log("Filter Search Request Data:", requestData);

    setIsLoading(true);
    try {
      console.log("Sending API request for filtered search...");

      // Send the API request with the selected filters
      const response = await searchSpecificRestaurantsApi.post('/', requestData);

      console.log("API Response:", response.data);

      if (response.data.statusCode === 200) {
        const fetchedRestaurants = response.data.availableRestaurants.map((restaurant: any) => ({
          restaurantId: restaurant.restaurantId,
          name: restaurant.name,
          address: restaurant.address,
          startTime: restaurant.startTime,
          endTime: restaurant.endTime,
        }));

        console.log("Fetched Restaurants:", fetchedRestaurants);

        setRestaurants(fetchedRestaurants);
        setIsSearchActive(true);
      } else if (response.data.statusCode === 404) {
        console.warn("No restaurants matching the selected criteria", requestData);
        showNotification("No restaurants matching the selected criteria", {}, "error");
      } else {
        console.error("Unexpected status code:", response.data.statusCode);
        showNotification("An unexpected error occurred. Please try again.", {}, "error");
      }
    } catch (error) {
      console.error("Error during filtered search:", error);
      showNotification("An error occurred while performing the search. Please try again.", {}, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // API: List Active Restaurants
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

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="consumer-view">
      {/* Header with logo, login button, and search bar */}
      <header className="consumer-header">

        {/* Logo */}
        <img src="/logo.svg" alt="Tables4U Logo" className="logo-consumer" />

        <div className="header-buttons-container">

          {/* Find Reservation Button */}
          <button
            className="find-reservations-button-consumer"
            onClick={handleOpenFindReservationModal}
          >
            Find Reservations
          </button>

          {/* Log In Button */}
          <button className="login-button-consumer" onClick={handleOpenLogin}>
            Log in
          </button>

        </div>

        {/* Search Bar */}
        <div className="search-container-consumer">
          <input
            type="text"
            placeholder="Search for a restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-consumer"
          />
          <button
            className="search-button-consumer"
            onClick={handleSearchActiveRestaurants}
            disabled={isLoading || !searchQuery.trim()}
          >
            Search
          </button>
        </div>
      </header>

      {/* Sub menu for finding reservation, filtering by time, date and number of seats */}
      <section className="filters-section-consumer">

        {/* Date Picker */}
        <input
          type="date"
          className="date-input-consumer"
          value={selectedDate}
          onChange={handleDateChange}
          min={getESTDateString()}
        />

        {/* Time Dropdown */}
        <select
          className="dropdown-consumer"
          onChange={(e) => setReservationTime(e.target.value)}
          value={reservationDate || getESTDateString()}
        >
          <option value="">Time</option>
          {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => (
            <option key={hour} value={`${hour}:00`}>
              {`${hour}:00`}
            </option>
          ))}
        </select>

        {/* Seats Dropdown */}
        <select
          className="dropdown-consumer"
          onChange={(e) => setReservationSeats(e.target.value)}
          value={reservationSeats}
        >
          <option value="">Seats</option>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((seat) => (
            <option key={seat} value={seat}>
              {seat}
            </option>
          ))}
        </select>

        {/* Filtered Search Button */}
        <button
          className="filter-search-button-consumer"
          onClick={handleSearchSpecificRestaurants}
          disabled={isLoading}
        >
          Filtered Search
        </button>
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
                  <button
                    className="make-reservation-button-consumer"
                    onClick={() =>
                      handleMakeReservationModal(
                        restaurant.restaurantId.toString(),
                        restaurant.name
                      )
                    }
                  >
                    Make Reservation
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-consumer">No restaurants available</div>
          )}
        </div>

        {/* Go Back button */}
        {isSearchActive && (
          <button
            className="go-back-button-consumer"
            onClick={() => {
              fetchRestaurants();
              setIsSearchActive(false);
            }}
            disabled={isLoading}
          >
            Go Back
          </button>
        )}
      </section>

      {/* Reservation Modal */}
      {isReservationModalVisible && (
        <div className="modal-overlay" onClick={() => setReservationModalVisible(false)}>
          <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setReservationModalVisible(false)}>
              ✕
            </button>
            <h2 className="reservation-title-consumer">Make a Reservation for {selectedRestaurantName}</h2>
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
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((seat) => (
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Validate email as the user types
                    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailPattern.test(e.target.value)) {
                      setValidationMessage("Invalid email address");
                    } else {
                      setValidationMessage(""); // Clear the message if the email is valid
                    }
                  }}
                  className="reservation-input"
                />
              </div>

              {/* Validation Message */}
              {validationMessage && (
                <p className="reservation-popup-error-message">{validationMessage}</p>
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

      {/* Find Reservation Modal */}
      {isFindReservationModalVisible && (
        <div className="modal-overlay" onClick={handleCloseFindReservationModal}>
          <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseFindReservationModal}>
              ✕
            </button>
            {isViewingReservation ? (
              // Display reservation details when the user is viewing their reservation
              <div>
                <h2 className="reservation-title-consumer">Reservation Details</h2>
                <div className="reservation-detail-consumer"><strong>Email:</strong> {reservationDetails?.email ?? 'N/A'}</div>
                <div className="reservation-detail-consumer">
                  <strong>Date:</strong> {reservationDetails?.date
                    ? new Date(reservationDetails.date).toLocaleDateString()
                    : 'N/A'}
                </div>
                <div className="reservation-detail-consumer">
                  <strong>Time:</strong> {reservationDetails?.time ? reservationDetails.time.slice(0, 5) : 'N/A'}
                </div>
                <div className="reservation-detail-consumer"><strong>Seats:</strong> {reservationDetails?.seats ?? 'N/A'}</div>
                <button
                  className="cancel-reservation-button-consumer"
                  onClick={handleCancelReservation}
                >
                  Cancel Reservation
                </button>
                <p className="cancel-policy-text">*Cancellations must be 24 hours in advance</p>
              </div>
            ) : (
              <div>
                <h2 className="reservation-title-consumer">Find Reservation</h2>
                <div className="find-reservation-inputs-container">
                  {/* Email Input */}
                  <div className="form-group">
                    <label htmlFor="findEmail" className="label-find-reservation">Email:</label>
                    <input
                      type="email"
                      id="findEmail"
                      value={findEmail}
                      onChange={(e) => setFindEmail(e.target.value)}
                      className="reservation-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  {/* Confirmation ID Input */}
                  <div className="form-group">
                    <label htmlFor="confirmationId" className="label-find-reservation">Confirmation ID:</label>
                    <input
                      type="text"
                      id="confirmationId"
                      value={confirmationId}
                      onChange={(e) => setConfirmationId(e.target.value)}
                      className="reservation-input"
                      placeholder="Enter your confirmation ID"
                    />
                  </div>
                  {/* Find Reservation Button */}
                  <button
                    className="find-my-reservation-button"
                    onClick={handleFindReservation}
                  >
                    Find my reservation
                  </button>
                </div>
              </div>
            )}
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