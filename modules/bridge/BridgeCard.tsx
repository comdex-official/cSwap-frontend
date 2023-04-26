import Card from '@/shared/components/card/Card';
import styles from './Bridge.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { ATOM, Arrow, CMDS } from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import { useState } from 'react';
import { AxelarData, GravityData, IBCData, TabData } from './Data';

interface BridgeCardProps {
  theme?: string;
}

const BridgeCard = ({ theme }: BridgeCardProps) => {
  const [activeTab, setActiveTab] = useState<string>('IBC Transfer');

  const handleActiveTab = (value: string) => {
    setActiveTab(value);
  };

  const hasTargetName = TabData.find((person) => person.name === activeTab);

  return (
    <div className={styles.bridgeCard__wrap}>
      <Card>
        <div className={styles.bridgeCard__main}>
          <div
            className={`${styles.bridgeCard__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'Bridge'}
          </div>

          <div className={styles.bridgeCard__toggle__element}>
            {TabData.map((item) => (
              <div
                className={`${styles.bridgeCard__toggle__element__title} ${
                  hasTargetName?.name === item.name ? styles.activeTab : ''
                } ${theme === 'dark' ? styles.dark : styles.light}`}
                onClick={() => handleActiveTab(item.name)}
                key={item.id}
              >
                {item.name}
              </div>
            ))}
          </div>

          {hasTargetName?.id === 0 && (
            <div className={styles.bridgeCard__body}>
              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'From'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={ATOM} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'JUNO'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div
                className={`${styles.bridgeCard__swap} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage src={Arrow} alt="Logo_Dark" />
              </div>

              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'To'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={CMDS} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'COMDEX'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div
                className={`${styles.bridgeCard__body__item__footer} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${
                    styles.bridgeCard__body__item__details__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'0.00000'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={CMDS} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'JUNO'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div className={styles.bridgeCard__footer}>
                {IBCData.map((item) => (
                  <div
                    className={styles.bridgeCard__footer__element}
                    key={item.id}
                  >
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {item.leftData}
                    </div>
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {item.rightData}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasTargetName?.id === 1 && (
            <div className={styles.bridgeCard__body}>
              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'From'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={ATOM} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'ETHEREUM'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div
                className={`${styles.bridgeCard__swap} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <Icon className={`bi bi-arrow-down`} size={'2rem'} />
              </div>

              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'To'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={CMDS} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'COMDEX'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div
                className={`${styles.bridgeCard__body__item__footer} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${
                    styles.bridgeCard__body__item__details__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'0.00000'}
                </div>
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={CMDS} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'JUNO'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>
              </div>

              <div className={styles.bridgeCard__footer}>
                {GravityData.map((item) => (
                  <div
                    className={styles.bridgeCard__footer__element}
                    key={item.id}
                  >
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {item.leftData}
                    </div>
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {item.rightData}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasTargetName?.id === 2 && (
            <div className={styles.bridgeCard__body}>
              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={ATOM} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'ETHEREUM'}
                  </div>
                </div>

                <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
              </div>

              <div
                className={`${styles.bridgeCard__swap} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <Icon className={`bi bi-arrow-down`} size={'2rem'} />
              </div>

              <div
                className={`${styles.bridgeCard__body__item} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.bridgeCard__body__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={CMDS} alt="Logo_Dark" />
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'wETH'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} size={'1.2rem'} />
                </div>

                <div className={styles.bridgeCard__body__item__last}>
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__button
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'MAX'}
                  </div>
                  <div
                    className={`${
                      styles.bridgeCard__body__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'0.00000'}
                  </div>
                </div>
              </div>

              <div className={styles.bridgeCard__footer}>
                {AxelarData.map((item, i) => (
                  <div
                    className={styles.bridgeCard__footer__element}
                    key={item.id}
                  >
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {item.leftData}
                    </div>
                    <div
                      className={`${styles.bridgeCard__footer__title} ${
                        i === 2
                          ? styles.bridgeCard__body__item__details__button
                          : ''
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {item.rightData}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`${styles.bridgeCard__button__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <button>{'Transfer'}</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BridgeCard;
