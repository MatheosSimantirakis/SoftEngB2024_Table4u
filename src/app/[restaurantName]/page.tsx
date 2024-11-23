'use client';

import React, { useState } from "react";
import { useParams } from "next/navigation";

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
    <div className="admin-view">
      {/* Left Panel: Contains Logo, Subheading, and Action Buttons */}
      <div className="left-panel-admin">
        <div className="left-panel-header-admin">
          <img src="/logo.svg" alt="Tables4U Logo" className="logo-admin" />
          <h2 className="subtitle-admin">Administrator View</h2>
        </div>
        <div className="left-panel-buttons-admin">
          {/* Navigation buttons for the admin */}
          <button className="action-button-admin" onClick={() => window.history.back()}>
            Go Back
          </button>
          <button className="action-button-admin">Add Reservation</button>
          <button className="action-button-admin">Cancel Reservation</button>
          <button className="action-button-admin">Generate Availability Report</button>
          <button className="action-button-admin delete-button-admin">Delete Restaurant</button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content-admin">
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
