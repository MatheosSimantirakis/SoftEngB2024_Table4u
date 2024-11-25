'use client';
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://doo8y94tle.execute-api.us-east-2.amazonaws.com'
});

const Edit: React.FC = () => {

  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [address, setAddress] = useState('');
  const [numTables, setNumTables] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {

    if (oldName && newName && address && numTables) {
      instance.post('/editRestaurant', {
        "newName": newName,
        "oldName": oldName,
        "address": address,
        "numTables": numTables}).then(function (response){
        let status = response.data.statusCode
        let resultComp = response.data.body       
        
        if (status === 200) {
          setOldName('');
          setNewName('')
          setAddress('');
          setNumTables('');
        } else {
          console.error("Failed to edit restaurant:", resultComp);
          setError('Failed to edit restaurant');
        }
      })
      .catch(function(error) {
        console.error("Error:", error);
        setError('An error occurred while editing the restaurant.');
      })
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="manager_button_container">
      <h1>Edit Restaurant View</h1>
      <p>Content below</p>
      <label>Old Name</label>
      <input
    	  type="text"
        value={oldName}
        onChange={(e) => setOldName(e.target.value)}
        placeholder="Name"
      />
      <label>New Name</label>
      <input
    	  type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="New Name"
      />
      <label>Adress</label>
      <input
	      type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="New Address"
      />
      <label>numTables</label>
      <input
        type="text"
        value={numTables}
        onChange={(e) => setNumTables(e.target.value)}
        placeholder="New Number of Tables"
      />
      {error && <p className="error">{error}</p>}
      <button className="manager_button press" onClick={handleSubmit}>
        Submit
      </button>
    </div>
    
  );
};

export default Edit;