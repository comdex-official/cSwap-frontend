import React from "react";
import { comdex } from "../../config/network";
import * as PropTypes from "prop-types";
import { Input } from "antd";

const CustomInput = ({
  type = "number",
  className,
  value,
  disabled,
  placeholder,
  onChange,
  onFocus,
  validationError,
    decimals,
}) => {
  const isError = validationError?.message?.length > 0;

  return (
    <>
      <Input
        type={type}
        value={value || ""}
        className={className}
        disabled={disabled}
        placeholder={placeholder || Number().toFixed(decimals || comdex.coinDecimals)}
        onChange={onChange}
        onFocus={onFocus}
      />
      {isError ?
        <div className={isError ? "alert-label" : "alert-label alert-hidden"}>
          {validationError?.message}
        </div>
        : null}
    </>
  );
};

CustomInput.propTypes = {
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  validationError: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      message: PropTypes.string.isRequired,
    }),
  ]),
  type: PropTypes.string,
  value: PropTypes.any,
  placeholder: PropTypes.string,
};

export default CustomInput;
