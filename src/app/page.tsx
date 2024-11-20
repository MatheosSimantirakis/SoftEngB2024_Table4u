import Image from "next/image";


export default function Home() {
  
  return (
    <div className="Customer View">

      <input type="text" style={{ position: 'absolute', top: '100px', left: '50px', width: '600px', height: '40px' }} placeholder="Search..." value={""}
      // onChange={"Hi"}
      />
      <button className="reservations" >reservations</button>
      <div className="timeDropDown" style={{ marginTop: "20px" }}>
        <label htmlFor="timeSelect" style={{ marginRight: "10px" }}>Select a Time:</label>
        <select id="timeSelect" style={{ padding: "5px", fontSize: "16px" }}>
          <option value="08:00">08:00 AM</option>
          <option value="09:00">09:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="13:00">13:00 PM</option>
          <option value="14:00">14:00 PM</option>
          <option value="15:00">15:00 PM</option>
          <option value="16:00">16:00 PM</option>
          <option value="17:00">17:00 PM</option>
          <option value="18:00">18:00 PM</option>
          <option value="19:00">19:00 PM</option>
          <option value="20:00">20:00 PM</option>
          <option value="21:00">21:00 PM</option>
          <option value="22:00">22:00 PM</option>
          <option value="23:00">23:00 PM</option>
        </select>
      </div>      
    </div>
  );
}
