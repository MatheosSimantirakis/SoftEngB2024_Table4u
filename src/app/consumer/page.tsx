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
const makeReservationApi = createApiInstance('https://example.com');
const findExistingReservationApi = createApiInstance('https://example.com');
const cancelExistingReservationApi = createApiInstance('https://example.com');
const loginInfoApi = createApiInstance('https://example.com'); 
const createAdmin = createApiInstance('https://eurgllqs6f.execute-api.us-east-2.amazonaws.com/createUser');
const loginAdmin = createApiInstance('https://r0phmfsst7.execute-api.us-east-2.amazonaws.com/loginUser');

// const [username, setUsername] = useState(''); // Username input state
// const [password, setPassword] = useState(''); // Password input state



// Reusable component for account creation modal
const AccountCreationModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => {
  const [username, setUsername] = useState(''); // Username input state
  const [password, setPassword] = useState(''); // Password input state

  return(<div className="modal-overlay">
    <div className="login-modal">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h2 className="login-title">{title}</h2>
      <div className="login-inputs">
        <input
         type="text"
         placeholder="Username"
         className="login-input"
         value={username}
         onChange={(e) =>
         setUsername(e.target.value)}/>

       <input

        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
        setPassword(e.target.value)}
        className="login-input"/>

      </div>
      <div className="login-buttons">
        <button
         className="create-account-button"
         onClick={async () => {
          try {
            const response = await createAdmin.post('/', {
              username,
              password,
            });
          } catch (error){
            console.error('Error creating account:', error);
          }
        } 
          }>Create Account</button>
          
      </div>
    </div>
  </div>
  )
};

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

  const handleManager = () => {
    router.push('/manager');
  };

  const handleCreateAccount = (role: String) => {
    if (role === 'manager') {
      router.push('/createAdmin');
    } else if (role === 'admin') {
      // Admin-specific logic
    }
  };

  const loginAdinmistrator = async() => {
      try {
        const payload = { username: username, password: password }
        const info = JSON.stringify(payload)
        loginAdmin.post('/', info).then((response) => {
          console.log(response.status)
          

          if(response.data.statusCode === 200){
            router.push('/admin')
          } else {
            //console.error('Login Failed:' + response.status, response.data)
            alert("Login Failed, Check Credentials")
          }
          console.log(response.status)
        }).catch((e) => {
          console.error('Failed logging in, try again later', e);
        })

      } catch (error){
        console.error('Failed logging in, try again later', error);
      }
    }

  // Update the selected date for filtering
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    console.log(`Selected date: ${event.target.value}`);
  };

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
  },
  []);  

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
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-consumer">No restaurants available</div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {isLoginVisible && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-button" onClick={handleCloseLogin}>
              ✕
            </button>
            <h2 className="login-title">Log in</h2>
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
              <button className="login-button" onClick={handleManager}>
                Login Manager/ Create Restaurant
              </button>
              <button
                className="login-button"
                onClick={loginAdinmistrator}
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
