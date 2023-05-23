import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";
import Flashcard from "./components/flashcard";

const Popup = () => {
  const [data, setData] = useState([
    // {
    //   id: 0,
    //   flashcard: {
    //     question:
    //       "What improvements have experts called for to strengthen the WHO?",
    //     answer:
    //       "Increased funding, reforms to governance, and greater cooperation between member countries.",
    //   },
    // },
  ]);
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

          console.log("Current tab URL:", url);

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
                setError("Error Axios");
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
      <h1 className="text-4xl text-green-500">SKEEM</h1>
      {loading && <p className="flaschards">Loading...</p>}
      {!loading && error && <p>{error}</p>}

      {Object.keys(data).length > 0 && (
        <div className="flaschards">
          {data.map((item) => (
            <Flashcard
              key={item.id}
              id={item.id}
              question={item.flashcard.question}
              answer={item.flashcard.answer}
            />
          ))}
        </div>
      )}
      {!loading && Object.keys(data).length === 0 && (
        <p>Failed to produce results.</p>
      )}

      <button onClick={handleGenerate} className="btnGenerate">
        {generate && !data && !error
          ? "Stop Generating"
          : "Generate Flaschards"}
      </button>
    </div>
  );
};

export default Popup;
