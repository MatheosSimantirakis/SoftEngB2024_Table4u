'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Table,
  TableEntryProps,
  DateEntryProps,
  FormWrapperProps,
} from '../types';

// Dynamic baseURL for all APIs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

// baseURLs for APIs
const createRestaurantApi = createApiInstance('https://kwd94qobx2.execute-api.us-east-2.amazonaws.com');
const editRestaurantApi = createApiInstance('https://doo8y94tle.execute-api.us-east-2.amazonaws.com');
const openDaysApi = createApiInstance('https://example.com'); // Replace with actual URL
const closeDayApi = createApiInstance('https://example.com'); // Replace with actual URL
const reviewAvailabilityApi = createApiInstance('https://example.com'); // Replace with actual URL
const deleteRestaurantApi = createApiInstance('https://ub4vssj8g4.execute-api.us-east-2.amazonaws.com');
const activateRestaurantApi = createApiInstance('https://ys2gzedx59.execute-api.us-east-2.amazonaws.com');

// Reusable component for wrapping forms with a consistent layout
const FormWrapper: React.FC<FormWrapperProps> = ({ title, children }) => (
  <div className="form-wrapper">
    <h1 className="form-title">{title}</h1>
    <div className="form-content">{children}</div>
  </div>
);

// Reusable component for managing a single table entry in the table list
const TableEntry: React.FC<TableEntryProps> = ({ table, updateSeats, removeTable }) => (
  <div className="table-entry">
    <label>Table {table.tableNumber}</label>
    <select
      value={table.num_seats === 1 ? '' : table.num_seats}
      onChange={(e) => updateSeats(table.tableNumber, parseInt(e.target.value) || 1)}
    >
      <option value="" disabled>Seats</option>
      {Array.from({ length: 20 }, (_, i) => i + 1).map((seatCount) => (
        <option key={seatCount} value={seatCount}>{seatCount}</option>
      ))}
    </select>
    <button
      type="button"
      className="remove-table-button"
      onClick={() => removeTable(table.tableNumber)}
    >
      Remove Table
    </button>
  </div>
);

// Reusable component for managing a single date entry in the date list
const DateEntry: React.FC<DateEntryProps> = ({ date, index, removeDate }) => (
  <div className="date-entry">
    <label>{date}</label>
    <button
      type="button"
      className="remove-date-button"
      onClick={() => removeDate(index)}
    >
      Remove Date
    </button>
  </div>
);

// Notification component
const Notification = ({ message, visible, type }: { message: string; visible: boolean; type: string }) => {
  if (!visible) return null;
  return <div className={`notification ${type}`}>{message}</div>;
};

const ManagerView = (): JSX.Element => {
  const [currentForm, setCurrentForm] = useState<string | null>(null); // Tracks the currently open form (create, edit...)
  const [isActivated, setIsActivated] = useState(false); // Whether the restaurant is activated
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Visibility of the delete confirmation modal
  const [hasRestaurant, setHasRestaurant] = useState(false); // Whether a restaurant has been created
  const [name, setName] = useState(''); // Name of the restaurant
  const [address, setAddress] = useState(''); // Address of the restaurant
  const [numTables, setNumTables] = useState(''); // Total number of tables in the restaurant
  const [startTime, setStartTime] = useState(''); // Opening time of the restaurant
  const [endTime, setEndTime] = useState(''); // Closing time of the restaurant
  const [datesOpen, setDatesOpen] = useState<string[]>([]); // List of dates the restaurant is open
  const [tables, setTables] = useState<Table[]>([]); // Array of tables and their details
  const [nextTableNumber, setNextTableNumber] = useState(1); // Next available number for adding a new table
  const [date, setDate] = useState(''); // Selected date for opening or closing the restaurant
  const [error, setError] = useState(''); // Error messages for the form or actions
  const router = useRouter(); // Router instance for navigation
  const [showActivatePopup, setShowActivatePopup] = useState(false); // To show/hide the activate popup
  const [activateRestaurantId, setActivateRestaurantId] = useState(''); // To store the entered restaurant ID
  const [showInitialPopup, setShowInitialPopup] = useState(true); // For the initial popup
  const [restaurantId, setRestaurantId] = useState(''); // For the restaurant ID entered in the popup

  // Function for on-screen notifications
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });

  // Function to remove a table by its ID
  const removeTable = (id: number) => {
    setTables((prev) => {
      const updatedTables = prev.filter((table) => table.tableNumber !== id);

      // Reset nextTableNumber to 1 if no tables remain
      if (updatedTables.length === 0) {
        setNextTableNumber(1);
      }

      return updatedTables;
    });
  };

  // Function to add a new table
  const addTable = () => {
    setTables((prev) => [
      ...prev,
      { tableNumber: nextTableNumber, num_seats: 1, available: true },
    ]);
    setNextTableNumber((previousNumber) => previousNumber + 1); // Increment the number for the next table
  };

  // Function to update the number of seats for a specific table
  const updateSeats = (tableNumber: number, num_seats: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.tableNumber === tableNumber ? { ...table, num_seats } : table
      )
    );
  };

  // Handler for toggle forms
  const handleToggleForm = (form: string | null) => {
    setCurrentForm(currentForm === form ? null : form);
    resetState();
  };

  // Reset form after closing out
  const resetState = () => {
    setTables([]);
    setDatesOpen([]);
    setError('');
  };

  // Hide Activate Restaurant popup and reset input
  const handleActivateClick = () => setShowActivatePopup(true); // Show popup
  const cancelActivate = () => {
    setShowActivatePopup(false);
    setActivateRestaurantId('');
  };

  // Format date as MM/DD/YYYY
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
  };

  // Allow activation only if not already activated
  const handleToggleSwitch = async () => {
    console.log('Toggling activation for:', name);

    if (!isActivated) {
      try {
        const payload = { id: activateRestaurantId }; // Replace `activateRestaurantId` with the correct ID source
        const response = await activateRestaurantApi.post('/activateRestaurant', payload);

        if (response.status === 200) {
          setIsActivated(true);
          console.log('Restaurant activated successfully:', response.data);
        } else {
          console.error('Failed to activate restaurant:', response.data);
          setError('Failed to activate restaurant.');
        }
      } catch (error) {
        console.error('Error activating the restaurant:', error);
        setError('Failed to activate restaurant.');
      }
    }
  };

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

  // Go back to consumer 
  const handleGoBack = () => router.push('/consumer');


  // Handles submission of the restaurant ID entered by the manager
  const handleSubmitRestaurantId = () => {
    if (restaurantId.trim() === '') {
      setError('Please enter a valid restaurant ID.');
      return;
    }
    setHasRestaurant(true);
    setShowInitialPopup(false);
    setError('');
  };

  // Handles the case when the manager doesn't have a restaurant
  const handleNoRestaurant = () => {
    setShowInitialPopup(false);
    setError(''); // Clear any errors
  };

  // API: Create Restaurant
  const handleCreateRestaurant = async () => {
    if (!name || !address) {
      setError('Name and Address are required.');
      return;
    }

    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Default values for optional fields
    const payload = {
      name,
      address,
      startTime: startTime || '08:00', // Default to 8:00 if not provided
      endTime: endTime || '23:00', // Default to 23:00 if not provided
      openDays: datesOpen.length > 0 ? datesOpen : [today], // Default to current day if not provided
      tables: tables.length > 0
        ? tables.map((table) => ({
          tableNumber: table.tableNumber,
          seats: table.num_seats,
        }))
        : [{ tableNumber: 1, seats: 1 }], // Default to one table with one seat
    };

    console.log('Sending payload to create restaurant API:', payload);

    try {
      const response = await createRestaurantApi.post('/create-restaurant', payload);

      if (response.data.statusCode === 200) {
        setHasRestaurant(true);
        setCurrentForm(null);
        setName('');
        setAddress('');
        setStartTime('');
        setEndTime('');
        setDatesOpen([]);
        setTables([]);

        const message =
          JSON.parse(response.data.body)?.message || 'Restaurant created successfully';
        showNotification(`${message}`);
      } else {
        console.error('API responded with an error:', response.data);
        showNotification('Could not create Restaurant', {}, 'error');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        setError(`API Error: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // API: Edit Restaurant
  const handleEditRestaurant = async () => {
    if (!restaurantId || !name || !address || !startTime || !endTime || tables.length === 0) {
      setError('All fields are required, including ID, name, address, opening/closing times, and tables.');
      return;
    }

    try {
      const payload = {
        id: restaurantId,
        name,
        address,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        tables: tables.map((table) => ({
          tableNumber: table.tableNumber,
          seats: table.num_seats,
        })),
      };

      console.log('Sending API request to edit restaurant with payload:', payload);

      const response = await editRestaurantApi.post('/editRestaurant', payload);

      if (response.data.statusCode === 200) {
        showNotification(`Successfully updated ${name}`);
        setCurrentForm(null);
        resetState();
      } else {
        console.error('API error:', response.data.body || response.data);
        showNotification('Failed to update restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Error editing restaurant:', error);
      setError('An error occurred while editing the restaurant.');
    }
  };

  // API: Open Future Day
  const handleOpenFutureDay = async () => {
    if (date) {
      openDaysApi
        .post('/open-day', { date })
        .then(() => {
          showNotification(`Future day ${date} opened successfully`);
          setDate('');
          setCurrentForm(null);
        })
        .catch((error) => {
          console.error('Error opening future day:', error);
          showNotification('Failed to set future day open', {}, 'error');
        });
    } else {
      showNotification('Date is required.', {}, 'error');
    }
  };

  // API: Close Future Day
  const handleCloseFutureDay = async () => {
    if (date) {
      closeDayApi
        .post('/close-day', { date })
        .then(() => {
          showNotification(`Future day ${date} closed successfully`);
          setDate('');
          setCurrentForm(null);
        })
        .catch((error) => {
          console.error('Error closing future day:', error);
          showNotification('Failed to set future day close', {}, 'error');
        });
    } else {
      setError('Date is required.');
    }
  };

  // API: Review Availability
  const handleReviewAvailability = async () => {
    reviewAvailabilityApi
      .get('/availability')
      .then((response) => {
        console.log('Availability:', response.data);
        setCurrentForm(null);
      })
      .catch((error) => {
        console.error('Error fetching availability:', error);
        showNotification('Failed to fetch availability data', {}, 'error');
      });
  };

  // API: Delete Restaurant
  const handleDeleteRestaurant = async () => {
    if (!restaurantId) {
      setError('Restaurant ID is required to delete.');
      showNotification('Restaurant ID is required.', {}, 'error');
      console.error('Error: Restaurant ID is missing.');
      return;
    }

    console.log('Sending request to delete restaurant:', { restaurantId });

    try {
      const response = await deleteRestaurantApi.post('/deleteRestaurant', { restaurantId });
      console.log('API response:', response.data);

      if (response.status === 200) {
        setShowDeleteConfirmation(false);
        setHasRestaurant(false);
        setIsActivated(false);
        setCurrentForm(null);
        showNotification(`Successfully deleted restaurant`);
        setRestaurantId('');
      } else {
        console.error('Failed to delete restaurant:', response.data);
        showNotification('Failed to delete restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      setError('An error occurred while deleting the restaurant.');
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirmation(true);
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setRestaurantId('');
  };

  // API: Activate Restaurant
  const handleActivateRestaurant = async () => {
    if (!activateRestaurantId) {
      setError('Restaurant ID is required to delete.');
      showNotification('Restaurant ID is required.', {}, 'error');
      console.error('Error: Restaurant ID is missing.');
      return;
    }

    try {
      const payload = { restaurantId: activateRestaurantId };
      console.log('Sending request to activate restaurant:', payload);

      const response = await activateRestaurantApi.post('/activateRestaurant', payload);

      if (response.status === 200) {
        console.log("test");
        showNotification(`Successfully activated restaurant with ID ${activateRestaurantId}`);
        setShowActivatePopup(false);
        setActivateRestaurantId('');
        setIsActivated(true);
      } else {
        console.error('Failed to activate restaurant:', response.data);
        showNotification('Failed to activate restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Error activating restaurant:', error);
      showNotification('An error occurred while activating the restaurant.', {}, 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Initial Popup asking if the Manager has a restaurant already or not */}
      {showInitialPopup && (
        <div className="modal-overlay">
          <div className="existing-restaurant-popup">
            <h2>Do you an existing restaurant?</h2>
            <input
              type="text"
              placeholder="Restaurant ID"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="popup-input"
            />
            {error && <p className="form-error-message">{error}</p>}
            <div className="popup-buttons">
              <button className="id-submit-button" onClick={handleSubmitRestaurantId}>
                Find Existing Restaurant
              </button>
              <button className="cancel-button" onClick={handleNoRestaurant}>
                I Don't Have One
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel: Contains Logo, Subheading, and Action Buttons */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Manager View</h2>
        </div>
        <div className="action-button-container">
          {/* Show the "Create Restaurant" button only if the user doesn't have a restaurant */}
          {!hasRestaurant && (
            <button
              className={`action-button ${currentForm === 'create' ? 'active' : ''}`}
              onClick={() => handleToggleForm('create')}
            >
              {currentForm === 'create' ? 'Exit' : 'Create Restaurant'}
            </button>
          )}

          {/* Show other buttons only if the user has a restaurant */}
          {hasRestaurant && (
            <>
              {/* Show the "Activate Restaurant" button only if the user hasn't activated the restaurant yet */}
              {!isActivated && (
                <button
                  className="action-button"
                  onClick={handleActivateClick}
                >
                  Activate Restaurant
                </button>
              )}

              {/* Show the "Edit Restaurant" button only if the restaurant is not activated */}
              {!isActivated && (
                <button
                  className={`action-button ${currentForm === 'edit' ? 'active' : ''}`}
                  onClick={() => handleToggleForm('edit')}
                >
                  {currentForm === 'edit' ? 'Exit' : 'Edit Restaurant'}
                </button>
              )}

              {/* Open Future Day Button */}
              <button
                className={`action-button ${currentForm === 'open' ? 'active' : ''}`}
                onClick={() => handleToggleForm('open')}
              >
                {currentForm === 'open' ? 'Exit' : 'Open Future Day'}
              </button>

              {/* Close Future Day Button */}
              <button
                className={`action-button ${currentForm === 'close' ? 'active' : ''}`}
                onClick={() => handleToggleForm('close')}
              >
                {currentForm === 'close' ? 'Exit' : 'Close Future Day'}
              </button>

              {/* Review Availability Button */}
              <button
                className={`action-button ${currentForm === 'review' ? 'active' : ''}`}
                onClick={() => handleToggleForm('review')}
              >
                {currentForm === 'review' ? 'Exit' : 'Review Availability'}
              </button>

              {/* Delete Restaurant Button */}
              <button
                className="delete-restaurant-button"
                onClick={handleDeleteClick}
              >
                Delete Restaurant
              </button>
            </>
          )}
        </div>
        {/* Back button to go to Consumer View */}
        <div className="back-button-container">
          <button className="left-panel-back-button" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Right Panel: Contains all Forms */}
      <div className="right-panel">
        {/* Check if the Create Form should be displayed */}
        {currentForm === 'create' && (
          <FormWrapper title="Create Restaurant">

            {/* Restaurant Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name *</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address *</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Open Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="startTime">Open Time</label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input"
              >
                <option value="" disabled>Select Open Time</option>
                {Array.from({ length: 16 }, (_, i) => 8 + i).map((hour) => (
                  <option key={hour} value={hour}>{`${hour}:00`}</option>
                ))}
              </select>
            </div>

            {/* Close Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="endTime">Close Time</label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
              >
                <option value="" disabled>Select Close Time</option>
                {Array.from({ length: 16 }, (_, i) => 8 + i).map((hour) => (
                  <option key={hour} value={hour}>{`${hour}:00`}</option>
                ))}
              </select>
            </div>

            {/* Dates Open */}
            <div className="form-group">
              <label className="form-label" htmlFor="datesOpen">Open Dates</label>
              <input
                id="datesOpen"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                onFocus={(e) => (e.target.dataset.isSelecting = 'true')}
                onBlur={(e) => (e.target.dataset.isSelecting = 'false')}
                onChange={(e) => {
                  const inputElement = e.target as HTMLInputElement;
                  const selectedDate = inputElement.value;
                  const isSelecting = inputElement.dataset.isSelecting === 'true';
                  if (selectedDate && isSelecting && !datesOpen.includes(selectedDate)) {
                    setDatesOpen((prev) => [...prev, selectedDate]);
                  }
                  inputElement.value = '';
                }}
                className="form-input"
                data-is-selecting="false"
              />
            </div>

            {/* List of Selected Dates */}
            <div className="dates-list">
              {datesOpen.map((date, index) => (
                <DateEntry
                  key={index}
                  date={formatDate(date)}
                  index={index}
                  removeDate={(i) =>
                    setDatesOpen((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>

            {/* Tables Section in Create Restaurant */}
            <div className="form-group">
              {/* Add Table Button */}
              <button
                type="button"
                className="add-tables-button"
                onClick={addTable}
              >
                Add Tables
              </button>

              {/* Table List */}
              {tables.map((table) => (
                <TableEntry
                  key={table.tableNumber}
                  table={table}
                  updateSeats={updateSeats}
                  removeTable={removeTable}
                />
              ))}
            </div>

            {/* Error message (if any) */}
            {error && <p className="form-error-message">{error}</p>}

            {/* Button to submit the form */}
            <button onClick={handleCreateRestaurant} className="form-submit-button">
              Create Restaurant
            </button>
          </FormWrapper>
        )}

        {/* Check if the Edit Restaurant Form should be displayed */}
        {currentForm === 'edit' && (
          <FormWrapper title="Edit Restaurant">
            {/* ID Field */}
            <div className="form-group inline-fields">
              <div className="id-field">
                <label className="form-label" htmlFor="restaurantId">ID</label>
                <input
                  id="restaurantId"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="form-input"
                  placeholder="Enter ID"
                />
              </div>

              {/* Name Field */}
              <div className="name-field">
                <label className="form-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter restaurant name"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
                placeholder="Enter restaurant address"
              />
            </div>

            {/* Open Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="startTime">Open Time</label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input"
              >
                <option value="" disabled>Select Open Time</option>
                {Array.from({ length: 16 }, (_, i) => 8 + i).map((hour) => (
                  <option key={hour} value={hour}>{`${hour}:00`}</option>
                ))}
              </select>
            </div>

            {/* Close Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="endTime">Close Time</label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
              >
                <option value="" disabled>Select Close Time</option>
                {Array.from({ length: 16 }, (_, i) => 8 + i).map((hour) => (
                  <option key={hour} value={hour}>{`${hour}:00`}</option>
                ))}
              </select>
            </div>

            {/* Tables Section */}
            <div className="form-group">
              <button
                type="button"
                className="add-tables-button"
                onClick={addTable}
              >
                Add Tables
              </button>

              {/* Table List */}
              {tables.map((table) => (
                <TableEntry
                  key={table.tableNumber}
                  table={table}
                  updateSeats={updateSeats}
                  removeTable={removeTable}
                />
              ))}
            </div>

            {/* Error message */}
            {error && <p className="form-error-message">{error}</p>}

            {/* Save Changes Button */}
            <button
              className="form-submit-button"
              onClick={handleEditRestaurant}
            >
              Save Changes
            </button>
          </FormWrapper>
        )}

        {/* Check if the Open Future Day Form should be displayed */}
        {currentForm === 'open' && (
          <FormWrapper title="Open Future Day">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                type="date"
                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
              />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button onClick={handleOpenFutureDay} className="form-submit-button">
              Open Day
            </button>
          </FormWrapper>
        )}

        {/* Check if the Close Future Day Form should be displayed */}
        {currentForm === 'close' && (
          <FormWrapper title="Open Future Day">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                type="date"
                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
              />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button onClick={handleOpenFutureDay} className="form-submit-button">
              Open Day
            </button>
          </FormWrapper>
        )}

        {/* Check if the Review Availability Form should be displayed */}
        {currentForm === 'review' && (
          <FormWrapper title="Review Availability">
            <p className="form-label">Work in progress</p>
          </FormWrapper>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirmation && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="delete-confirmation-popup" onClick={(e) => e.stopPropagation()}>
              <p>Enter the ID of the restaurant to delete:</p>
              <input
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="popup-input"
                placeholder="Restaurant ID"
              />
              <button onClick={handleDeleteRestaurant} className="delete-confirm-button">
                Delete
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>

            </div>
          </div>
        )}

        {/* Activate Restaurant Popup */}
        {showActivatePopup && (
          <div className="modal-overlay" onClick={cancelActivate}>
            <div className="activate-confirmation-popup" onClick={(e) => e.stopPropagation()}>
              <p>Enter the ID of the restaurant to activate:</p>
              <input
                type="text"
                value={activateRestaurantId}
                onChange={(e) => setActivateRestaurantId(e.target.value)}
                className="popup-input"
                placeholder="Restaurant ID"
              />
              <button onClick={handleActivateRestaurant} className="activate-confirm-button">
                Activate
              </button>
              <button onClick={cancelActivate} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Place Holder Text */}
        {!currentForm && !showDeleteConfirmation && (
          <div className="placeholder-manager">
            <p>Select an option from the left panel to get started.</p>
          </div>
        )}

        {notification.visible && (
          <Notification
            message={notification.message}
            visible={notification.visible}
            type={notification.type}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerView;