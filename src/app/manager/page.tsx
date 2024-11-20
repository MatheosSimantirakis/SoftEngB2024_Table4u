"use client";

import React from 'react';

const Manager: React.FC = () => {
  return (
    <div className="manager_button_container">
      <h1>Manager View</h1>
      <p>Content below</p>
      <button className="manager_button">Create Restaurant</button>
      <button className="manager_button">Edit Restaurant</button>
      <button className="manager_button">Activate Restaurant</button>
      <button className="manager_button">Delete Restaurant</button>
      <button className="manager_button">Review Day's Availability</button>
      <button className="manager_button">Close Future Day</button>
      <button className="manager_button">Open Future Day</button>
      <button className="manager_button">Login Restaurant</button>
    </div>
  );
};

export default Manager;
