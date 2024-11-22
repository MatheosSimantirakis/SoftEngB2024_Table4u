"use client";

import React from 'react';

const Consumer: React.FC = () => {
  
    return (
    /*All HTML class are under Customer View className*/
      <div className="Customer View">

      {/* Gabe's Code for search bar*/}
      <div className="search-bar">
          <input type="text" placeholder="Search for a restaurant..." className="search-input"/>
          <button className="search-button">Search</button>
        </div>

        {/* Matheos reservation button */}
        <button className="reservations-consumer" 
            style={{padding: "5px", fontSize: "18px", position: 'absolute', top: '250px', left: '100px', width: '180px', borderRadius: 4}}
        >Reservations</button>
      
      {/* Matheos Date Dropdown */}
      <div className="dateDropDown-consumer" style={{ marginTop: "20px" }}>
      <select id="dateSelect-consumer" style={{padding: "5px", fontSize: "18px", position: 'absolute', top: '150px', left: '600px', width: '180px', borderRadius: 4}}>
        <option value="All dates">Dates</option>
      </select>
      </div>

        {/* Matheos Time Dropdown */}
      <div className="timeDropDown" style={{ marginTop: "20px" }}>
        <select id="timeSelect" style={{padding: "5px", fontSize: "18px", position: 'absolute', top: '150px', left: '900px', width: '180px', borderRadius: 4}}>
          <option value="All times">Times</option>
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="13:00">13:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
          <option value="18:00">18:00</option>
          <option value="19:00">19:00</option>
          <option value="20:00">20:00</option>
          <option value="21:00">21:00</option>
          <option value="22:00">22:00</option>
          <option value="23:00">23:00</option>
        </select>
      </div>     


      <div className="seatsDropDown-consumer" style={{ marginTop: "20px" }}>
        <select id="numberOfSeats-consumer" style={{padding: "5px", fontSize: "18px", position: 'absolute', top: '150px', left: '1200px', width: '180px', borderRadius: 4}}>
          <option value="Seats">Seats</option>
          <option value="2 seats">2</option>
          <option value="3 seats">3</option>
          <option value="4 seats">4</option>
          <option value="5 seats">5</option>
          <option value="6 seats">6</option>
        </select>
      </div>
      
      {/* Gabe's Code logo and location*/}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="logo" />
          <h2 className="subtitle">Consumer View</h2>
        </div>
      </div>
    </div>
    );
  };

  export default Consumer;
  