'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/consumer");
  };

  return (
    <div className="admin-view">
      {/* Left Side: Logo and Subheading */}
      <div className="left-panel-admin">
        <div className="left-panel-header-admin">
          <img src="/logo.svg" alt="Tables4U Logo" className="logo-admin" />
          <h2 className="subtitle-admin">Administrator View</h2>
        </div>
        {/* Back to Consumer View Button */}
        <div className="back-button-container">
          <button className="back-button-admin" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Main Content: Search Bar & Restaurant List */}
      <div className="main-content-admin">
        <div className="search-bar-admin">
          <input
            type="text"
            placeholder="Search for a restaurant"
            className="search-input-admin"
          />
          <button className="search-button-admin">Search</button>
        </div>

        {/* Restaurant List Inside Rectangle */}
        <div className="restaurant-list-admin">
          <h3 className="list-title-admin">Restaurants</h3>
          <ul className="list-admin">
            <li className="list-item-admin">
              <a href="/TechPizza">
                <strong>Name:</strong> Tech Pizza<br />
                <strong>Address:</strong> 123 Main St<br />
                <strong>Open:</strong> 9:00 AM<br />
                <strong>Close:</strong> 10:00 PM
              </a>
            </li>
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
