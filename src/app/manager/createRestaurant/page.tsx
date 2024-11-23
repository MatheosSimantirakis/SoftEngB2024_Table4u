"use client";

import React, { useState } from 'react';

const Create: React.FC = () => {

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numTables, setNumTables] = useState('');

  const handleSubmit = async () => {

    const response = await fetch('https://85tdbf1z7d.execute-api.us-east-2.amazonaws.com/create-restaurant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        address, 
        numTables : parseInt(numTables),
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Restaurant created successfully! ID: ' + data.restaurantId);
    } else {
      alert('Error: ' + data.message);
    }

  };

  return (
    <div className="manager_button_container">
      <h1>Create Restaurant View</h1>
      <p>Content below</p>
      <label>Name</label>
      <input
    	  type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <label>Adress</label>
      <input
	      type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
      />
      <label>Number of tables</label>
      <input
        type="text"
        value={numTables}
        onChange={(e) => setNumTables(e.target.value)}
        placeholder="Number of tables"
      />
      <button className="manager_button press" onClick={() => handleSubmit()}>Submit</button>
    </div>
  );
};

export default Create;
