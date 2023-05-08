import { Input } from 'antd';
import * as PropTypes from 'prop-types';
import React from 'react';

const CustomInput = ({
  type = 'number',
  className,
  value,
  disabled,
  placeholder,
  onChange,
  onFocus,
  validationError,
  decimals,
}: any) => {
  const isError = validationError?.message?.length > 0;

  return (
    <>
      <Input
        type={type}
        value={value || ''}
        className={className}
        disabled={disabled}
        placeholder={placeholder || Number().toFixed(decimals || 2)}
        onChange={onChange}
        onFocus={onFocus}
        aria-label="Input"
      />
      {isError ? (
        <div className={isError ? 'alert-label' : 'alert-label alert-hidden'}>
          {validationError?.message}
        </div>
      ) : null}
    </>
  );
};

export default CustomInput;
