import { useTimer } from "react-timer-hook";

const Timer = ({ expiryTimestamp, text }) => {
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp });

  return (
    <div className="timer-main">
      <div className="left-text">
        {text || ""}
      </div>
      {/* <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span> */}
      <div className="timer-count">
        <div className="cols">
          <div className="cols-card">
              <div className="cols-inner">
                {hours}
              </div>
          </div>
          <div className="label">Hours</div>
        </div> 
        <div className="cols">
          <div className="cols-card">
              <div className="cols-inner">
                {minutes}
              </div>
          </div>
          <div className="label">Minutes</div>
        </div> 
        <div className="cols">
          <div className="cols-card">
              <div className="cols-inner">
                {seconds}
              </div>
          </div>
          <div className="label">Seconds</div>
        </div> 
      </div>
    </div>
  );
};

export default Timer;
