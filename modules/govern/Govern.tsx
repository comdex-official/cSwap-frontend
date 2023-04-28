import { useEffect, useState } from 'react';
import styles from './Govern.module.scss';

interface Props {}

const Govern = (props: Props) => {
  const [value, setValue] = useState([
    {
      color: '#DC7F86',
      percentValue: 80,
    },
    {
      color: '#FF4350',
      percentValue: 55,
    },
  ]);

  return (
    <div>
      <div className={`${styles.progress_bar}`}>
        <svg
          className={`${styles.progress}`}
          data-progress="10"
          x="0px"
          y="0px"
          viewBox="0 0 80 80"
        >
          <path
            className={`${styles.track}`}
            d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0"
          />
          {value
            .sort((a: any, b: any) => b.percentValue - a.percentValue)
            .map((item, i) => {
              return (
                <path
                  className={`${styles.fill}`}
                  style={{
                    stroke: item.color,
                    strokeDashoffset:
                      ((100 - item.percentValue) / 100) * -219.99078369140625,
                  }}
                  key={i}
                  d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0"
                />
              );
            })}
        </svg>
      </div>
    </div>
  );
};

export default Govern;
