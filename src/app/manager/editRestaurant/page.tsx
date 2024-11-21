"use client";

import React from 'react';

const Edit: React.FC = () => {
  return (
    <div className="manager_button_container">
      <h1>Edit Restaurant View</h1>
      <p>Content below</p>
      <label>Name</label>
      <input
    	  type="text"
        placeholder="ExistingName"
      />
      <label>Adress</label>
      <input
	      type="text"
          placeholder="ExistingAddress"
      />
    </div>
    
  );
};

export default Edit;