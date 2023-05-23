import * as React from "react";
import "../popup.css";

const Flaschard = (props) => {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const onClickReveal = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <div
      className={`flaschardItem ${isRevealed ? "revealed" : ""}`}
      onClick={onClickReveal}
    >
      {!isRevealed ? <h1>{props.question}</h1> : <h1>{props.answer}</h1>}
    </div>
  );
};

export default Flaschard;
