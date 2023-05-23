import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";

const Popup = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generate, toggleGenerate] = useState(false);

  useEffect(() => {
    // Function to get the current tab's URL
    const getCurrentTabUrl = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Check for errors
        if (chrome.runtime.lastError || tabs.length === 0) {
          setError("Error getting current tab URL");
          return;
        }

        const currentTab = tabs[0];
        const url = currentTab.url;

        // Make a GET request to the server-side endpoint with the dynamic URL
        setLoading(true);
        axios
          .get(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`)
          .then((response) => {
            setData(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setError("Error scraping website");
            setLoading(false);
          });
      });
    };

    getCurrentTabUrl();
  }, [generate]);

  const handleGenerate = () => {
    toggleGenerate(!generate);
  };

  return (
    <div>
      <h1 className="text-4xl text-green-500">Team RJJ FlashCard Generator</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && data && <></>}
      <button onClick={handleGenerate}>Generate!!</button>
    </div>
  );
};

export default Popup;
