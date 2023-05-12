import { Select } from "antd";
import * as PropTypes from "prop-types";
import React from "react";
import { denomConversion } from "../../../utils/coin";
import NoDataIcon from "../../components/NoDataIcon/index";
import { Icon } from "../../image/Icon";
import { NextImage } from "../../image/NextImage";
import { ATOM } from "../../image";

const Option = Select.Option;

const CustomSelect = ({ value, onChange, list, loading, disabled }) => {
  return (
    <Select
      aria-label="Select"
      className="assets-select"
      popupClassName="asset-select-dropdown swap-asset-select-dropdown"
      value={value}
      disabled={disabled}
      loading={loading || false}
      placeholder={
        <div className="select-placeholder">
          <div className="circle-icon">
            <div className="circle-icon-inner" />
          </div>
          Select
        </div>
      }
      onChange={onChange}
      defaultActiveFirstOption={true}
      notFoundContent={<NoDataIcon />}
      suffixIcon={<Icon className={"bi bi-chevron-down"} />}
    >
      {list &&
        list.map((record) => {
          const item = record?.denom ? record?.denom : record;
          return (
            <Option key={item} value={item}>
              <div className="select-inner">
                <div className="svg-icon">
                  <div className="svg-icon-inner swap-svg-icon-inner">
                    <NextImage src={ATOM} alt={"logo"} />
                    {/* <SvgIcon name={iconNameFromDenom(item)} /> */}
                  </div>
                </div>
                <div className="name">{denomConversion(item)}</div>
              </div>
            </Option>
          );
        })}
    </Select>
  );
};

CustomSelect.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  list: PropTypes.array,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

export default CustomSelect;
