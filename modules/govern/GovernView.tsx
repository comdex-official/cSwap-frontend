import { useState } from 'react';
import styles from './Govern.module.scss';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useRouter } from 'next/router';

const GovernView = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const router = useRouter();

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
    <div
      className={`${styles.govern__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.govern__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.govern__button__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <button onClick={() => router.back()}>{'Back'}</button>
        </div>
        <div
          className={`${styles.govern__header} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.govern__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__right__line} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            />

            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Voting Starts'}
            </div>
            <div
              className={`${styles.govern__view__header__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'2023-04-04 14:38:05'}
            </div>
          </div>
          <div
            className={`${styles.govern__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__right__line} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            />
            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Voting Ends'}
            </div>
            <div
              className={`${styles.govern__view__header__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'2023-04-06 14:38:05'}
            </div>
          </div>
          <div
            className={`${styles.govern__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__right__line} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            />
            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Proposer'}
            </div>
            <div
              className={`${styles.govern__view__header__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'comdex....9qg'}
            </div>
          </div>
        </div>
        <div
          className={`${styles.govern__view__body} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.govern__view__body__left} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__view__body__left__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'#137'}
              <div
                className={`${styles.govern__body__lower__pass} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.govern__body__green} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                />
                <div
                  className={`${styles.govern__body__lower__pass__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Passed'}
                </div>
              </div>
            </div>
            <div
              className={`${styles.govern__body__lower__title} ${
                styles.active
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {'Cancel Software upgrade to v10.0.0'}
            </div>
            <div
              className={`${styles.govern__view__lower__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {
                '**Summary:**\n Testnet network of comdex was successfully upgraded to version v10.0.0 at block height 1845124. \nHowever, few validators have encountered issues with the network after the upgrade, particularly related to the AppHash problem on their state machines. \nThis proposal is to cancel the mainnet upgrade to version v10.0.0 until we can rectify the issues experienced by the validators on the testnet network. \nThe team has identified the issue which is very intermittent but want to make sure it’s resolved before hand. \n**Vote:** \n - By voting YES, you agree that software upgrade to v10.0.0 should be canceled. \n - By voting NO, you signal that software upgrade to v10.0.0 should not be canceled . \n - By voting ABSTAIN, you formally decline to vote either for or against the proposal.\n - By voting, NOWITHVETO expresses that you strongly disagree and would like to see depositors penalised by revocation of their proposal deposit and contribute towards an automatic 1/3 veto threshold.'
              }
            </div>
          </div>
          <div
            className={`${styles.govern__view__body__right} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__view__vote__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.govern__view__vote__button} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Vote Now'}
              </div>
            </div>

            <div
              className={`${styles.govern__view__lower__chart} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
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
                              ((100 - item.percentValue) / 100) *
                              -219.99078369140625,
                          }}
                          key={i}
                          d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0"
                        />
                      );
                    })}
                </svg>
              </div>

              <div
                className={`${styles.govern__view__element__wrap} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.govern__element__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Total Vote'}
                </div>
                <div
                  className={`${styles.govern__view__element__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'24,901.25 CMDX'}
                </div>
              </div>
            </div>
            <div
              className={`${styles.govern__view__footer__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.govern__view__footer__element} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.govern__yes} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                />
                <div
                  className={`${styles.govern__element} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.govern__element__all__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Yes'}
                  </div>
                  <div
                    className={`${styles.govern__element__all__details} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'51.42%'}
                  </div>
                </div>
              </div>

              <div
                className={`${styles.govern__view__footer__element} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.govern__no} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                />
                <div
                  className={`${styles.govern__element} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.govern__element__all__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'No'}
                  </div>
                  <div
                    className={`${styles.govern__element__all__details} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'21.42%'}
                  </div>
                </div>
              </div>

              <div
                className={`${styles.govern__view__footer__element} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.govern__abstain} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                />
                <div
                  className={`${styles.govern__element} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.govern__element__all__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Abstain'}
                  </div>
                  <div
                    className={`${styles.govern__element__all__details} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'17.70%'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernView;
