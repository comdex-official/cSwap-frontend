import { Switch } from "antd";
import React from "react";

const CustomSwitch = ({isChecked, onChange, name}) => {
    return(
        <div className="d-flex align-items-center">
            <Switch
                title="switch"
                checked={isChecked}
                onChange={onChange}
            />  {name ? <span className="ml-2">Limit Order</span> : null}
        </div>
    )
}

export default CustomSwitch;