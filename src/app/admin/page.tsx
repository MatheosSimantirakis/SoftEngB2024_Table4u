'use client';

import React from "react";

export default function Home() {
  return (
    <div className="admin-view">
      {/* Left Side: Title and Subheading */}
      <div className="left-panel">
        <div className="left-panel-header">
          <h1 className="title">Tables4U</h1>
          <h2 className="subtitle">Administrator View</h2>
        </div>
      </div>

      {/* Main Content: Search Bar & Restaurant List */}
      <div className="main-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a restaurant..."
            className="search-input"
          />
          <button className="search-button">Search</button>
        </div>

        {/* Restaurant List Inside Rectangle */}
        <div className="content-box">
          <h3 className="list-title">Restaurants</h3>
          <ul className="list">
            <li className="list-item">
              <a href="/TechPizza">
                <strong>Name:</strong> Tech Pizza<br />
                <strong>Address:</strong> 123 Main St<br />
                <strong>Open:</strong> 9:00 AM<br />
                <strong>Close:</strong> 10:00 PM
              </a>
            </li>
            <li className="list-item">
              <strong>Name:</strong> Boyton<br />
              <strong>Address:</strong> 456 Beach Blvd<br />
              <strong>Open:</strong> 11:00 AM<br />
              <strong>Close:</strong> 11:00 PM
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
