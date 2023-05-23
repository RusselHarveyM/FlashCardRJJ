import React, { useState, useEffect } from "react";
import "./popup.css";
import axios from "axios";
import Flashcard from "./components/flashcard";

const Popup = () => {
  const [data, setData] = useState([
    {
      id: 1,
      flashcard: {
        question: "What is the main role of the WHO?",
        answer:
          "To promote health and prevent the spread of disease worldwide.",
      },
    },
    {
      id: 2,
      flashcard: {
        question: "What is the WHO's emergency program responsible for?",
        answer:
          "Coordinating global responses to health emergencies, such as pandemics.",
      },
    },
    {
      id: 3,
      flashcard: {
        question: "How has the WHO assisted during the COVID-19 pandemic?",
        answer:
          "Convening global experts, providing technical guidance and coordinating the distribution of medical supplies and vaccines.",
      },
    },
    {
      id: 4,
      flashcard: {
        question: "What criticisms has the WHO faced?",
        answer:
          "Allegations of being too deferential to China and slow to issue key guidance during COVID-19 pandemic.",
      },
    },
    {
      id: 5,
      flashcard: {
        question:
          "What reforms have been suggested to improve the WHO and global health preparedness?",
        answer:
          "Increased funding, governance structure reforms and greater cooperation between member countries.",
      },
    },
    {
      id: 6,
      flashcard: {
        question:
          "Who is calling for increased global cooperation to prevent and respond to future health crises?",
        answer: "Experts.",
      },
    },
    {
      id: 7,
      flashcard: {
        question: "What is the World Health Organization (WHO)?",
        answer:
          "A specialized agency of the United Nations responsible for global public health.",
      },
    },
    {
      id: 8,
      flashcard: {
        question:
          "What is the WHO's responsibility in responding to health emergencies?",
        answer: "To coordinate global responses through its emergency program.",
      },
    },
    {
      id: 9,
      flashcard: {
        question:
          "What role did the WHO play in response to the COVID-19 pandemic?",
        answer:
          "Convened global experts, provided technical guidance, and coordinated distribution of medical supplies and vaccines.",
      },
    },
    {
      id: 10,
      flashcard: {
        question:
          "What improvements have experts called for to strengthen the WHO?",
        answer:
          "Increased funding, reforms to governance, and greater cooperation between member countries.",
      },
    },
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
      {error && <p>{error}</p>}

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
      <button onClick={handleGenerate} className="btnGenerate">
        {generate || !data ? "Stop Generating" : "Generate Flaschards"}
      </button>
    </div>
  );
};

export default Popup;
