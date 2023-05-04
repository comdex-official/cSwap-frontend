import { Col, InputNumber, Row, Slider } from 'antd';
import { getAMP, rangeToPercentage } from '../../../helpers/utils';
import { useState } from 'react';

const RangeTooltipContent = () => {
  const [inputValue, setInputValue] = useState(0);

  const onChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setInputValue(value);
  };

  const marks = {
    0: {
      style: {
        color: '#ffffff',
      },
      label: '0%',
    },
    50: {
      style: {
        color: '#ffffff',
      },
      label: '50%',
    },
    100: {
      style: {
        color: '#ffffff',
      },
      label: '100%',
    },
  };

  return (
    <Row>
      <Col span={18}>
        <Slider
          min={0}
          max={100}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
          step={0.01}
          tooltip={{ open: false }}
          marks={marks}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          type="number"
          min={0}
          max={100}
          style={{ margin: '0 16px' }}
          value={inputValue}
          //@ts-ignore
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

export default RangeTooltipContent;
