'use client';

import React, { useState } from "react";
import { useParams } from "next/navigation";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-gateway-id.execute-api.region.amazonaws.com/prod/', // TODO: Change to ours
});

export default function RestaurantPage() {
  const { restaurantName } = useParams(); // Extracts the restaurant name from the route
  const [date, setDate] = useState(new Date()); // Tracks the currently selected date
  const [canGoBack, setCanGoBack] = useState(false); // Controls the visibility of the "Previous Day" button

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

  return (
    <div className="left-panel-view">
      {/* Left Panel: Contains Logo, Subheading, and Action Buttons */}
      <div className="left-panel">   <div className="left-panel-header">
        <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
        <h2 className="left-panel-subtitle">Administrator View</h2>
      </div>
        <div className="left-panel-buttons">
          {/* Navigation buttons for the admin */}
          <button className="action-button">Add Reservation</button>
          <button className="action-button">Cancel Reservation</button>
          <button className="action-button">Generate Availability Report</button>
          <button className="delete-restaurant-button">Delete Restaurant</button>
        </div>
        <div className="back-button-container">
          <button className="left-panel-back-button" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="right-panel-view">
        {/* Displays the restaurant name */}
        <h1 className="restaurant-name-admin">{restaurantName || "Loading..."}</h1>

        {/* Reservation Data Section */}
        <div className="content-box-admin">
          <p>
            Reservation data for {restaurantName || "this restaurant"} on{" "}
            {date.toDateString()}:
          </p>
          <ul>
            {/* Example reservation data */}
            <li>10:00 AM - John Doe</li>
            <li>11:30 AM - Jane Smith</li>
            <li>01:00 PM - Bob Johnson</li>
            {/* Replace with dynamic reservation data */}
          </ul>
        </div>

        {/* Date Navigation Section */}
        <div className="date-navigation-admin">
          {/* Show the "Previous Day" button only if navigation to past dates is allowed */}
          {canGoBack && (
            <button className="nav-button-admin" onClick={() => handleDateChange(-1)}>
              &lt; Previous Day
            </button>
          )}
          {/* Always show the "Next Day" button */}
          <button className="nav-button-admin" onClick={() => handleDateChange(1)}>
            Next Day &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
