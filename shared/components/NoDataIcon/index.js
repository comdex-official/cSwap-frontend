import React from 'react';
import { NextImage } from '../../image/NextImage';
import { No_Data } from '../../image';
import styles from './index.module.scss';
import { Button } from 'antd';

const NoDataIcon = ({ text, button, buttonText, OnClick }) => {
  return (
    <div className={styles.no_data_card}>
      <NextImage src={No_Data} alt="Message" height={60} width={60} />
      <div className={styles.empty_text}>{text ? `${text}` : 'No Data'}</div>

      {button && (
        <Button
          type="primary"
          className="btn-no-data"
          onClick={() => OnClick()}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default NoDataIcon;
