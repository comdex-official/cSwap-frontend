import { Icon } from '@/shared/image/Icon';
import { Select } from 'antd';
import React from 'react';

const Option = Select.Option;

const CustomSelect = ({ value, onChange, list, loading, disabled }: any) => {
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
      notFoundContent={'...'}
      suffixIcon={<Icon className={`bi bi-chevron-down`} />}
    >
      {list &&
        list.map((record: any) => {
          const item = record?.denom ? record?.denom : record;
          return (
            <Option key={item} value={item}>
              <div className="select-inner">
                <div className="svg-icon">
                  <div className="svg-icon-inner swap-svg-icon-inner">
                    ...
                    {/* <SvgIcon name={iconNameFromDenom(item)} /> */}
                  </div>
                </div>
                {/* <div className="name">{denomConversion(item)}</div> */}
              </div>
            </Option>
          );
        })}
    </Select>
  );
};

export default CustomSelect;
