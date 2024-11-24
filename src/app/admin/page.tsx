'use client';

import React from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-gateway-id.execute-api.region.amazonaws.com/prod/', // TODO: Change to ours
});

export default function Home() {
  const router = useRouter();

  // Handler to navigate back to the Consumer View
  const handleGoBack = () => {
    router.push("/consumer");
  };

  return (
    <div className="left-panel-view">
      {/* Left Panel: Contains Logo, Subheading, and Back Button */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Administrator View</h2>
        </div>
        {/* Back to Consumer View Button */}
        <div className="back-button-container">
          <button className="left-panel-back-button" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Main Content: Includes Search Bar and Restaurant List */}
      <div className="right-panel-view">
        {/* Search Bar Section */}
        <div className="search-bar-admin">
          <input
            type="text"
            placeholder="Search for a restaurant"
            className="search-input-admin"
          />
          <button className="search-button-admin">Search</button>
        </div>

        {/* Restaurant List Section */}
        <div className="restaurant-list-admin">
          <h3 className="list-title-admin">Restaurants</h3>
          <ul className="list-admin">
            {/* Example of a restaurant entry */}
            <li className="list-item-admin">
              <a href="/TechPizza">
                <strong>Name:</strong> Tech Pizza<br />
                <strong>Address:</strong> 123 Main St<br />
                <strong>Open:</strong> 9:00 AM<br />
                <strong>Close:</strong> 10:00 PM
              </a>
            </li>
            {/* Another restaurant entry */}
            <li className="list-item-admin">
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
