import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";
import { BsCardHeading } from "react-icons/bs";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";
import Flashcard from "./components/flashcard";

const Popup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generate, toggleGenerate] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const onNextHandler = () => {
    setCurrentData((prev) => {
      if (prev && prev.id) {
        const currentId = prev.id - 1;
        const nextID = currentId + 1;
        if (data[nextID] === undefined) {
          return prev;
        }
        return data[nextID];
      }
    });
  };

  const onPreviousHandler = () => {
    setCurrentData((prev) => {
      if (prev && prev.id) {
        const currentId = prev.id - 1;
        const prevID = currentId - 1;
        if (data[prevID] === undefined) {
          return prev;
        }
        return data[prevID];
      }
    });
  };

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
              setCurrentData(response.data[0]);
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
      <h1 className="team-text">SKEEM</h1>
      {loading && <p className="overlay">Loading...</p>}
      {!loading && error && <p className="overlay">{error}</p>}
      {Object.keys(data).length === 0 && currentData !== null && (
        <p className="overlay2">Failed to produce result.</p>
      )}
      <div className="flaschards">
        {Object.keys(data).length > 0 && (
          <Flashcard
            key={currentData.id}
            id={currentData.id}
            answer={currentData.flashcard.answer}
            question={currentData.flashcard.question}
          />
        )}
      </div>

      <div className="btn-prev-next">
        <button onClick={onPreviousHandler}>
          <GrFormPrevious size="40px" />
        </button>
        {Object.keys(data).length > 0 ? (
          <p>
            {currentData.id} of {data.length}
          </p>
        ) : (
          <p>0 of 0</p>
        )}
        <button onClick={onNextHandler}>
          <GrFormNext size="40px" style={{ color: "white" }} />
        </button>
      </div>

      <div className="btn-flex">
        <button onClick={handleGenerate} className="btnGenerate">
          <BsCardHeading size="40px" />
          {generate || (Object.keys(data).length === 0 && error)
            ? "Stop Generating"
            : "Generate Flaschards"}
        </button>
      </div>
    </div>
  );
};

export default Popup;
