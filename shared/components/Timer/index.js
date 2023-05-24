import { useTimer } from "react-timer-hook";

const Timer = ({ expiryTimestamp, text }) => {
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp });

  // converting number to string.
  let sec = String(seconds),
    min = String(minutes),
    hrs = String(hours);

  return (
    <div className="timer-main">
      <div className="left-text">
        {text || ""} <span> {hrs?.length === 1 ? "0" + hrs : hrs} Hours</span>
        <span> {min?.length === 1 ? "0" + min : min} Minutes</span>
        <span> {sec?.length === 1 ? "0" + sec : sec} Seconds</span>
      </div>
      {/* <div className="left-text">{text || ""}</div> */}
      {/* <div className="timer-count">
        <div className="cols">
          <div className="cols-card">
            <div className="cols-inner">
            
              {hrs?.length === 1 ? "0" + hrs : hrs}
            </div>
          </div>
          <div className="label">Hours</div>
        </div>
        <div className="cols">
          <div className="cols-card">
            <div className="cols-inner">
              {min?.length === 1 ? "0" + min : min}
            </div>
          </div>
          <div className="label">Minutes</div>
        </div>
        <div className="cols">
          <div className="cols-card">
            <div className="cols-inner">
              {sec?.length === 1 ? "0" + sec : sec}
            </div>
          </div>
          <div className="label">Seconds</div>
        </div>
      </div> */}
    </div>
  );
};

export default Timer;
