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

const createRestaurantApi = createApiInstance('https://kwd94qobx2.execute-api.us-east-2.amazonaws.com');
const editRestaurantApi = createApiInstance('https://example.com'); // Replace with actual URL
const openDayApi = createApiInstance('https://example.com'); // Replace with actual URL
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
    <label>Table {table.id}</label>
    <select
      value={table.num_seats === 1 ? '' : table.num_seats}
      onChange={(e) => updateSeats(table.id, parseInt(e.target.value) || 1)}
    >
      <option value="" disabled>Seats</option>
      {Array.from({ length: 20 }, (_, i) => i + 1).map((seatCount) => (
        <option key={seatCount} value={seatCount}>{seatCount}</option>
      ))}
    </select>
    <button
      type="button"
      className="remove-table-button"
      onClick={() => removeTable(table.id)}
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
  const [currentForm, setCurrentForm] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numTables, setNumTables] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [datesOpen, setDatesOpen] = useState<string[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const addTable = () => {
    setTables((prev) => [
      ...prev,
      { id: prev.length + 1, num_seats: 1, available: true },
    ]);
  };
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });


  const removeTable = (id: number) => {
    setTables((prev) => prev.filter((table) => table.id !== id));
  };

  const updateSeats = (id: number, num_seats: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, num_seats } : table
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
        await activateRestaurant();
        setIsActivated(true);
      } catch (error) {
        console.error('Error activating the restaurant:', error);
        setError('Failed to activate restaurant.');
      }
    }
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

  const handleGoBack = () => router.push('/consumer');

  // API: Create Restaurant
  const handleCreateRestaurant = async () => {
    if (name && address) {
      console.log('Creating restaurant with the following details:', { name, address });
      try {
        const response = await createRestaurantApi.post('/create-restaurant', { name, address });
        console.log('Create Restaurant API response:', response);
        if (response.data.statusCode === 200) {
          setHasRestaurant(true);
          setCurrentForm(null);
          setName(response.data.name || name);
          setAddress('');
          showNotification(`Successfully created ${name}`);
        } else {
          showNotification('Could not create Restaurant', {}, 'error');
        }
      } catch (error) {
        setError('Failed to create restaurant. Please try again.');
      }
    } else {
      setError('All fields are required.');
    }
  };

  // API: Edit Restaurant
  const handleEditRestaurant = async () => {
    if (name && address && openTime && closeTime && tables.length > 0) {
      const tablesData = tables.map((table) => ({ id: table.id, seats: table.num_seats }));
      try {
        const response = await editRestaurantApi.post('/edit-restaurant', {
          name,
          address,
          openTime,
          closeTime,
          tables: tablesData,
        });
        if (response.data.statusCode === 200) {
          showNotification('Restaurant successfully edited');
          setName('');
          setAddress('');
          setOpenTime('');
          setCloseTime('');
          setTables([]);
          setCurrentForm(null);
        } else {
          console.error('Error editing restaurant:', response.data.body);
          showNotification('Could not edit Restaurant', {}, 'error');
        }
      } catch (error) {
        console.error('Error editing restaurant:', error);
        setError('Failed to edit restaurant. Please try again.');
      }
    } else {
      setError('All fields and at least one table are required.');
    }
  };

  // API: Open Future Day
  const handleOpenFutureDay = async () => {
    if (date) {
      openDayApi
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
    if (!name) {
      setError('Restaurant name is required to delete.');
      console.error('Error: Restaurant name is missing.');
      return;
    }
    console.log('Sending request to delete restaurant:', { name });

    try {
      const response = await deleteRestaurantApi.post('/deleteRestaurant', { name });
      console.log('API response:', response.data);

      if (response.data.statusCode === 200) {
        setShowDeleteConfirmation(false);
        setHasRestaurant(false);
        setIsActivated(false);
        showNotification(`Successfully deleted ${name}`);
        setName('');
      } else {
        console.error('Failed to delete restaurant:', response.data.body);
        showNotification('Failed to delete restaurant', {}, 'error');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      setError('An error occurred while deleting the restaurant.');
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirmation(true);
  const cancelDelete = () => setShowDeleteConfirmation(false);

  // API: Activate Restaurant
  const activateRestaurant = async () => {
    if (!name) {
      setError('Restaurant name is missing.');
      console.error('Error: Restaurant name is missing.');
      return;
    }
    console.log('Sending request to activate restaurant:', { name });

    try {
      const response = await activateRestaurantApi.post('/activateRestaurant', { name });
      console.log('API response:', response.data);

      if (response.data.statusCode === 200) {
        setIsActivated(true);
        showNotification(`${name} successfully activated`);
      } else {
        showNotification(`Failed to activate restaurant`, {}, 'error');
      }
    } catch (error) {
      console.error('Activate Error:', error);
      setError('An error occurred while activating the restaurant.');
    }
  };

  return (
    <div className="page-container">
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
              {/* Edit Restaurant Button */}
              <button
                className={`action-button ${currentForm === 'edit' ? 'active' : ''}`}
                onClick={() => handleToggleForm('edit')}
              >
                {currentForm === 'edit' ? 'Exit' : 'Edit Restaurant'}
              </button>

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

              {/* Activate Restaurant Toggle */}
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isActivated}
                    onChange={async () => {
                      if (!isActivated) {
                        await handleToggleSwitch();
                      }
                    }}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">
                  {isActivated ? 'Activated' : 'Activate'}
                </span>
              </div>
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
            {/* Restaurant name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Open Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="openTime">Open Time</label>
              <select
                id="openTime"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
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
              <label className="form-label" htmlFor="closeTime">Close Time</label>
              <select
                id="closeTime"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
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
                  key={table.id}
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

        {currentForm === 'edit' && (
          <FormWrapper title="Edit Restaurant">
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Open Time */}
            <div className="form-group">
              <label className="form-label" htmlFor="openTime">Open Time</label>
              <select
                id="openTime"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
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
              <label className="form-label" htmlFor="closeTime">Close Time</label>
              <select
                id="closeTime"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
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

            <div className='form-group'>
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
                  key={table.id}
                  table={table}
                  updateSeats={updateSeats}
                  removeTable={removeTable}
                />
              ))}
            </div>

            {/* Save Changes Button */}
            <button
              className="form-submit-button"
              onClick={handleEditRestaurant}
            >
              Save Changes
            </button>
          </FormWrapper>
        )}

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

        {currentForm === 'review' && (
          <FormWrapper title="Review Availability">
            <p className="form-label">Work in progress</p>
          </FormWrapper>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirmation && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="delete-confirmation-popup" onClick={(e) => e.stopPropagation()}>
              <p>Are you sure you want to delete your restaurant?</p>
              <button onClick={handleDeleteRestaurant} className="confirm-button">
                Yes, Delete
              </button>
              <button onClick={cancelDelete} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}

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