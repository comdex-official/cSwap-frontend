import { useAppSelector } from '@/shared/hooks/useAppSelector';
import styles from './Govern.module.scss';
import { Icon } from '@/shared/image/Icon';
import { useRouter } from 'next/router';

const Govern = () => {
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme.theme);

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
          className={`${styles.govern__header} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.govern__element} ${styles.active} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Total Staked'}
            </div>
            <div
              className={`${styles.govern__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'312.45'}
            </div>
          </div>
          <div
            className={`${styles.govern__element} ${styles.active} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Total Proposals'}
            </div>
            <div
              className={`${styles.govern__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'7'}
            </div>
          </div>
          <div
            className={`${styles.govern__element} ${styles.active} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__element__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Average Participation'}
            </div>
            <div
              className={`${styles.govern__element__details} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'50.12%'}
            </div>
          </div>
        </div>
        <div
          className={`${styles.govern__body} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.govern__body__upper} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.govern__body__upper__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'New Proposal'}
            </div>
            <div
              className={`${styles.govern__body__upper__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Forum'}
            </div>
            <div
              className={`${styles.govern__body__upper__title} ${
                styles.active
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {'Filter'}
              <Icon className={'bi bi-chevron-down'} size={'1.2rem'} />
            </div>
          </div>
          <div
            className={`${styles.govern__body__lower} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {true && (
              <div
                className={`${styles.govern__body__lower__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
                onClick={() => router.push(`/govern/${1}`)}
              >
                <div
                  className={`${styles.govern__body__lower__left} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.govern__body__lower__left__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {`#137`}{' '}
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
                        className={`${
                          styles.govern__body__lower__pass__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
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
                    className={`${styles.govern__body__lower__title} ${
                      styles.active
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'“Summary.”\n Testnet network of comdex was Successful...'}
                  </div>
                </div>
                <div
                  className={`${styles.govern__body__lower__right} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.govern__body__lower__right__upper} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.govern__body__lower__right__upper__element
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.govern__body__lower__right__upper__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'Vote Starts :'}
                      </div>
                      <div
                        className={`${styles.govern__body__lower__title} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'24th April, 2023 14:38:05'}
                      </div>
                    </div>
                    <div
                      className={`${
                        styles.govern__body__lower__right__upper__element
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.govern__body__lower__right__upper__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'Voting Ends :'}
                      </div>
                      <div
                        className={`${styles.govern__body__lower__title} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'26th April, 2023 14:38:05'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${
                      styles.govern__body__lower__right__upper__element
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <div
                      className={`${
                        styles.govern__body__lower__right__upper__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'Duration :'}
                    </div>
                    <div
                      className={`${styles.govern__body__lower__title} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {'3 days'}
                    </div>
                  </div>
                  <div
                    className={`${styles.govern__line} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Govern;
