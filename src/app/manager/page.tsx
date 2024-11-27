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
import { Restaurant } from '@/model';

// Dynamic baseURL for all APIs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

// baseURLs for APIs
const managerLoginApi = createApiInstance('https://y4c1d1bns8.execute-api.us-east-2.amazonaws.com/managerLogin/');
const createRestaurantApi = createApiInstance('https://kwd94qobx2.execute-api.us-east-2.amazonaws.com/create-restaurant/');
const editRestaurantInfoApi = createApiInstance('https://doo8y94tle.execute-api.us-east-2.amazonaws.com/editRestaurant/');
const editRestaurantTablesApi = createApiInstance('https://2ss0b3tpbj.execute-api.us-east-2.amazonaws.com/editTables');
const openFutureDaysApi = createApiInstance('https://cxj6su3ix7.execute-api.us-east-2.amazonaws.com/openFutureDay/');
const closeFutureDaysApi = createApiInstance('https://example.com'); // Replace with actual URL
const reviewAvailabilityApi = createApiInstance('https://example.com'); // Replace with actual URL
const deleteRestaurantApi = createApiInstance('https://ub4vssj8g4.execute-api.us-east-2.amazonaws.com/deleteRestaurant');
const activateRestaurantApi = createApiInstance('https://ys2gzedx59.execute-api.us-east-2.amazonaws.com/activateRestaurant/');

// Reusable component for wrapping forms with a consistent layout
const FormWrapper: React.FC<FormWrapperProps> = ({ title, children }) => (
  <div className="form-wrapper">
    <h1 className="form-title">{title}</h1>
    <div className="form-content">{children}</div>
  </div>
);

// Reusable component for managing a single table entry in the table list
const TableEntry: React.FC<TableEntryProps> = ({
  table,
  updateSeats,
  removeTable,
  saveTable,
}) => (
  <div className="table-entry">
    <div className="table-info">
      <label className="table-id">Table {table.tableNumber}</label>
      {/* Conditionally render based on table.isNew and table.saved */}
      {table.isNew && !table.saved ? (
        // Dropdown for new tables
        <select
          className="table-seats-dropdown"
          value={table.seats || 1}
          onChange={(e) => updateSeats(table, parseInt(e.target.value) || 1)}
        >
          <option value="" disabled>
            Seats
          </option>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((seatCount) => (
            <option key={seatCount} value={seatCount}>
              {seatCount}
            </option>
          ))}
        </select>
      ) : (
        // Static display for tables that are saved or auto-populated
        <span className="table-seats-static">{table.seats} Seat(s)</span>
      )}
    </div>
    {/* Render the Save button only for new tables that are not saved */}
    {table.isNew && !table.saved && (
      <button
        type="button"
        className="save-table-button"
        onClick={() => saveTable(table)}
      >
        Save
      </button>
    )}
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
  const [showActivatePopup, setShowActivatePopup] = useState(false); // To show/hide the activate popup
  const [activateRestaurantId, setActivateRestaurantId] = useState(''); // To store the entered restaurant ID
  const [showInitialPopup, setShowInitialPopup] = useState(true); // For the initial popup
  const [restaurantId, setRestaurantId] = useState(''); // For the restaurant ID entered in the popup
  const router = useRouter(); // Router instance for navigation
  const [tablesReady, setTablesReady] = useState(false); // Track when the tables data is ready

  // Function to remove a table by its ID
  const removeTable = async (tableNumber: number) => {
    try {
      // Call the handler to remove the table, automatically sending seats: 1
      await editTableHandler("delete", restaurantId, tableNumber);

      // Update local state to remove the table
      setTables((prevTables) => prevTables.filter((table) => table.tableNumber !== tableNumber));

      showNotification(`Table ${tableNumber} removed successfully`, {}, "success");
    } catch (error) {
      console.error("Error removing table:", error);
      showNotification("Failed to remove the table.", {}, "error");
    }
  };

  // Function to add a new table
  const addTable = () => {
    // Find the next available number that doesn’t conflict with existing numbers
    const existingNumbers = tables.map((table) => table.tableNumber);
    let nextAvailableNumber = nextTableNumber;
    while (existingNumbers.includes(nextAvailableNumber)) {
      nextAvailableNumber += 1;
    }
    // Add the new table
    setTables((prev) => [
      ...prev,
      {
        tableId: nextAvailableNumber,
        restaurantId: parseInt(restaurantId),
        tableNumber: nextAvailableNumber,
        seats: 1,
        available: true,
        isNew: true,
        saved: false,
      },
    ]);
    // Update nextTableNumber
    setNextTableNumber(nextAvailableNumber + 1);
  };

  // Function to update the number of seats for a specific table
  const updateSeats = (table: Table, seats: number): void => {
    setTables((prev: Table[]) =>
      prev.map((t: Table) =>
        t.tableNumber === table.tableNumber ? { ...t, seats } : t
      )
    );
  };

  // Function to save tables
  const saveTable = async (table: Table) => {
    try {
      const isSuccess = await editTableHandler(
        'save',
        restaurantId,
        table.tableNumber,
        table.seats || 1
      );

      if (isSuccess) {
        setTables((prevTables) =>
          prevTables.map((t) =>
            t.tableNumber === table.tableNumber ? { ...t, saved: true } : t
          )
        );
        // Show success notification
        showNotification(`Table ${table.tableNumber} saved successfully`, {}, "success");
      } else {
        // Show failure notification
        showNotification(`Failed to save table ${table.tableNumber}`, {}, "error");
      }
    } catch (error) {
      console.error('Error saving table:', error);
      showNotification('An unexpected error occurred while saving the table.', {}, 'error');
    }
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
        const payload = { id: activateRestaurantId };
        const response = await activateRestaurantApi.post('', payload);

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

  // Function for on-screen notifications
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });

  // Notification component
  const Notification = ({ message, visible, type }: { message: string; visible: boolean; type: string }) => {
    if (!visible) return null;
    return <div className={`notification ${type}`}>{message}</div>;
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

  // API: Manager Login
  const handleManagerLogin = async () => {
    if (!restaurantId.trim()) {
      showNotification("Restaurant ID is required.", {}, "error");
      console.error("Error: Restaurant ID is empty.");
      return;
    }

    // Prepare payload with restaurantId
    const payload = {
      restaurantId: restaurantId.toString(),
    };

    console.log("Sending payload to manager login API:", payload);

    try {
      // Send POST request to manager login API
      const response = await managerLoginApi.post("", payload);
      console.log("Raw Response received from API:", response);

      // Parse the body if it's a string
      let parsedBody = response.data;
      if (typeof response.data.body === "string") {
        parsedBody = JSON.parse(response.data.body);
      }

      console.log("Parsed Response Data:", parsedBody);

      // Extract data from the parsed response
      const { data } = parsedBody;

      if (data && data.restaurant) {
        const { restaurant, openDays, tables } = data;

        // Update state with restaurant details
        setName(restaurant.name);
        setAddress(restaurant.address);
        setStartTime(restaurant.startTime.slice(0, 5));
        setEndTime(restaurant.endTime.slice(0, 5));
        setIsActivated(restaurant.activated === 1);
        setHasRestaurant(true);
        setShowInitialPopup(false);

        // Process openDays and tables
        const formattedOpenDays = openDays.map((day: { openDate: string }) => day.openDate);
        const formattedTables = tables.map((table: Table) => ({
          tableNumber: table.tableNumber,
          seats: table.seats,
          available: true,
          tableId: table.tableNumber,
          isNew: false,
        }));

        setDatesOpen(formattedOpenDays);
        setTables(formattedTables);
        setNextTableNumber(
          formattedTables.length > 0
            ? Math.max(...formattedTables.map((t: Table) => t.tableNumber)) + 1
            : 1
        );
        setTablesReady(true);

        // Switch to edit form after all updates
        setCurrentForm('edit');

        console.log('Tables from API:', tables);
        showNotification("Restaurant details retrieved successfully", {}, "success");
      } else {
        console.error("No restaurant data found in API response:", parsedBody);
        showNotification("Failed to retrieve restaurant details", {}, "error");
      }
    } catch (error) {
      // Handle errors during API request
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        showNotification(`API Error: ${errorMessage}`, {}, "error");
        console.error("Axios error:", errorMessage);
      } else {
        showNotification("An unexpected error occurred while logging in.", {}, "error");
        console.error("Unexpected error:", error);
      }
    }
  };

  // API: Create Restaurant
  const handleCreateRestaurant = async () => {
    if (!name || !address) {
      setError('Name and Address are required.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      name,
      address,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      openDays: datesOpen.length > 0 ? datesOpen : [today],
      tables: tables.length > 0
        ? tables.map((table) => ({
          tableNumber: table.tableNumber,
          seats: table.seats,
        }))
        : [{ tableNumber: 1, seats: 1 }],
    };

    console.log('Sending payload to create restaurant API:', payload);

    try {
      const response = await createRestaurantApi.post('', payload);

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
  const handleEditRestaurantInfo = async () => {
    if (!restaurantId) {
      setError('Restaurant ID is missing. Please log in again.');
      showNotification('Restaurant ID is required.', {}, 'error');
      return;
    }
  
    const payload = {
      restaurantId, 
      name: name || '', 
      address: address || '',
      startTime: startTime ? `${startTime}:00` : '', 
      endTime: endTime ? `${endTime}:00` : '', 
    };
  
    console.log('Sending API request to edit restaurant with payload:', payload);
  
    try {
      const response = await editRestaurantInfoApi.post('', payload);
  
      if (response.data.statusCode === 200) {
        showNotification(`Successfully updated restaurant`, {}, 'success');
        setCurrentForm(null); 
        resetState(); 
      } else {
        console.error('API error:', response.data.body || response.data);
        showNotification('Failed to update restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Error editing restaurant:', error);
      showNotification('An error occurred while editing the restaurant.', {}, 'error');
    }
  };  

  // API: Edit Tables
  const editTableHandler = async (
    type: string,
    restaurantId: string,
    tableNumber: number,
    seats: number = 1
  ): Promise<boolean> => {
    try {
      const payload = {
        type,
        restaurantId,
        tableNumber,
        seats,
      };

      console.log("Sending payload to edit table API:", payload);

      const response = await editRestaurantTablesApi.post('', payload);

      if (response.status === 200) {
        console.log(
          `Successfully ${type === "delete" ? "deleted" : "edited"} table.`
        );
        return true;
      } else {
        console.error("API responded with an error:", response.data);
        return false;
      }
    } catch (error) {
      console.error("Error editing table:", error);
      return false;
    }
  };

  // API: Open Future Days
  const handleOpenFutureDays = async () => {
    if (date) {
      openFutureDaysApi
        .post('/open-day', { date })
        .then(() => {
          showNotification(`Successfully set dates to open`);
          setDate('');
          setCurrentForm(null);
        })
        .catch((error) => {
          console.error('Error opening future days:', error);
          showNotification('Failed to set future days to open', {}, 'error');
        });
    } else {
      showNotification('Date is required.', {}, 'error');
    }
  };

  // API: Close Future Days
  const handleCloseFutureDays = async () => {
    if (date) {
      closeFutureDaysApi
        .post('/close-day', { date })
        .then(() => {
          showNotification(`Successfully set dates to close`);
          setDate('');
          setCurrentForm(null);
        })
        .catch((error) => {
          console.error('Error closing future days:', error);
          showNotification('Failed to set future days to close', {}, 'error');
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
      const response = await deleteRestaurantApi.post('', { restaurantId });
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

      const response = await activateRestaurantApi.post('', payload);

      if (response.status === 200) {
        console.log("test");
        showNotification(`Successfully activated restaurant with ID: ${activateRestaurantId}`);
        setShowActivatePopup(false);
        setActivateRestaurantId('');
        setIsActivated(true);
        setCurrentForm(null);
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
              <button className="id-submit-button"
                onClick={handleManagerLogin} >
                Find Existing Restaurant
              </button>
              <button className="cancel-button"
                onClick={handleNoRestaurant}>
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

          {/* Show buttons dynamically based on restaurant status */}
          {hasRestaurant && (
            <>
              {/* Show the "Activate Restaurant" button only if the restaurant is not yet activated */}
              {!isActivated && (
                <button
                  className="action-button"
                  onClick={handleActivateClick}
                >
                  Activate Restaurant
                </button>
              )}

              {/* Show the "Edit Restaurant" button only if the restaurant is not yet activated */}
              {!isActivated && (
                <button
                  className={`action-button ${currentForm === 'edit' ? 'active' : ''}`}
                  onClick={() => handleToggleForm('edit')}
                >
                  {currentForm === 'edit' ? 'Exit' : 'Edit Restaurant'}
                </button>
              )}

              {/* Button to open future days */}
              <button
                className={`action-button ${currentForm === 'open' ? 'active' : ''}`}
                onClick={() => handleToggleForm('open')}
              >
                {currentForm === 'open' ? 'Exit' : 'Open Future Days'}
              </button>

              {/* Button to close future days */}
              <button
                className={`action-button ${currentForm === 'close' ? 'active' : ''}`}
                onClick={() => handleToggleForm('close')}
              >
                {currentForm === 'close' ? 'Exit' : 'Close Future Days'}
              </button>

              {/* Button to review availability */}
              <button
                className={`action-button ${currentForm === 'review' ? 'active' : ''}`}
                onClick={() => handleToggleForm('review')}
              >
                {currentForm === 'review' ? 'Exit' : 'Review Availability'}
              </button>

              {/* Button to delete restaurant */}
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

            {/* Error message (if any) */}
            {error && <p className="form-error-message">{error}</p>}

            {/* Button to submit the form */}
            <button onClick={handleCreateRestaurant} className="form-submit-button">
              Create Restaurant
            </button>
          </FormWrapper>
        )}

        {currentForm === 'edit' && (
          <div>
            {/* Section 1: Edit Restaurant Info */}
            <FormWrapper title="Edit Restaurant Info">
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter restaurant name"
                />
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

              {/* Save Changes Button */}
              <button
                type="button"
                className="form-submit-button"
                onClick={handleEditRestaurantInfo}
              >
                Save Changes
              </button>
            </FormWrapper>

            {/* Section 2: Edit Restaurant Tables */}
            <FormWrapper title="Edit Restaurant Tables">
              <div className="form-group">
                {/* Display the list of tables */}
                {tables.map((table) => (
                  <TableEntry
                    key={table.tableId || table.tableNumber}
                    table={table}
                    updateSeats={updateSeats}
                    removeTable={removeTable}
                    saveTable={saveTable}
                  />
                ))}
              </div>

              {/* Add Table Button */}
              <button
                type="button"
                className="add-tables-button"
                onClick={addTable}
              >
                Add Table
              </button>
            </FormWrapper>
          </div>
        )}

        {/* Check if the Open Future Days Form should be displayed */}
        {currentForm === 'open' && (
          <FormWrapper title="Open Future Days">
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
            <button onClick={handleOpenFutureDays} className="form-submit-button">
              Open Day
            </button>
          </FormWrapper>
        )}

        {/* Check if the Close Future Days Form should be displayed */}
        {currentForm === 'close' && (
          <FormWrapper title="Open Future Days">
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
            <button onClick={handleOpenFutureDays} className="form-submit-button">
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