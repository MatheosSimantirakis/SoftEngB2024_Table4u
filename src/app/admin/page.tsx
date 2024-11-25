'use client';

import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Dynamic baseURL for all APIs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

const listRestaurantsApi = createApiInstance("https://example.com"); // Replace with actual URL

export default function Home() {
  const router = useRouter();

  // Handler to navigate back to the Consumer View
  const handleGoBack = () => {
    router.push("/consumer");
  };

  return (
    <div className="page-container">
      {/* Left Panel: Contains Logo, Subheading, and Back Button */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Administrator View</h2>
        </div>
        <div className="back-button-container">
          <button className="left-panel-back-button" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Right Panel: Main Content */}
      <div className="right-panel">
        {/* Restaurant List Section */}
        <div className="restaurant-list-admin">
          <h3 className="list-title-admin">Restaurants</h3>
          <ul className="list-admin">
            {/* Example restaurant entries */}
            <li className="list-item-admin">
              <a href="/TechPizza">
                <strong>Name:</strong> Tech Pizza
                <br />
                <strong>Address:</strong> 123 Main St
                <br />
                <strong>Open:</strong> 9:00 AM
                <br />
                <strong>Close:</strong> 10:00 PM
              </a>
            </li>
            <li className="list-item-admin">
              <strong>Name:</strong> Boyton
              <br />
              <strong>Address:</strong> 456 Beach Blvd
              <br />
              <strong>Open:</strong> 11:00 AM
              <br />
              <strong>Close:</strong> 11:00 PM
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}