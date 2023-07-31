import React from 'react';
import { useTimer } from 'react-timer-hook';

function MyTimer({ expiryTimestamp }) {
    const {
        days,
        seconds,
        minutes,
        hours,
    } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called') });


    return (
        <>
            <span>
                {days === 0 ? null : (<span>{days}d </span>)} <span>{hours}</span>h <span>{minutes}</span>m <span>{seconds}</span>s
            </span>
        </>
    );
}

export default MyTimer;