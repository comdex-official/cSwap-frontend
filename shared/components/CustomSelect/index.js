import { Select, Input } from 'antd';
import * as PropTypes from 'prop-types';
import React from 'react';
import {
  amountConversionWithComma,
  denomConversion,
  getDenomBalance,
} from '../../../utils/coin';
import NoDataIcon from '../../components/NoDataIcon/index';
import { NextImage } from '../../image/NextImage';
import { Drop } from '../../image';

const Option = Select.Option;

const CustomSelect = ({
  iconList,
  value,
  onChange,
  list,
  loading,
  disabled,
  onSearchChange,
  assetMap,
  balances,
}) => {
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
      suffixIcon={<NextImage src={Drop} alt={'Drop'} />}
      dropdownRender={(menu) => (
        <>
          <div
            className={'select-pair-wrap'}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={'select-pair-title'}
              onClick={(e) => e.stopPropagation()}
            >
              Select a token
            </div>
            <div
              className={'select-pair-border'}
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className={'select-pair-input'}
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                className="pair__input2"
                placeholder="Select a token by symbol"
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>
          {menu}
        </>
      )}
    >
      {list &&
        list.map((record, i) => {
          const item = record?.denom ? record?.denom : record;
          return (
            <Option key={i} value={item}>
              <div className="select-inner">
                <div className="svg-icon">
                  <div className="svg-icon-inner swap-svg-icon-inner">
                    <NextImage
                      src={iconList?.[item]?.coinImageUrl}
                      alt={'logo'}
                      height={25}
                      width={25}
                    />
                    <div className="name">
                      {denomConversion(item) &&
                      denomConversion(item).includes('ibc/')
                        ? ''
                        : denomConversion(item)}
                    </div>
                  </div>
                </div>
                <div className={'select-pair-end-content'}>
                  {amountConversionWithComma(
                    getDenomBalance(balances, item) || 0,
                    assetMap[item]?.decimals
                  )}
                </div>
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
