'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Restaurant, Reservation } from '../types';

// Dynamic baseURL for all APIs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

const generateAvailabilityReportApi = createApiInstance('https://example.com'); // Replace with actual URL
const deleteRestaurantApi = createApiInstance('https://example.com'); // Replace with actual URL
const cancelReservationApi = createApiInstance('https://example.com'); // Replace with actual URL

export default function RestaurantPage() {
  const { restaurantName } = useParams() as { restaurantName: string };
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Only allow one API call at a time
  const [name] = useState<string>(restaurantName || ''); // Initialize name from route params
  const [date, setDate] = useState(new Date()); // Tracks the currently selected date
  const [canGoBack, setCanGoBack] = useState(false); // Controls the visibility of the "Previous Day" button
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Controls the delete confirmation popup
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });

  // Sample reservation data using the Reservation type
  const [reservations] = useState<Reservation[]>([
    { seats: 2, table: { tableNumber: 1, num_seats: 4, available: true }, time: 10, id: 101, confirmationCode: 12345 },
    { seats: 4, table: { tableNumber: 2, num_seats: 4, available: true }, time: 11.5, id: 102, confirmationCode: 12346 },
    { seats: 1, table: { tableNumber: 3, num_seats: 2, available: true }, time: 13, id: 103, confirmationCode: 12347 },
  ]);

  // Handles changes in the selected date
  const handleDateChange = (days: number) => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);

      // Ensure the user cannot navigate to a past date before today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

      setCanGoBack(newDate >= today); // Enable or disable the "Previous Day" button
      return newDate;
    });
  };

  // Notification component
  const Notification = ({ message, visible, type }: { message: string; visible: boolean; type: string }) => {
    if (!visible) return null;
    return <div className={`notification ${type}`}>{message}</div>;
  };

  // Helper function to show notifications for 3 seconds
  const showNotification = (
    message: string,
    params: Record<string, string> = {},
    type: string = 'success'
  ) => {
    const formattedMessage = Object.keys(params).reduce(
      (msg, key) => msg.replace(`{${key}}`, params[key]),
      message
    );
    setNotification({ message: formattedMessage, visible: true, type });
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: '' });
    }, 3000);
  };

  // Handles opening and closing of the delete confirmation popup
  const handleDeleteClick = () => setShowDeleteConfirmation(true);
  const cancelDelete = () => setShowDeleteConfirmation(false);

  // API: Delete Restaurant
  const handleDeleteRestaurant = async () => {
    console.log('Sending request to delete restaurant:', { name });

    try {
      const response = await deleteRestaurantApi.post('/deleteRestaurant', { name });
      console.log('API response:', response.data);

      if (response.data.statusCode === 200) {
        setShowDeleteConfirmation(false);
        showNotification(`Successfully deleted ${name}`);
      } else {
        console.error('Failed to delete restaurant:', response.data.body);
        showNotification('Failed to delete restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      setError('An error occurred while deleting the restaurant.');
    }
  };

  return (
    <>
      <div className="page-container">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="left-panel-header">
            <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
            <h2 className="left-panel-subtitle">Administrator View</h2>
          </div>
          <div className="action-button-container">
            <button className="action-button" onClick={() => showNotification('Reservation cancelled')}>
              Cancel Reservation
            </button>
            <button className="action-button" onClick={() => showNotification('Availability report generated')}>
              Generate Availability Report
            </button>
            <button className="delete-restaurant-button" onClick={handleDeleteClick}>
              Delete Restaurant
            </button>
          </div>
          <div className="back-button-container">
            <button className="left-panel-back-button" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <h1 className="restaurant-name-admin">{name || 'Loading...'}</h1>
          <div className="content-box-admin">
            <p>
              Reservation data for {name || 'this restaurant'} on {date.toDateString()}:
            </p>
            <ul>
              {reservations.map((reservation) => (
                <li key={reservation.id}>
                  {reservation.time}:00 - {reservation.table.num_seats} seats reserved by {reservation.confirmationCode}
                </li>
              ))}
            </ul>
          </div>
          <div className="date-navigation-admin">
            {canGoBack && (
              <button className="nav-button-admin" onClick={() => handleDateChange(-1)}>
                &lt; Previous Day
              </button>
            )}
            <button className="nav-button-admin" onClick={() => handleDateChange(1)}>
              Next Day &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-confirmation-popup" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete {name}?</p>
            <button
              className="confirm-button"
              onClick={() => showNotification(`Restaurant ${name} deleted`)}
            >
              Yes, Delete
            </button>
            <button className="cancel-button" onClick={cancelDelete}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notification Component */}
      {notification.visible && (
        <Notification
          message={notification.message}
          visible={notification.visible}
          type={notification.type}
        />
      )}
    </>
  );
}