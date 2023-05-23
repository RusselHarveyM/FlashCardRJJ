import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";
import Flashcard from "./components/flashcard";

const Popup = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generate, toggleGenerate] = useState(false);

  useEffect(() => {
    let cancelTokenSource;

    if (generate) {
      const getCurrentTabUrl = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError || tabs.length === 0) {
            setError("Error getting current tab URL");
            return;
          }

          const currentTab = tabs[0];
          const url = currentTab.url;

          setLoading(true);
          cancelTokenSource = axios.CancelToken.source();
          axios
            .get(
              `http://localhost:3000/scrape?url=${encodeURIComponent(url)}`,
              {
                cancelToken: cancelTokenSource.token,
              }
            )
            .then((response) => {
              setData(response.data);
              setLoading(false);
            })
            .catch((error) => {
              if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
              } else {
                console.log(error);
                setError("Error scraping website");
                setLoading(false);
              }
            });
        });
      };

      getCurrentTabUrl();
    }

    // Cleanup function to cancel any pending requests
    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Component unmounted");
      }
    };
  }, [generate]);

  const handleGenerate = () => {
    toggleGenerate(!generate);
  };

  return (
    <div>
      <h1 className="text-4xl text-green-500">RJJ</h1>
      {loading && <p className="flaschards">Loading...</p>}
      {error && <p>{error}</p>}
      {/* {data && ( */}
      <div className="flaschards">
        {data.map((item) => (
          <Flashcard
            key={item.id}
            question={item.flashcard.question}
            answer={item.flashcard.answer}
          />
        ))}
      </div>
      {/* )} */}
      <button onClick={handleGenerate} className="btnGenerate">
        Generate Flaschards
      </button>
    </div>
  );
};

export default Popup;
