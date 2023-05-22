import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";

const Popup = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Function to get the current tab's URL
    const getCurrentTabUrl = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;

        // Make a GET request to the server-side endpoint with the dynamic URL
        axios
          .get(`/scrape?url=${encodeURIComponent(url)}`)
          .then((response) => {
            setData(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    };

    getCurrentTabUrl();
  }, []);

  return (
    <div>
      <h1 className="text-4xl text-green-500">Team RJJ FlashCard Generator</h1>
    </div>
  );
};

export default Popup;
