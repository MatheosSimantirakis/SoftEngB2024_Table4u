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
const managerLoginApi = createApiInstance('https://y4c1d1bns8.execute-api.us-east-2.amazonaws.com/managerLogin/');
const createRestaurantApi = createApiInstance('https://kwd94qobx2.execute-api.us-east-2.amazonaws.com/create-restaurant/');
const editRestaurantInfoApi = createApiInstance('https://doo8y94tle.execute-api.us-east-2.amazonaws.com/editRestaurant/');
const editRestaurantTablesApi = createApiInstance('https://2ss0b3tpbj.execute-api.us-east-2.amazonaws.com/editTables');
const openFutureDaysApi = createApiInstance('https://cxj6su3ix7.execute-api.us-east-2.amazonaws.com/openFutureDay/');
const closeFutureDaysApi = createApiInstance('https://jklr3333ug.execute-api.us-east-2.amazonaws.com/closeFutureDay/');
const reviewAvailabilityApi = createApiInstance('https://3pnqvlisdc.execute-api.us-east-2.amazonaws.com/reviewDaysAvailability/');
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
          {Array.from({ length: 8 }, (_, i) => i + 1).map((seatCount) => (
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
  const [openFutureDayDate, setOpenFutureDayDate] = useState(''); // Initialize date 
  const [closeFutureDayDate, setCloseFutureDayDate] = useState(''); // Initialize date 
  const [reviewAvailabilityDate, setReviewAvailabilityDate] = useState(new Date().toISOString().split('T')[0]); // Initialize date, default to today's date
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [datesOpen, setDatesOpen] = useState<string[]>([]); // List of dates the restaurant is open
  const [tables, setTables] = useState<Table[]>([]); // Array of tables and their details
  const [nextTableNumber, setNextTableNumber] = useState(1); // Next available number for adding a new table
  const [error, setError] = useState(''); // Error messages for the form or actions
  const [showActivatePopup, setShowActivatePopup] = useState(false); // To show/hide the activate popup
  const [activateRestaurantId, setActivateRestaurantId] = useState(''); // To store the entered restaurant ID
  const [showInitialPopup, setShowInitialPopup] = useState(true); // For the initial popup
  const [restaurantId, setRestaurantId] = useState(''); // For the restaurant ID entered in the popup
  const [tablesReady, setTablesReady] = useState(false); // Track when the tables data is ready
  const [availabilityData, setAvailabilityData] = useState<any[]>([]); // Holds the availability data for rendering
  const router = useRouter(); // Router instance for navigation

  // Function to remove a table by its ID
  const removeTable = async (tableNumber: number) => {
    try {
      // Find the table in the current state
      const tableToRemove = tables.find((table) => table.tableNumber === tableNumber);

      if (!tableToRemove) {
        throw new Error(`Table with number ${tableNumber} not found.`);
      }

      // If the table is new and not saved, handle locally
      if (tableToRemove.isNew && !tableToRemove.saved) {
        setTables((prevTables) =>
          prevTables.filter((table) => table.tableNumber !== tableNumber)
        );
        showNotification(`Table ${tableNumber} removed successfully`, {}, "success");
        return;
      }

      // If the table is saved, call the backend to delete it
      if (!restaurantId) {
        throw new Error("Restaurant ID is missing. Please try logging in again.");
      }

      const isSuccess = await editTableHandler("delete", restaurantId, tableNumber);

      if (isSuccess) {
        setTables((prevTables) =>
          prevTables.filter((table) => table.tableNumber !== tableNumber)
        );
        showNotification(`Table ${tableNumber} removed successfully`, {}, "success");
      } else {
        throw new Error("Failed to delete the table.");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error removing table:", error.message);
        showNotification(error.message, {}, "error");
      } else {
        console.error("Unexpected error:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
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
      if (!restaurantId) {
        throw new Error("Restaurant ID is missing. Please try logging in again.");
      }

      // Call the handler to save the table
      const isSuccess = await editTableHandler(
        "save",
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
        showNotification(`Table ${table.tableNumber} saved successfully`, {}, "success");
      } else {
        throw new Error(`Failed to save table ${table.tableNumber}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving table:", error.message);
        showNotification(error.message, {}, "error");
      } else {
        console.error("Unexpected error:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // Function to fetch restaurant and table details
  const reloadRestaurantDetails = async () => {
    if (!restaurantId) {
      console.error("Restaurant ID is missing. Unable to reload restaurant details.");
      return;
    }

    try {
      const payload = { restaurantId };
      const response = await managerLoginApi.post("", payload);

      let parsedBody = response.data;
      if (typeof response.data.body === "string") {
        parsedBody = JSON.parse(response.data.body);
      }

      const { data } = parsedBody;
      if (data && data.restaurant) {
        const { tables } = data;

        // Process and update the tables in the state
        const formattedTables = tables.map((table: Table) => ({
          tableNumber: table.tableNumber,
          seats: table.seats,
          available: true,
          tableId: table.tableNumber,
          isNew: false,
          saved: true,
        }));

        setTables(formattedTables);
        setNextTableNumber(
          formattedTables.length > 0
            ? Math.max(...formattedTables.map((t: Table) => t.tableNumber)) + 1
            : 1
        );

        console.log("Tables reloaded successfully:", formattedTables);
      } else {
        console.error("No restaurant data found during reload.");
      }
    } catch (error) {
      console.error("Error reloading restaurant details:", error);
    }
  };

  // Handler for toggling forms
  const handleToggleForm = (form: string | null) => {
    if (currentForm === form) {
      // Close the form and reset the state
      setCurrentForm(null);
      resetState();
    } else {
      // Open the requested form
      setCurrentForm(form);

      // Call `handleReviewAvailability` when switching to the "review" form
      if (form === "review") {
        handleReviewAvailability();
      }

      // Reload tables when opening the "Edit Restaurant" form
      if (form === "edit") {
        reloadRestaurantDetails();
      }
    }
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

  // Integrates a dynamic availability table in the "Review Availability" form
  const renderAvailabilityTable = () => {
    if (!availabilityData || availabilityData.length === 0) {
      <div className="placeholder-manager">
        <p>No availability data to display</p>
      </div>
    }

    // Extract all time slots (from opening to closing)
    const times = Array.from(
      { length: parseInt(endTime) - parseInt(startTime) },
      (_, i) => `${parseInt(startTime) + i}:00`
    );

    return (
      <table className="availability-table">
        <thead>
          <tr>
            <th>Date: {reviewAvailabilityDate}</th>
            {availabilityData.map(([tableNumber]: [number]) => (
              <th key={tableNumber}>T{tableNumber}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time, rowIndex) => (
            <tr key={rowIndex}>
              <td>{time}</td>
              {availabilityData.map(([tableNumber, tableData]: [number, any[]]) => {
                const slot = tableData[rowIndex]; // Get the current time slot
                const email = typeof slot === "string" ? slot : ""; // Check if the slot is an email
                return (
                  <td key={tableNumber}>
                    {email}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // API: Manager Login
  const handleManagerLogin = async () => {
    // Validate input: Ensure restaurant ID is provided and not empty
    if (!restaurantId.trim()) {
      showNotification("Restaurant ID is required", {}, "error"); // Notify the user
      console.error("Error: Restaurant ID is empty"); // Log the error
      return;
    }

    // Prepare the payload for the API request
    const payload = {
      restaurantId: restaurantId.toString(),
    };

    console.log("Sending payload to manager login API:", payload);

    try {
      // Send POST request to the manager login API
      const response = await managerLoginApi.post("", payload);
      console.log("Raw Response received from API:", response);

      // Parse the response body if it's a string
      const parsedBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data;

      console.log("Parsed Response Data:", parsedBody);

      // Handle responses based on `statusCode`
      if (response.data.statusCode === 200) {
        const { data } = parsedBody;

        if (data && data.restaurant) {
          const { restaurant, openDays, tables } = data;

          // Update state with restaurant details
          setName(restaurant.name);
          setAddress(restaurant.address);
          setStartTime(restaurant.startTime.slice(0, 5)); // Extract time in HH:MM format
          setEndTime(restaurant.endTime.slice(0, 5));
          setIsActivated(restaurant.activated === 1); // Set activation status
          setHasRestaurant(true); // Indicate that a restaurant exists
          setShowInitialPopup(false);

          // Format open days for display
          const formattedOpenDays = openDays.map((day: { openDate: string }) => day.openDate);

          // Format tables for display and state
          const formattedTables = tables.map((table: Table) => ({
            tableNumber: table.tableNumber,
            seats: table.seats,
            available: true,
            tableId: table.tableNumber,
            isNew: false,
          }));

          // Update state with formatted data
          setDatesOpen(formattedOpenDays);
          setTables(formattedTables);
          setNextTableNumber(
            formattedTables.length > 0
              ? Math.max(...formattedTables.map((t: Table) => t.tableNumber)) + 1
              : 1
          );
          setTablesReady(true); // Indicate tables are ready for display

          // Switch to the edit form 
          setCurrentForm("edit");

          console.log("Tables from API:", tables);
          showNotification("Restaurant details retrieved successfully", {}, "success");
        } else {
          console.error("No restaurant data found in API response:", parsedBody);
          showNotification("Failed to retrieve restaurant details", {}, "error");
        }
      } else if (response.data.statusCode === 400) {
        // Handle validation errors
        console.warn("API responded with status 400:", parsedBody.message);
        showNotification(parsedBody.message || "Bad request error", {}, "error");
      } else {
        // Handle unexpected status codes
        console.error("Unhandled response status code:", response.data.statusCode);
        showNotification("An unexpected error occurred", {}, "error");
      }
    } catch (error) {
      // Handle Axios-specific errors 
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || "An unexpected API error occurred.";
        showNotification(errorMessage, {}, "error");
        console.error("Axios error:", errorMessage);
      }
      // Handle general errors
      else if (error instanceof Error) {
        console.error("Error:", error.message);
        showNotification(error.message, {}, "error");
      }
      // Handle unknown errors
      else {
        console.error("Unknown error occurred:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // API: Create Restaurant
  const handleCreateRestaurant = async () => {
    // Validate input: Ensure name and address are provided
    if (!name || !address) {
      setError("Name and Address are required.");
      console.error("Validation error: Name and Address are required.");
      return;
    }

    // Prepare the payload for the API request
    const today = new Date().toISOString().split("T")[0]; // Default to today's date if no open days are provided
    const payload = {
      name,
      address,
      startTime: `${startTime}:00`, // Format start time with seconds
      endTime: `${endTime}:00`, // Format end time with seconds
      openDays: datesOpen.length > 0 ? datesOpen : [today],
      tables: [{ tableNumber: 1, seats: 1 }], // Initialize with one default table
    };

    console.log("Sending payload to create restaurant API:", payload);

    try {
      // Send API request to create the restaurant
      const response = await createRestaurantApi.post("", payload);
      console.log("API Response received:", response);

      // Extract statusCode and body from the API response
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle response based on statusCode
      if (response.data.statusCode === 200) {
        const { restaurantId } = responseBody; // Extract restaurantId from response body
        console.log("Created Restaurant ID:", restaurantId);

        if (restaurantId) {
          // Update state with the new restaurant ID and default table
          setRestaurantId(restaurantId.toString());
          setHasRestaurant(true);
          setTables([
            {
              tableId: 1,
              tableNumber: 1,
              restaurantId: parseInt(restaurantId, 10),
              seats: 1,
              available: true,
              isNew: false,
              saved: true,
            },
          ]);
          setCurrentForm("edit"); // Switch to edit form after creation
          showNotification(
            `Restaurant created successfully! ID: ${restaurantId}`,
            {},
            "success"
          );
        } else {
          console.error("Restaurant ID missing in the response.");
          showNotification("Failed to retrieve Restaurant ID", {}, "error");
        }
      } else if (response.data.statusCode === 400) {
        // Handle validation errors from the API
        console.warn("Validation error from API:", responseBody.message);
        showNotification(responseBody.message || "Validation error occurred", {}, "error");
      } else {
        // Handle unexpected status codes
        console.error("Unexpected statusCode:", response.data.statusCode);
        showNotification("Failed to create restaurant due to an unexpected error", {}, "error");
      }
    } catch (error) {
      // Handle Axios-specific errors
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || "An unexpected API error occurred.";
        showNotification(errorMessage, {}, "error");
        console.error("Axios error:", errorMessage);
      }
      // Handle general errors
      else if (error instanceof Error) {
        console.error("Error creating restaurant:", error.message);
        showNotification(error.message, {}, "error");
      }
      // Handle unknown errors
      else {
        console.error("Unexpected error occurred:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // API: Edit Restaurant
  const handleEditRestaurantInfo = async () => {
    // Validate input: Ensure restaurant ID is provided
    if (!restaurantId) {
      setError("Restaurant ID is missing. Please log in again"); // Set error state
      showNotification("Restaurant ID is required", {}, "error"); // Notify the user
      console.error("Validation error: Restaurant ID is missing."); // Log the error
      return; // Exit early if validation fails
    }

    // Prepare the payload for the API request
    const payload = {
      restaurantId,
      name: name || "", // Default to an empty string if name is not provided
      address: address || "", // Default to an empty string if address is not provided
      startTime: startTime ? `${startTime}:00` : "", // Format startTime with seconds
      endTime: endTime ? `${endTime}:00` : "", // Format endTime with seconds
    };

    console.log("Sending API request to edit restaurant with payload:", payload);

    try {
      // Make the API call
      const response = await editRestaurantInfoApi.post("", payload);
      console.log("API Response received:", response);

      // Extract the response body
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle successful response
      if (response.data.statusCode === 200) {
        showNotification("Successfully updated restaurant", {}, "success"); // Notify user of success
        setCurrentForm(null); // Reset the current form
        resetState(); // Reset any state related to restaurant info
      }
      // Handle validation errors
      else if (response.data.statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        showNotification(responseBody.message || "Validation error occurred", {}, "error");
      }
      // Handle unexpected status codes
      else {
        console.error("Unexpected statusCode:", response.data.statusCode);
        showNotification("Failed to update restaurant due to an unexpected error", {}, "error");
      }
    } catch (error) {
      // Handle Axios-specific errors
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || "An unexpected API error occurred.";
        showNotification(errorMessage, {}, "error");
        console.error("Axios error:", errorMessage);
      }
      // Handle general JavaScript errors
      else if (error instanceof Error) {
        console.error("Error editing restaurant:", error.message);
        showNotification(error.message, {}, "error");
      }
      // Handle unknown errors
      else {
        console.error("Unknown error occurred:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // API: Edit Tables
  const editTableHandler = async (
    type: string, // "add" or "delete"
    restaurantId: string, // ID of the restaurant
    tableNumber: number, // Table number being edited
    seats: number = 1 // Number of seats for the table
  ): Promise<boolean> => {
    // Ensure restaurant ID is provided before proceeding
    if (!restaurantId) {
      console.error("Restaurant ID is missing. Aborting API call.");
      return false;
    }

    // Prepare the payload for the API request
    const payload = {
      type,
      restaurantId,
      tableNumber,
      seats,
    };

    console.log("Sending payload to edit table API:", payload);

    try {
      // Make the API call to edit the table
      const response = await editRestaurantTablesApi.post("", payload);
      console.log("API Response received:", response);

      // Parse the response body if it's a string
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle successful response
      if (response.data.statusCode === 200) {
        console.log(
          `Successfully ${type === "delete" ? "deleted" : "saved"} table.`
        );
        return true;
      }
      // Handle validation errors
      else if (response.data.statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        return false;
      }
      // Handle unexpected status codes
      else {
        console.error("Unexpected statusCode:", response.data.statusCode);
        return false;
      }
    } catch (error) {
      // Handle Axios-specific errors
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected API error occurred.";
        console.error("Axios error:", errorMessage);
      }
      // Handle general errors
      else if (error instanceof Error) {
        console.error("Error editing table:", error.message);
      }
      // Handle unknown errors
      else {
        console.error("Unknown error occurred:", error);
      }
      return false;
    }
  };

  // API: Open Future Days
  const handleOpenFutureDays = async () => {
    // Check if both date and restaurantId are provided
    if (!openFutureDayDate || !restaurantId) {
      console.warn("Date or Restaurant ID missing");
      showNotification("Date and Restaurant ID are required", {}, "error");
      return;
    }

    console.log(`Date: ${openFutureDayDate}, Restaurant ID: ${restaurantId}`);
    const payload = { restaurantId, openDays: [openFutureDayDate] }; // Prepare payload for API
    console.log("Payload to API:", payload);

    try {
      // Send API request to open future days
      const response = await openFutureDaysApi.post("", payload);
      console.log("API Response received:", response);

      // Parse the response body if it's a string
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle successful response
      if (response.data.statusCode === 200) {
        console.log("API call successful, response data:", responseBody);
        showNotification(`Successfully opened date ${openFutureDayDate} for restaurant ID: ${restaurantId}`, {}, "success");
        setDate("");
        setCurrentForm(null);
      }
      // Handle validation errors
      else if (response.data.statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        showNotification(responseBody.message || "Failed to open the future day", {}, "error");
      }
      // Handle unexpected status codes
      else {
        console.error("Unexpected statusCode:", response.data.statusCode);
        showNotification("An unexpected error occurred while opening the day", {}, "error");
      }
    } catch (error) {
      // Catch any Axios errors
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || "An unexpected API error occurred.";
        console.error("Axios error:", errorMessage);
        showNotification(errorMessage, {}, "error");
      }
      // Catch general errors
      else if (error instanceof Error) {
        console.error("Error during API call:", error.message);
        showNotification(error.message, {}, "error");
      }
      // Catch any unknown errors
      else {
        console.error("Unknown error occurred:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // API: Close Future Days
  const handleCloseFutureDays = async () => {
    // Check if both date and restaurantId are provided
    if (!closeFutureDayDate || !restaurantId) {
      console.warn("Date or Restaurant ID missing");
      showNotification("Date and Restaurant ID are required", {}, "error");
      return;
    }

    console.log(`Date: ${closeFutureDayDate}, Restaurant ID: ${restaurantId}`);
    const payload = { restaurantId, openDays: [closeFutureDayDate] }; // Prepare payload for API
    console.log("Payload to API:", payload);

    try {
      // Send API request to close future days
      const response = await closeFutureDaysApi.post("", payload);
      console.log("API Response received:", response);

      // Parse the response body if it's a string
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle successful response
      if (response.data.statusCode === 200) {
        console.log("API call successful, response data:", responseBody);
        showNotification(`Successfully closed date ${closeFutureDayDate} for restaurant ID: ${restaurantId}`, {}, "success");
        setDate("");
        setCurrentForm(null);
      }
      // Handle validation errors
      else if (response.data.statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        showNotification(responseBody.message || "Failed to close the future day", {}, "error");
      }
      // Handle unexpected status codes
      else {
        console.error("Unexpected statusCode:", response.data.statusCode);
        showNotification("An unexpected error occurred while closing the day", {}, "error");
      }
    } catch (error) {
      // Catch any Axios errors
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || error.message || "An unexpected API error occurred.";
        console.error("Axios error:", errorMessage);
        showNotification(errorMessage, {}, "error");
      }
      // Catch general errors
      else if (error instanceof Error) {
        console.error("Error during API call:", error.message);
        showNotification(error.message, {}, "error");
      }
      // Catch any unknown errors
      else {
        console.error("Unknown error occurred:", error);
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // API: Review Availability
  const handleReviewAvailability = async () => {
    try {
      if (!restaurantId) {
        throw new Error("Restaurant ID is required to review availability.");
      }

      const payload = { restaurantId, reviewAvailabilityDate };
      console.log("Sending payload to review availability API:", payload);

      const response = await reviewAvailabilityApi.post("", payload);
      console.log("API Response received:", response);

      const responseBody =
        typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      if (response.data.statusCode === 200 && responseBody.message) {
        setAvailabilityData(responseBody.message); // Store availability data for rendering the table
        setCurrentForm("review"); // Switch to the review form
        console.log("Availability data:", responseBody.message);
      } else {
        throw new Error("Failed to retrieve availability data.");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching availability:", error.message);
        showNotification(error.message, {}, "error");
      } else {
        console.error("Unexpected error:", error);
        showNotification("An unexpected error occurred.", {}, "error");
      }
    }
  };

  // API: Delete Restaurant
  const handleDeleteRestaurant = async () => {
    // Ensure a restaurant ID is provided before proceeding
    if (!restaurantId) {
      setError("Restaurant ID is required to delete.");
      showNotification("Restaurant ID is required", {}, "error");
      console.error("Error: Restaurant ID is missing.");
      return;
    }

    console.log("Sending request to delete restaurant:", { restaurantId });

    try {
      // Send API request to delete the restaurant
      const response = await deleteRestaurantApi.post("", { restaurantId });
      console.log("API Response received:", response);

      // Parse the response body if it's a string
      const responseBody = typeof response.data.body === "string" ? JSON.parse(response.data.body) : response.data.body;

      // Handle successful response
      if (response.data.statusCode === 200) {
        console.log("API call successful, response data:", responseBody);

        // Update the state to reflect the successful deletion
        setShowDeleteConfirmation(false);
        setHasRestaurant(false);
        setIsActivated(false);
        setCurrentForm(null);

        // Clear the restaurant ID and notify the user of success
        showNotification("Successfully deleted restaurant", {}, "success");
        setRestaurantId("");
      }
      // Handle validation errors
      else if (response.data.statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        showNotification(
          responseBody.message || "Failed to delete the restaurant",
          {},
          "error"
        );
      }
      // Handle unexpected status codes
      else {
        console.error("Unexpected statusCode:", response.data.statusCode);
        showNotification("An unexpected error occurred while deleting the restaurant", {}, "error");
      }
    } catch (error) {
      // Handle Axios-specific errors 
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected API error occurred.";
        console.error("Axios error:", errorMessage);
        setError(errorMessage);
        showNotification(errorMessage, {}, "error");
      }
      // Handle general errors
      else if (error instanceof Error) {
        console.error("Error during delete operation:", error.message);
        setError(error.message);
        showNotification(error.message, {}, "error");
      }
      // Handle unknown errors
      else {
        console.error("Unknown error occurred:", error);
        setError("An unexpected error occurred.");
        showNotification("An unexpected error occurred", {}, "error");
      }
    }
  };

  // Function to trigger the delete confirmation popup
  const handleDeleteClick = () => setShowDeleteConfirmation(true);

  // Function to cancel the delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false); // Close the confirmation popup
    setRestaurantId(""); // Clear the restaurant ID to reset the form
  };

  // API: Activate Restaurant
  const handleActivateRestaurant = async () => {
    // Validate input
    if (!activateRestaurantId) {
      setError("Restaurant ID is required to activate.");
      showNotification("Restaurant ID is required", {}, "error");
      console.error("Error: Restaurant ID is missing.");
      return;
    }

    try {
      // Prepare the payload for the API request
      const payload = { restaurantId: activateRestaurantId };
      console.log("Sending request to activate restaurant:", payload);

      // Make the API call
      const response = await activateRestaurantApi.post("", payload);
      console.log("API Response received:", response);

      // Extract statusCode and body from the response
      const { statusCode, body } = response.data;
      const responseBody = typeof body === "string" ? JSON.parse(body) : body;

      // Handle successful response
      if (statusCode === 200) {
        console.log("API call successful, response data:", responseBody);

        // Update state and notify user of success
        showNotification(`Successfully activated restaurant with ID: ${activateRestaurantId}`, {}, "success");
        setShowActivatePopup(false); // Close the activation popup
        setActivateRestaurantId(""); // Clear the restaurant ID field
        setIsActivated(true); // Mark restaurant as activated
        setCurrentForm(null); // Reset the form

        // Handle validation errors
      } else if (statusCode === 400) {
        console.warn("Validation error from API:", responseBody.message);
        showNotification(responseBody.message || "Failed to activate restaurant", {}, "error");

        // Handle unexpected status codes
      } else {
        console.error("Unexpected statusCode:", statusCode);
        showNotification("An unexpected error occurred while activating the restaurant.", {}, "error");
      }
    } catch (error) {
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected API error occurred.";
        console.error("Axios error:", errorMessage);
        setError(errorMessage);
        showNotification(errorMessage, {}, "error");

        // Handle general errors
      } else if (error instanceof Error) {
        console.error("Error activating restaurant:", error.message);
        setError(error.message);
        showNotification(error.message, {}, "error");

        // Handle unknown errors
      } else {
        console.error("Unknown error occurred:", error);
        setError("An unexpected error occurred.");
        showNotification("An unexpected error occurred", {}, "error");
      }
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
              {isActivated && (
                <button
                  className={`action-button ${currentForm === 'review' ? 'active' : ''}`}
                  onClick={() => handleToggleForm('review')}
                >
                  {currentForm === 'review' ? 'Exit' : 'Review Availability'}
                </button>
              )}

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
                id="open-future-day-date"
                value={openFutureDayDate}
                onChange={(e) => setOpenFutureDayDate(e.target.value)}
                className="form-input"
                type="date"
                min={new Date(new Date().setDate(new Date().getDate() + 1))
                  .toISOString()
                  .split('T')[0]}
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
          <FormWrapper title="Close Future Days">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="close-future-day-date"
                value={closeFutureDayDate}
                onChange={(e) => setCloseFutureDayDate(e.target.value)}
                className="form-input"
                type="date"
                min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
              />
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button onClick={handleCloseFutureDays} className="form-submit-button">
              Close Day
            </button>
          </FormWrapper>
        )}

        {/* Check if the Review Availability Form should be displayed */}
        {currentForm === "review" && (
          <FormWrapper title="Review Availability">
            <div className="availability-table-container">
              {renderAvailabilityTable()}
            </div>
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
            <p>Select an option from the left panel to get started</p>
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