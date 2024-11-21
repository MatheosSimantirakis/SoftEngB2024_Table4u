"use client";

import React from 'react';

const Open: React.FC = () => {
  return (
    <div className="manager_button_container">
      <h1>Login Restaurant View</h1>
      <p>Content below</p>
      <label>Restaurant Name</label>
      <input
	    type="text"
        placeholder="Name"
      />
      <label>Credentials</label>
      <input
	    type="text"
        placeholder="Credentials"
      />

      
    </div>
    
  );
};

export default Open;