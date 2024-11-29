import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const CabinDashboard = () => {
  const { cabinName } = useParams(); // Get the cabin name from the URL
  const socketRef = useRef(null);
  const [audio] = useState(new Audio("path/to/your/alert-sound.mp3")); // Add your audio file path here

  useEffect(() => {
    // Connect to the Socket.IO server
    socketRef.current = window.io(
      "https://office-assist-backend.onrender.com",
      {
        transports: ["websocket"],
      }
    );

    // Automatically send the assistance request when the URL is accessed
    handleAssistanceRequest();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleAssistanceRequest = async () => {
    try {
      // Send a POST request to the backend to notify staff of the assistance request
      const response = await fetch(
        "https://office-assist-backend.onrender.com/api/assist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cabinName }),
        }
      );

      if (response.ok) {
        alert("Assistance request sent automatically!");
        audio.play(); // Play audio alert
      } else {
        alert("Error sending request.");
      }
    } catch (error) {
      console.error("Error sending assistance request:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">{cabinName} Cabin</h1>
        <button
          onClick={handleAssistanceRequest} // Optional: In case someone clicks manually
          className="bg-red-600 text-white p-4 w-3/5 h-28 rounded-lg shadow-md hover:bg-red-700 transition-all"
        >
          Request Assistance
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CabinDashboard;
