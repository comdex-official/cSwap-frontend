import { useTimer } from "react-timer-hook";

const Timer = ({ expiryTimestamp, text }) => {
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp });

  return (
    <div>
      {text || ""}
      <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
    </div>
  );
};

export default Timer;
