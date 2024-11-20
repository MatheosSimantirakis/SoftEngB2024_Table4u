import Image from "next/image";

export default function Home() {
  
  return (
    <div className="Customer View">

      <input type="text" style={{ position: 'absolute', top: '100px', left: '50px', width: '600px', height: '40px' }} placeholder="Search..." value={""}
      // onChange={"Hi"}
      />
      <button className="reservations" >reservations</button>
      
    </div>
  );
}
