import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function StaffDashboard() {
  const cabinData = [
    { cabinName: "Singapore", occupant: "Anant Mishra" },
    { cabinName: "Sydney", occupant: "Limbraj Nikad" },
    { cabinName: "New Delhi", occupant: "Yogesh Desai" },
    { cabinName: "Washington D.C", occupant: "Conference Room" },
    { cabinName: "Moscow", occupant: "Ajit Panwalkar" },
    { cabinName: "Tokyo", occupant: "Conference Room" },
    { cabinName: "Paris", occupant: "Jyoti Desai" },
    { cabinName: "Dubai", occupant: "Conference Room" },
    { cabinName: "London", occupant: "Milind Pathak" },
    { cabinName: "Berlin", occupant: "Conference Room" },
    { cabinName: "Rome", occupant: "None" },
  ];

  const [blinkingCabins, setBlinkingCabins] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioInterval, setAudioInterval] = useState(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null); // Reference for the audio element

  useEffect(() => {
    // Connect to the Socket.IO server
    socketRef.current = window.io(
      "https://office-assist-backend.onrender.com/",
      {
        transports: ["websocket"],
      }
    );

    // Listen for assistance requests
    socketRef.current.on("new-assistance-request", (data) => {
      setBlinkingCabins((prev) => ({ ...prev, [data.cabinName]: true }));

      // Play the sound immediately once the request is received
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });

        // After the first play, start the interval for 5-second repeating sound
        if (audioInterval) clearInterval(audioInterval);
        const intervalId = setInterval(() => {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }, 5000);
        setAudioInterval(intervalId);
      }
    });

    return () => {
      socketRef.current.disconnect();
      if (audioInterval) clearInterval(audioInterval);
    };
  }, [audioEnabled, audioInterval]);

  const handleStopBlinking = (cabinName) => {
    setBlinkingCabins((prev) => ({ ...prev, [cabinName]: false }));
    if (audioInterval) {
      clearInterval(audioInterval);
      setAudioInterval(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const enableAudio = () => {
    setAudioEnabled(true);
    if (audioRef.current) {
      // Play audio once to "unlock" it for future use
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 flex-1">
        {/* Button to enable audio */}
        {!audioEnabled && (
          <button
            onClick={enableAudio}
            className=" mt-14 py-3 w-full max-w-xs bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Enable Audio Alerts
          </button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4 my-14">
          {cabinData.map(({ cabinName, occupant }, index) => (
            <button
              key={index}
              onClick={() => handleStopBlinking(cabinName)}
              className={`p-4 sm:p-6 md:p-8 w-full h-32 sm:h-40 text-white text-lg sm:text-xl font-bold rounded-lg shadow-lg transition transform hover:scale-105 ${
                blinkingCabins[cabinName]
                  ? "bg-red-500 blinking"
                  : "bg-green-500"
              } hover:shadow-xl`}
            >
              <div>{cabinName}</div>
              <div className="text-sm font-normal">{occupant}</div>
            </button>
          ))}
        </div>
      </div>
      <Footer />

      {/* Audio element */}
      <audio
        ref={audioRef}
        src="/mixkit-bell-notification-933.wav"
        preload="auto"
      />

      {/* Add blinking CSS animation */}
      <style>
        {`
          .blinking {
            animation: blink-animation 1s infinite;
          }

          @keyframes blink-animation {
            50% {
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
