'use client';
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://kwd94qobx2.execute-api.us-east-2.amazonaws.com'
});

const Create: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numTables, setNumTables] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {

    if (name && address && numTables) {
      instance.post('/create-restaurant', {
        "name": name,
        "address": address,
        "numTables": numTables}).then(function (response){
        let status = response.data.statusCode
        let resultComp = response.data.body       
        
        if (status === 200) {
          setName('');
          setAddress('');
          setNumTables('');
        } else {
          console.error("Failed to create restaurant:", resultComp);
          setError('Failed to create restaurant');
        }
      })
      .catch(function(error) {
        console.error("Error:", error);
        setError('An error occurred while creating the restaurant.');
      })
    } else {
      setError('Please fill in all fields.');
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
      <label>Address</label>
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
      {error && <p className="error">{error}</p>}
      <button className="manager_button press" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default Create;