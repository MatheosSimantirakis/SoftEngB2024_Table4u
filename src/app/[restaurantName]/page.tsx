'use client';

import React, { useState } from "react";
import { useParams } from "next/navigation";

export default function RestaurantPage() {
  const { restaurantName } = useParams();
  const [date, setDate] = useState(new Date());

  const handleDateChange = (days: number) => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);
      return newDate;
    });
  };

  return (
    <div className="admin-view">
      {/* Left Side: Buttons */}
      <div className="left-panel">
        <div className="left-panel-header">
          <h1 className="title">Tables4U</h1>
          <h2 className="subtitle">Administrator View</h2>
        </div>
        <div className="left-panel-buttons">
          <button className="action-button" onClick={() => window.history.back()}>
            Go Back
          </button>
          <button className="action-button">Add Reservation</button>
          <button className="action-button">Cancel Reservation</button>
          <button className="action-button">Generate Availability Report</button>
          <button className="action-button delete-button">Delete Restaurant</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Restaurant Name */}
        <h1 className="restaurant-name">{restaurantName || "Loading..."}</h1>

        {/* Reservation Info Inside Rectangle */}
        <div className="content-box">
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
        <div className="date-navigation">
          <button className="nav-button" onClick={() => handleDateChange(-1)}>
            &lt; Previous Day
          </button>
          <button className="nav-button" onClick={() => handleDateChange(1)}>
            Next Day &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
