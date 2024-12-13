'use client';

import React, {useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Restaurant } from "@/model";
import { text } from "stream/consumers";
import { stringify } from "querystring";

// Dynamic baseURL for all APIs
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
  });
};

const listRestaurantsApi = createApiInstance("https://vnfjz2cb5e.execute-api.us-east-2.amazonaws.com/listRestaurants"); // Replace with actual URL
const cancelReservationApi = createApiInstance("https://vqo7mqf378.execute-api.us-east-2.amazonaws.com/cancelReservation")
const deleteRestaurantApi = createApiInstance("https://ub4vssj8g4.execute-api.us-east-2.amazonaws.com/deleteRestaurant")
const generateAvailabilityReportApi = createApiInstance("https://0lynymlkwk.execute-api.us-east-2.amazonaws.com/adminUtilization")

export default function Home() {
  const router = useRouter();

  // Handler to navigate back to the Consumer View
  const handleGoBack = () => {
    router.push("/consumer");
  };

  type TableData = {
    tableNumber: number;
    totalSeats: number;
    usedSeats: number;
    availableSeats: number;
  }

  type AdminEntry = TableData | { utilization: number } | { availability: number };

  type AdminData = {
    [key:string]: {
      tables: TableData[];
      utilization: number; 
      availability: number
    }
  }

  const [restaurants, setRestaurants] = useState([])
  const [isCanRes, setIsCanRes] = useState(false)
  const [isSelectedRes, setIsSelectedRes] = useState(false)
  const [isGAR, setIsGar] = useState(false)
  const [reservationId, setReservtionId] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [availabilityReport, setAvailablityReport] = useState<any>([])

  const [time, setTime] = useState()

  const [tableNumber, setTableNumber] = useState()
  const [totalSeats, setTotalSeats] = useState()
  const [usedSeats, setUsedSeats] = useState()
  const [availableSeats, setAvailableSeats] = useState()
  const [reportDate, setReportDate] = useState('')
  const [report, setReport] = useState({})

  // useEffect(() =>{
  //   console.log("useEffect for availabilityReport: ", availabilityReport)

  // }, [availabilityReport])
 
  const handleOpenCanRes = () => setIsCanRes(true)
  const handleCloseCanRes = () => {
    setIsCanRes(false)
    setSelectedRestaurant(null)
  }

  const handleOpenSelectedRes = () => setIsSelectedRes(true)
  const handleCloseSelectedRes = () => {
    setIsSelectedRes(false)
  }

  const handleopenIsGAR = () => setIsGar(true)
  const handleCloseIsGar = () => {
    setIsGar(false)
  }

  const handleRestaurantClick = (restaurant: Restaurant) =>{
    setSelectedRestaurant(restaurant)
    setIsSelectedRes(true)
  }

  const handleGenerateReport = async() => {
    //handleopenIsGAR()
   
    try{
      const payload = {restaurantId: selectedRestaurant?.restaurantId, reportDate: reportDate}
      generateAvailabilityReportApi.post('/', payload).then (response => {
        const responseBody =  response.data.admin //typeof response === "string" ? JSON.parse(response.a) : response.
        console.log( "response: ", response )
        let finalResult:Array<any> = []
        for (let x in responseBody) {
          finalResult.push( {x : { "hour" : x, "body": responseBody[x]}})
        }
        console.log("response status code: ",  response.data.statusCode)
        finalResult.map((n) => {
          console.log(n)
        })
        setAvailablityReport(finalResult)
  
        
        if(response.data.statusCode === 200 ){
         // setAvailablityReport(responseBody)
          console.log("availability Report: ", responseBody)
          console.log("availability Report body: ", availabilityReport)
  
   
        }else{
          alert("Failed to generate the report")
        }
        handleopenIsGAR()
   
    }).catch((reason) => {
        console.log(reason)
    })
      
    }catch (error){
      console.error("Error generating report:", error)
    }
    
  }

  const handledeleteRestaurant = async() =>{
    if(!selectedRestaurant){
      alert("No Restarant Selected to delete")
      return
    }

    try{
      const payload = {restaurantId : selectedRestaurant?.restaurantId}
      const response = await deleteRestaurantApi.post('/', payload)
       
        if(response.data.statusCode === 200){
          alert("Restaurant Has Been Deleted")
          setIsCanRes(false)
        } else {
          alert("Something went wrong")
        }

    } catch(error){
      console.error("Something went wong server")
      alert("Failed to delete Restaurant")
    }
    setIsSelectedRes(false)
  }

  const handleCancelReservation = async() => {
    try{
      console.log("reservationID: " +reservationId)
      const payload = {reservationId : reservationId}
      const info = JSON.stringify(payload)

      cancelReservationApi.post('/',info).then((response) =>{
        console.log("status"+response.status + "StatusCode" +response.data.statusCode + "body: " +response.data.body )
        const data = response.data.body[20]
        console.log(data)

        if(data === '1'){
          alert("Reservation has been Canceled")
        } else {
          alert("Reservation Id does not exist")
        }
      })
    } catch(error){
      console.error("Failed to cancel reservation")
    }
  }
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await listRestaurantsApi.get('');
        if (response.status === 200) {
          const fetchedRestaurants = response.data.restaurants.map((restaurant: any) => ({
            restaurantId: restaurant.restaurantId,
            name: restaurant.name,
            address: restaurant.address,
            startTime: restaurant.startTime, 
            endTime: restaurant.endTime, 
            tables: restaurant.table
          }));

          <div className="right-panel"> </div>
          setRestaurants(fetchedRestaurants); 
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchRestaurants();
  },
  []);


  return (
    <div className="page-container">
      {/* Left Panel: Contains Logo, Subheading, and Back Button */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Administrator View</h2>
        </div>
        <div>
          <div className="left-admin-container">
            <button className="left-panel-back-button" onClick={handleOpenCanRes}> Cancel Reservation</button>

          </div>
        </div>
        <div className="back-button-container">
          <button className="left-panel-back-button" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Right Panel: Main Content */}
      <section className="right-panel">
        {/* Restaurant List Section */}
        <div className="restaurant-list-admin">
          <h3 className="list-title-admin">Restaurants</h3>
          {restaurants.length > 0 ?  (
            <ul className="list-admin">
              {restaurants.map((restaurant: Restaurant) => (
                <li
                 key={restaurant.restaurantId}
                 className="result-item-admin"
                 onClick={() => handleRestaurantClick(restaurant)}>
                  <strong className="restuarnant-name-admin">{restaurant.name}</strong>
                  <p className="restaurant-info-admin">Address:  {restaurant.address}</p>
                </li>
              ))}
            </ul>
          ): ( <p>No Restaurants</p>)}
        </div>
      </section>
      

      {/* cancel reservation*/}
      {isSelectedRes &&(
        <div className="modal-overlay-open-cancel">
          <div className="cancel-reservation-modal">
            <button className="close-button" onClick={handleCloseSelectedRes}>
            ✕
            </button>  
            <div className="input-group">
              <h1>{selectedRestaurant?.name}</h1>
              <button className="delete-restaurant-button" onClick={handledeleteRestaurant}> Delete Restaurant </button>

              {/*displaying the availability Report */}
              <label>Generate Availibilty Report: </label>
              <label>Input date of Report</label>
              <input
               type="date"
               value={reportDate}
               onChange={(e) => setReportDate(e.target.value)}
               />
              <button onClick={handleGenerateReport}>Generate Availabilty Report</button>
            </div> 
          </div>
        </div>
      )}

      {/**Generate Availabilty Report */}
      {isGAR && (
      <div className="modal-overlay">
        <div className="generate-modal">
          <button className="close-button" onClick={handleCloseIsGar}>
            ✕
          </button>
          <h1>Availability Report for {selectedRestaurant?.name}</h1>
          <h1>{(console.log('availabilityReport', availabilityReport), availabilityReport)}</h1>
          {availabilityReport.map(([time, tableData]: [number, TableData[]]) => (
            <div key={time}>
              <h2>Hour: {time}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Table Number</th>
                    <th>Total Seats</th>
                    <th>Used Seats</th>
                    <th>Available Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((table, index) => (
                    <tr key={index}>
                      <td>{table.tableNumber}</td>
                      <td>{table.totalSeats}</td>
                      <td>{table.usedSeats}</td>
                      <td>{table.availableSeats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    )}


      {/*cancel Reservation */}
      {isCanRes &&(
        <div className="modal-overlay-admin-cancel">
          <div className="cancel-reservation-modal">
            <button className="close-button" onClick={handleCloseCanRes}>
            ✕
            </button>
            <div className="cancel-reservation-input">
              <label>Input Reservation ID  </label>
              <input
              type="text"
              value={reservationId}
              onChange={(e) => setReservtionId(e.target.value)}
              />
              <button className="cancel-reservation-button" onClick={handleCancelReservation}>Cancel Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

