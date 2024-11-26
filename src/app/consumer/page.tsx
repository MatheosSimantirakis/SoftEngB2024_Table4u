'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Consumer, Reservation, Restaurant} from '../../model'

import axios from 'axios';

// Function to create API instances with base URLs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

// Placeholder API instances for backend endpoints
const listActiveRestaurants = createApiInstance('https://example.com');
const searchAvailableRestaurants = createApiInstance('https://example.com');
const searchSpecificRestaurant = createApiInstance('https://example.com');
const makeReservation = createApiInstance('https://example.com');
const findExistingReservation = createApiInstance('https://example.com');
const cancelExistingReservation = createApiInstance('https://example.com');

// Reusable component for account creation modal
const AccountCreationModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="modal-overlay">
    <div className="login-modal">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h2 className="login-title">{title}</h2>
      <div className="login-inputs">
        <input type="text" placeholder="Username" className="login-input" />
        <input type="password" placeholder="Password" className="login-input" />
      </div>
      <div className="login-buttons">
        <button className="create-account-button">Create Account</button>
      </div>
    </div>
  </div>
);
const loginInfo = createApiInstance('https://example.com'); // need to find URL

const ConsumerView: React.FC = () => {
  const [isLoginVisible, setLoginVisible] = useState(false); // Login modal visibility
  const [isCreateManVisible, setCreateManVisible] = useState(false); // Manager account modal visibility
  const [isCreateAdmVisible, setCreateAdmVisible] = useState(false); // Admin account modal visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state for transitions

  const [username, setUsername] = useState(''); // Username input state
  const [password, setPassword] = useState(''); // Password input state

  const [selectedDate, setSelectedDate] = useState(''); // Date filter state
  const router = useRouter(); // Router instance for navigation

  // Show/hide the login modal
  const handleOpenLogin = () => setLoginVisible(true);
  const handleCloseLogin = () => setLoginVisible(false);

  // Show/hide the account creation modals, ensuring only one modal is visible
  const openCreateManager = () => {
    setLoginVisible(false);
    setCreateManVisible(true);
  };

  const closeCreateManager = () => setCreateManVisible(false);

  const openCreateAdmin = () => {
    setLoginVisible(false);
    setCreateAdmVisible(true);
  };

  // const openCreateMananger = () => {
  //   setCreateManVisible(true);
  // }

  // const closeCreateManager = () => {
  //   setCreateManVisible(false); 
  // }

  // const openCreateAdmin = () => {
  //   setCreateAdmVisible(true);
  // }

  // const closeCreateAdmin = () => {
  //   setCreateAdmVisible(false); 
  // }



  const closeCreateAdmin = () => setCreateAdmVisible(false);

  // Handle login based on role and redirect
  const handleLogin = async (role: string) => {
    setIsLoading(true); // Set loading state
    if (role === 'manager') {
      await router.push('/manager'); // Redirect to manager dashboard
    } else if (role === 'admin') {
      await router.push('/admin'); // Redirect to admin dashboard
    }
    setIsLoading(false); // Clear loading state
    setLoginVisible(false); // Close login modal
  };

  const handleManager = () => {
    router.push('/manager'); 
  }

  const handleCreateAccount = (role: String) =>{
    if(role === 'manager'){
      router.push('/createAdmin')
    } else if (role ='admin'){
      
    }
  }

  // Update the selected date for filtering
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
              <button
                className="login-button"
                onClick={handleManager}
              >
                Login Manager/Create Restaurant
              </button>
              {/* <button
               className='create-account-button'
               onClick={() =>openCreateManager()}

               >
                Create Manager?
                </button>
 */}

              <button
                className="login-button"
                onClick={async () =>{
                  try{
                    const response = await loginInfo.post('https://tcg8mewv25.execute-api.us-east-2.amazonaws.com/login',{
                      action: 'register',
                      username,
                      password, 
                      role: 'Admin',
                    });

                    if(response.status === 201){
                      alert('Administrator created successfully'); 
                      closeCreateAdmin
                    } else {
                      alert('Error creating : ' + response.data.message); 
                    }
                  } catch (err) {
                    console.error('Error creating administrator:', err);
                    alert("An error occurred. Please try again."); 
                  }
                } }
              >
                Login as Administrator
              </button>
              
              
                {/* <button
               className='create-account-button'
               onClick={() =>openCreateAdmin()}
               >
                Create Administrator?
                </button> */}
            </div>
            <div className="create-account-link-container">
              {/* <span className="create-account-link" onClick={openCreateManager}>
                Create Manager Account
              </span> */}
              <span className="create-account-link" onClick={openCreateAdmin}>
                Create Administrator Account
              </span>
            </div>
          </div>
        </div>
      )}

{isCreateAdmVisible &&(
        <div className="modal-overlay">
        <div className="login-modal">
          <button className="close-button" onClick={closeCreateAdmin}>
            ✕
          </button>
          <h2 className="login-title">Create Aministrator</h2>
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
            <button className='login-button'>
              
  
            </button>
            
          </div>
        </div>
      </div>
      )}

      {/* Account Creation Modals */}
      {isCreateManVisible && <AccountCreationModal title="Create Manager Account" onClose={closeCreateManager} />}
      {isCreateAdmVisible && <AccountCreationModal title="Create Administrator Account" onClose={closeCreateAdmin} />}
    </div>
  );
};

export default ConsumerView;
