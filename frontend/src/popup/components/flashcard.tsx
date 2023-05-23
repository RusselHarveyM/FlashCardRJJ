import * as React from "react";
import "../popup.css";

const Flaschard = (props) => {
  return (
    <div className="flaschardItem">
      <h1>{props.question}</h1>
    </div>
  );
};

export default Flaschard;
