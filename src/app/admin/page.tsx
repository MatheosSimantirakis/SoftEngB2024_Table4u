/* eslint-disable */

'use client';

import React, { useState, useEffect } from "react";
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

const listRestaurantsApi = createApiInstance("https://vnfjz2cb5e.execute-api.us-east-2.amazonaws.com/listRestaurants");
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
    [key: string]: {
      tables: TableData[];
      utilization: number;
      availability: number
    }
  }

  const [restaurants, setRestaurants] = useState([])
  const [isCanRes, setIsCanRes] = useState(false)
  const [isSelectedRes, setIsSelectedRes] = useState(false)
  const [isGAR, setIsGar] = useState(false)
  const [reservationId, setReservationId] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [availabilityReport, setAvailabilityReport] = useState<any>([])
  const [time, setTime] = useState()
  const [tableNumber, setTableNumber] = useState()
  const [totalSeats, setTotalSeats] = useState()
  const [usedSeats, setUsedSeats] = useState()
  const [availableSeats, setAvailableSeats] = useState()
  const [reportDate, setReportDate] = useState('')
  const [report, setReport] = useState({})

  const handleOpenCanRes = () => setIsCanRes(true)
  const handleCloseCanRes = () => {
    setIsCanRes(false)
    setSelectedRestaurant(null)
  }

  const handleOpenSelectedRes = () => setIsSelectedRes(true)
  const handleCloseSelectedRes = () => {
    setIsSelectedRes(false)
  }

  const handleOpenIsGAR = () => setIsGar(true)
  const handleCloseIsGar = () => {
    setIsGar(false)
  }

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsSelectedRes(true)
  }

  // Function for on-screen notifications
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type: string }>({
    message: '',
    visible: false,
    type: '',
  });

  // Notification component
  const Notification = ({ message, visible, type }: { message: string; visible: boolean; type: string }) => {
    if (!visible) return null;
    return <div className={`notification ${type}`}>{message}</div>;
  };

  // Helper function to show notifications
  const showNotification = (
    message: string,
    params: Record<string, string> = {},
    type: string = 'success',
    duration: number = 10000 // Default duration: 10 seconds
  ) => {
    const formattedMessage = Object.keys(params).reduce(
      (msg, key) => msg.replace(`{${key}}`, params[key]),
      message
    );

    setNotification({ message: formattedMessage, visible: true, type });

    // Clear notification after specified duration
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: '' });
    }, duration);
  };

  const handleGenerateReport = async () => {

    try {
      const payload = { restaurantId: selectedRestaurant?.restaurantId, reportDate: reportDate }
      generateAvailabilityReportApi.post('/', payload).then(response => {
        const responseBody = response.data.admin //typeof response === "string" ? JSON.parse(response.a) : response.
        console.log("response: ", response)
        const finalResult: Array<any> = []
        for (const x in responseBody) {
          finalResult.push({ x: { "hour": x, "body": responseBody[x] } })
        }
        console.log("response status code: ", response.data.statusCode)
        finalResult.map((n) => {
          console.log(n)
        })
        setAvailabilityReport(finalResult)

        if (response.data.statusCode === 200) {
          console.log("availability Report: ", responseBody)
          console.log("availability Report body: ", availabilityReport)

        } else {
          alert("Failed to generate the report")
        }
        handleOpenIsGAR()

      }).catch((reason) => {
        console.log(reason)
      })
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  // API: Delete Restaurant
  // API: Delete Restaurant
  const handleDeleteRestaurant = async () => {
    if (!selectedRestaurant) {
      // Notify if no restaurant is selected
      showNotification("No restaurant selected to delete", {}, "error");
      return;
    }

    try {
      // Prepare the payload for the API request
      const payload = { restaurantId: selectedRestaurant.restaurantId };

      // Send the API request to delete the restaurant
      const response = await deleteRestaurantApi.post('/', payload);

      if (response.data.statusCode === 200) {
        // Notify success and reset state
        showNotification("Restaurant has been deleted successfully", {}, "success");

        // Close the popup automatically
        setIsSelectedRes(false);
        setIsCanRes(false);
      } else {
        // Notify of an error during the delete operation
        showNotification("Something went wrong while deleting the restaurant", {}, "error");
      }
    } catch (error) {
      // Log and notify the user of a server error
      console.error("Error deleting restaurant:", error);
      showNotification("Failed to delete the restaurant. Please try again later.", {}, "error");
    }
  };

  // API: Cancel Reservation
  const handleCancelReservation = async () => {
    try {
      console.log("reservationID: " + reservationId);

      // Prepare the payload for the API request
      const payload = { reservationId };
      const info = JSON.stringify(payload);

      // Send the API request to cancel the reservation
      const response = await cancelReservationApi.post('/', info);
      console.log(
        "status" + response.status +
        "StatusCode" + response.data.statusCode +
        "body: " + response.data.body
      );

      // Check the response and show appropriate notifications
      const data = response.data.body[20];
      console.log(data);

      if (data === '1') {
        showNotification("Reservation has been canceled successfully", {}, "success");

        // Close the popup automatically
        setIsCanRes(false);
      } else {
        showNotification("Reservation ID does not exist", {}, "error");
      }
    } catch (error) {
      // Log and notify the user of an error
      console.error("Failed to cancel reservation:", error);
      showNotification("An unexpected error occurred while canceling the reservation", {}, "error");
    }
  };

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
      {notification.visible && (
        <Notification
          message={notification.message}
          visible={notification.visible}
          type={notification.type}
        />
      )}

      {/* Left Panel: Contains Logo, Subheading, and Back Button */}
      <div className="left-panel">
        <div className="left-panel-header">
          <img src="/logo.svg" alt="Tables4U Logo" className="left-panel-logo" />
          <h2 className="left-panel-subtitle">Administrator View</h2>
        </div>
        <div className="action-button-container">
          <div className="left-admin-container">
            <button className="action-button" onClick={handleOpenCanRes}> Cancel Reservation</button>
            <div>
            </div>
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
          {restaurants.length > 0 ? (
            <ul className="list-admin">
              {restaurants.map((restaurant: Restaurant) => (
                <li
                  key={restaurant.restaurantId}
                  className="result-item-admin"
                  onClick={() => handleRestaurantClick(restaurant)}>
                  <strong className="restaurant-name-list-admin">{restaurant.name}</strong>
                  <p className="restaurant-info-admin">Address:  {restaurant.address}</p>
                </li>
              ))}
            </ul>
          ) : (<p>No Restaurants</p>)}
        </div>
      </section>

      {/* Restaurant Popup */}
      {isSelectedRes && (
        <div className="modal-overlay-restaurant-admin">
          <div className="restaurant-popup-admin">
            <button className="close-button" onClick={handleCloseSelectedRes}>
              ✕
            </button>
            {/* Restaurant Name */}
            <div className="restaurant-name-admin">{selectedRestaurant?.name}</div>

            {/* Availability Report Section */}
            <div className="availability-report-section">
              <label className="availability-label">Generate Availability Report:</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="date-input-report"
              />
              <button
                className="generate-report-button"
                onClick={handleGenerateReport}
              >
                Generate Availability Report
              </button>
            </div>

            {/* Delete Restaurant Button */}
            <button
              className="delete-restaurant-button-admin"
              onClick={handleDeleteRestaurant}
            >
              Delete Restaurant
            </button>
          </div>
        </div>
      )}

      {/* Cancel Reservation */}
      {isCanRes && (
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
                onChange={(e) => setReservationId(e.target.value)}
              />
              <button className="cancel-reservation-button" onClick={handleCancelReservation}>Cancel Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}