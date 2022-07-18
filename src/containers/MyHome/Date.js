import { useCallback, useEffect, useState } from "react";
import { getTransactionTimeFromHeight } from "../../services/transaction";
import { formatTime } from "../../utils/date";

const Date = ({ height }) => {
    const [timestamp, setTimestamp] = useState();

    const fetchData = useCallback( async () => {
        const transactionTime = await getTransactionTimeFromHeight(height);
        if (transactionTime) {
            setTimestamp(transactionTime);
        }
    },[height]);
    
    useEffect(() => {
        if (height) {
            fetchData();
        }
    }, [height, fetchData]);

    

    return (
        <div className="dates-col" style={{ width: "240px" }}>
            <div className="dates">
                {formatTime(timestamp)}
            </div>
        </div>
    );
};

export default Date;
