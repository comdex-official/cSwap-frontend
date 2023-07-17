import { useTimer } from 'react-timer-hook';

const Timer = ({ expiryTimestamp, text }) => {
  const { seconds, minutes, hours } = useTimer({ expiryTimestamp });

  let sec = String(seconds),
    min = String(minutes),
    hrs = String(hours);

  return (
    <div className="timer-main">
      <div className="left-text">
        {text || ''} <span> {hrs?.length === 1 ? '0' + hrs : hrs} Hours</span>
        <span> {min?.length === 1 ? '0' + min : min} Minutes</span>
        <span> {sec?.length === 1 ? '0' + sec : sec} Seconds</span>
      </div>
    </div>
  );
};

export default Timer;
