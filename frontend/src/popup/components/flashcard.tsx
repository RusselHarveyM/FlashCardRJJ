import * as React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { HiLightBulb } from "react-icons/hi";
import "../popup.css";

const Flaschard = (props) => {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const onClickReveal = () => {
    console.log("character length ", props.answer.length);
    setIsRevealed(!isRevealed);
  };

  return (
    <div
      className={`flaschardItem ${isRevealed ? "revealed" : ""}`}
      onClick={onClickReveal}
    >
      <div className="question-container">
        {!isRevealed ? (
          <span>
            <FaQuestionCircle size={30} /> QUESTION
          </span>
        ) : (
          <span>
            <HiLightBulb size={30} /> ANSWER
          </span>
        )}
      </div>
      {!isRevealed ? (
        <h1>{props.question}</h1>
      ) : (
        <h1 className={`${props.answer.length > 110 ? "long" : ""}`}>
          {props.answer}
        </h1>
      )}
    </div>
  );
};

export default Flaschard;
