'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
const FormWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element => (
  <div className="form-wrapper">
    <h1 className="form-title">{title}</h1>
    <div className="form-content">{children}</div>
  </div>
);

// A reusable component for managing a single table entry in the table list
const TableEntry = ({
  table,
  updateSeats,
  removeTable,
}: {
  table: { id: number; seats: number };
  updateSeats: (id: number, seats: number) => void;
  removeTable: (id: number) => void;
}): JSX.Element => (
  <div className="table-entry">
    <label>Table {table.id}</label>
    <select
      value={table.seats === 1 ? "" : table.seats}
      onChange={(e) => updateSeats(table.id, parseInt(e.target.value) || 1)}
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
const DateEntry = ({
  date,
  index,
  removeDate,
}: {
  date: string;
  index: number;
  removeDate: (index: number) => void;
}): JSX.Element => (
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numTables, setNumTables] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [datesOpen, setDatesOpen] = useState<string[]>([]);
  const [tables, setTables] = useState<{ id: number; seats: number }[]>([]);
  const addTable = () => {
    setTables((prev) => [...prev, { id: prev.length + 1, seats: 1 }]);
  };
  const removeTable = (id: number) => {
    setTables((prev) => prev.filter((table) => table.id !== id));
  };
  const updateSeats = (id: number, seats: number) => {
    setTables((prev) =>
      prev.map((table) => (table.id === id ? { ...table, seats } : table))
    );
  };
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Handlers for toggle
  const handleCreateToggle = () => {
    setShowCreateForm((prevState) => !prevState);
    resetOtherForms('create');
  };

  const handleEditToggle = () => {
    setShowEditForm((prevState) => !prevState);
    resetOtherForms('edit');
  };

  const handleOpenToggle = () => {
    setShowOpenForm((prevState) => !prevState);
    resetOtherForms('open');
  };

  const handleCloseToggle = () => {
    setShowCloseForm((prevState) => !prevState);
    resetOtherForms('close');
  };

  const handleReviewToggle = () => {
    setShowReviewForm((prevState) => !prevState);
    resetOtherForms('review');
  };

  const resetOtherForms = (current: string) => {
    if (current !== 'create') setShowCreateForm(false);
    if (current !== 'edit') setShowEditForm(false);
    if (current !== 'open') setShowOpenForm(false);
    if (current !== 'close') setShowCloseForm(false);
    if (current !== 'review') setShowReviewForm(false);
    // Reset tables and dates when switching forms
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

  const handleGoBack = () => router.push('/consumer');

  // API: Create Restaurant
  const handleCreateRestaurant = async () => {
    if (name && address && numTables) {
      console.log('Creating restaurant with the following details:', { name, address, numTables });
      try {
        const response = await createRestaurantApi.post('/create-restaurant', { name, address, numTables });
        console.log('Create Restaurant API response:', response);
        if (response.data.statusCode === 200) {
          setName(name);
          setAddress('');
          setNumTables('');
          setShowCreateForm(false);
          setHasRestaurant(true);
        } else {
          console.error('Error creating restaurant:', response.data.body);
          setError('Failed to create restaurant.');
        }
      } catch (error) {
        console.error('Error creating restaurant:', error);
        setError('Failed to create restaurant. Please try again.');
      }
    } else {
      setError('All fields are required.');
    }
  };

  // API: Edit Restaurant
  const handleEditRestaurant = async () => {
    if (name && address && openTime && closeTime && tables.length > 0) {
      const tablesData = tables.map((table) => ({ id: table.id, seats: table.seats }));
      try {
        const response = await editRestaurantApi.post('/edit-restaurant', {
          name,
          address,
          openTime,
          closeTime,
          tables: tablesData,
        });
        if (response.data.statusCode === 200) {
          alert(`Successfully updated restaurant ${name}`);
          setName('');
          setAddress('');
          setOpenTime('');
          setCloseTime('');
          setTables([]);
          setShowEditForm(false);
        } else {
          console.error('Error editing restaurant:', response.data.body);
          setError('Failed to edit restaurant.');
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
          alert(`Future day ${date} opened successfully`);
          setDate('');
          setShowOpenForm(false);
        })
        .catch((error) => {
          console.error('Error opening future day:', error);
          setError('Failed to open future day. Please try again.');
        });
    } else {
      setError('Date is required.');
    }
  };

  // API: Close Future Day
  const handleCloseFutureDay = async () => {
    if (date) {
      closeDayApi
        .post('/close-day', { date })
        .then(() => {
          alert(`Future day ${date} closed successfully`);
          setDate('');
          setShowCloseForm(false);
        })
        .catch((error) => {
          console.error('Error closing future day:', error);
          setError('Failed to close future day. Please try again.');
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
        alert('Availability data fetched successfully.');
        setShowReviewForm(false);
      })
      .catch((error) => {
        console.error('Error fetching availability:', error);
        setError('Failed to fetch availability data. Please try again.');
      });
  };

  // API: Delete Restaurant
  const handleDeleteRestaurant = async () => {
    if (!name) {
      setError('Restaurant name is required to delete.');
      console.error('Error: Restaurant name is missing.');
      return;
    }
    console.log('Sending request to delete restaurant:', name);
    try {
      const response = await deleteRestaurantApi.post('/deleteRestaurant', { name });
      console.log('API response:', response);
      const status = response?.data?.statusCode;
      const resultComp = response?.data?.body;
      if (status === 200) {
        setShowDeleteConfirmation(false);
        setHasRestaurant(false);
        setIsActivated(false);
        setName('');
      } else {
        console.error('Failed to delete restaurant:', resultComp);
        setError('Failed to delete restaurant.');
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
      setError('Restaurant name is required to activate.');
      console.error('Error: Restaurant name is missing.');
      return;
    }
    console.log('Sending request to activate restaurant:', name);
    try {
      const response = await activateRestaurantApi.post('/activateRestaurant', { name });
      console.log('API response:', response);
      const status = response?.data?.statusCode;
      const resultComp = response?.data?.body;
      if (status === 200) {
        setIsActivated(true);
      } else {
        console.error('Failed to activate restaurant:', resultComp);
        setError('Failed to activate restaurant.');
      }
    } catch (error) {
      console.error('Activate Error:', error);
      setError('An error occurred while activating the restaurant.');
    }
  };

  return (
    <div className="left-panel-view">
      {/* Sidebar panel */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Manager View</h2>
        </div>
        <div className="left-panel-buttons">
          {/* Show the "Create Restaurant" button only if the user doesn't have a restaurant */}
          {!hasRestaurant && (
            <button className="action-button" onClick={handleCreateToggle}>
              {showCreateForm ? 'Exit' : 'Create Restaurant'}
            </button>
          )}
          <button className="action-button" onClick={handleEditToggle}>
            {showEditForm ? 'Exit' : 'Edit Restaurant'}
          </button>
          <button className="action-button" onClick={handleOpenToggle}>
            {showOpenForm ? 'Exit' : 'Open Future Day'}
          </button>
          <button className="action-button" onClick={handleCloseToggle}>
            {showCloseForm ? 'Exit' : 'Close Future Day'}
          </button>
          <button className="action-button" onClick={handleReviewToggle}>
            {showReviewForm ? 'Exit' : 'Review Availability'}
          </button>
          {/* Show the "Delete Restaurant" button only if the user has a restaurant */}
          {hasRestaurant && (
            <button className="delete-restaurant-button" onClick={handleDeleteClick}>
              Delete Restaurant
            </button>
          )}
          {/* Show the "Activate" button only if the user has a restaurant */}
          {hasRestaurant && (
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isActivated}
                  onChange={async () => {
                    if (!isActivated) {
                      await handleToggleSwitch(); // Handle toggle logic
                    }
                  }}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">
                {isActivated ? 'Activated' : 'Activate'}
              </span>
            </div>
          )}
          <div className="back-button-container">
            <button className="left-panel-back-button" onClick={handleGoBack}>
              Back to Consumer View
            </button>
          </div>
        </div>
      </div>

      <div className="right-panel-view">
        {/* Check if the Create Form should be displayed */}
        {showCreateForm && (
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

            {/* Input for the number of tables */}
            <div className="form-group">
              <label className="form-label" htmlFor="number-of-tables">Number of Tables</label>
              <input
                id="number-of-tables"
                type="number"
                value={numTables}
                onChange={(e) => setNumTables(e.target.value)}
                className="form-input"
                required
                min="0"
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

        {showEditForm && (
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

        {showOpenForm && (
          <FormWrapper title="Open Future Day">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                type="date"
              />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button onClick={handleOpenFutureDay} className="form-submit-button">
              Open Day
            </button>
          </FormWrapper>
        )}

        {showCloseForm && (
          <FormWrapper title="Close Future Day">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                type="date"
              />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button onClick={handleCloseFutureDay} className="form-submit-button">
              Close Day
            </button>
          </FormWrapper>
        )}

        {showReviewForm && (
          <FormWrapper title="Review Availability">
            <p className="form-label">Work in progress</p>
          </FormWrapper>
        )}

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

        {!showCreateForm && !showEditForm && !showOpenForm && !showCloseForm && !showReviewForm && !showDeleteConfirmation && (
          <div className="placeholder-manager">
            <p>Select an option from the left panel to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerView;
