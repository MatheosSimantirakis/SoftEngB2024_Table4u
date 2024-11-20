import Image from "next/image";


export default function Home() {
  
  return (
    <div className="Customer View">

      <input type="text" style={{position: 'absolute', top: '100px', left: '50px', width: '600px', height: '40px'}} placeholder="Search..." value={""}
      // onChange={"Hi"}
      />
      <button className="reservations" >reservations</button>
      <div className="timeDropDown" style={{ marginTop: "20px" }}>
        <select id="timeSelect" style={{padding: "5px", fontSize: "14px", position: 'absolute', top: '150px', left: '260px', width: '100px', borderRadius: 4}}>
          <option value="All times">All times</option>
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
      <div className="dateDropDown" style={{ marginTop: "20px" }}>
      <select id="dateSelect" style={{padding: "5px", fontSize: "14px", position: 'absolute', top: '150px', left: '150px', width: '100px', borderRadius: 4}}>
        <option value="All dates">dates</option>
      </select>
      </div>
      <div className="seatsDropDown" style={{ marginTop: "20px" }}>
        <select id="numberOfSeats" style={{padding: "5px", fontSize: "14px", position: 'absolute', top: '150px', left: '380px', width: '100px', borderRadius: 4}}>
          <option value="Seats">Seats</option>
          <option value="2 seats">2</option>
          <option value="3 seats">3</option>
          <option value="4 seats">4</option>
          <option value="5 seats">5</option>
          <option value="6 seats">6</option>
        </select>
      </div>      
    </div>
  );
}
