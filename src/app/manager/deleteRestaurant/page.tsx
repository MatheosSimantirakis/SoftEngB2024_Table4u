'use client';
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://ub4vssj8g4.execute-api.us-east-2.amazonaws.com'
});

const Delete: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleActivate = async () => {

    if (name) {
      instance.post('/deleteRestaurant', {
        "name": name,
        }).then(function (response){
        let status = response.data.statusCode
        let resultComp = response.data.body       
        
        if (status === 200) {
          setName('');
        } else {
          console.error("Failed to delete restaurant:", resultComp);
          setError('Failed to delete restaurant');
        }
      })
      .catch(function(error) {
        console.error("Error:", error);
        setError('An error occurred while deleting the restaurant.');
      })
    } else {
      setError('Please fill in name field.');
    }
  };

  return (
    <div className="manager_button_container">
      <h1>Delete Restaurant View</h1>
      <p>Content below</p>
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      {error && <p className="error">{error}</p>}
      <button className="manager_button press" onClick={handleActivate}>
        Submit
      </button>
    </div>
  );
};

export default Delete;