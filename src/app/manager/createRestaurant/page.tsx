"use client";

import React from 'react';

const Create: React.FC = () => {
  return (
    <div className="manager_button_container">
      <h1>Create Restaurant View</h1>
      <p>Content below</p>
      <label>Name</label>
      <input
    	  type="text"
        placeholder="Name"
      />
      <label>Adress</label>
      <input
	      type="text"
        placeholder="Address"
      />
    </div>
  );
};

export default Create;
