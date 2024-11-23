'use client';

import React, { useState } from "react";
import { useParams } from "next/navigation";

export default function RestaurantPage() {
  const { restaurantName } = useParams();
  const [date, setDate] = useState(new Date());
  const [canGoBack, setCanGoBack] = useState(false);

  const handleDateChange = (days: number) => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      setCanGoBack(newDate >= today);

      return newDate;
    });
  };

  return (
    <div className="admin-view">
      {/* Left Side: Buttons, Logo and Subheading */}
      <div className="left-panel-admin">
        <div className="left-panel-header-admin">
          <img src="/logo.svg" alt="Tables4U Logo" className="logo-admin" />
          <h2 className="subtitle-admin">Administrator View</h2>
        </div>
        <div className="left-panel-buttons-admin">
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
        {/* Restaurant Name */}
        <h1 className="restaurant-name-admin">{restaurantName || "Loading..."}</h1>

        {/* Reservation Info Inside Rectangle */}
        <div className="content-box-admin">
          <p>
            Reservation data for {restaurantName || "this restaurant"} on{" "}
            {date.toDateString()}:
          </p>
          <ul>
            <li>10:00 AM - John Doe</li>
            <li>11:30 AM - Jane Smith</li>
            <li>01:00 PM - Bob Johnson</li>
            {/* Replace with dynamic reservation data */}
          </ul>
        </div>

        {/* Navigation Arrows */}
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
  );
}
