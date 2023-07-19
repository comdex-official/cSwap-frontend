import { Icon } from '../../shared/image/Icon';
import React, { useEffect, useRef, useState } from 'react';
import styles from './OrderBook.module.scss';
import { NextImage } from '../../shared/image/NextImage';
import {
  ArrowRL,
  Drop,
  OrderSlider,
  Star,
  StarHighlight,
} from '../../shared/image';
import OrderbookTable from '../../modules/orderBook/OrderbookTable';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import {
  amountConversion,
  denomConversion,
  orderPriceReverseConversion,
} from '../../utils/coin';
import Long from 'long';
import {
  fetchExchangeRateValue,
  fetchRecentTrades,
  fetchRestPairs,
  queryOrders,
  queryUserOrders,
} from '../../services/liquidity/query';
import { APP_ID, DOLLAR_DECIMALS } from '../../constants/common';
import {
  Radio,
  Tabs,
  message,
  Popover,
  Button,
  Dropdown,
  Input,
  Tooltip,
} from 'antd';
import {
  commaSeparator,
  formatNumber,
  formateNumberDecimalsAuto,
  marketPrice,
} from '../../utils/number';
import NoDataIcon from '../../shared/components/NoDataIcon';
import Buy from './Buy';
import Sell from './Sell';
import dynamic from 'next/dynamic';
import TradehistoryTable from './TradehistoryTable';
import Toggle from '../../shared/components/toggle/Toggle';
import moment from 'moment';
import { errorMessageMappingParser, orderStatusText } from '../../utils/string';
import TooltipIcon from '../../shared/components/TooltipIcon';
import CustomInput from '../../shared/components/CustomInput/index';
import MyDropdown from '../../shared/components/dropDown/Dropdown';
import { signAndBroadcastTransaction } from '../../services/helper';
import { defaultFee } from '../../services/transaction';
import Snack from '../../shared/components/Snack/index';
import variables from '../../utils/variables';
import Loading from '../../pages/Loading';
import Lodash from 'lodash';
import OrderBookTooltipContent from '../../shared/components/OrderBookToolTip';

const TVChartContainer = dynamic(
  () => import('./OrderBookTrading').then((mod) => mod),
  { ssr: false }
);

const OrderBook = ({
  markets,
  balances,
  assetMap,
  address,
  lang,
  handleToggleValue,
  toggleValue,
  params,
}) => {
  const theme = 'dark';

  const [pairs, setPairs] = useState();
  const [selectedPair, setSelectedPair] = useState();
  const [myOrders, setMyOrders] = useState([]);
  const [orderBookData, setOrderBookData] = useState([]);
  const [recentTrade, setRecentTrade] = useState([]);
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState();
  const [cancelInProgress, setCancelInProgress] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [orderLifespan, setOrderLifeSpan] = useState(21600);
  const [filteredPair, setFilteredPair] = useState();
  const [clickedValue, setClickedValue] = useState(0);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchRestPairs((error, pairs) => {
      if (error) {
        // setChartLoading(false);
        return;
      }

      setPairs(pairs?.data);
      setFilteredPair(pairs?.data);
      // setChartLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    if (selectedPair?.pair_id) {
      fetchExchangeRateValue(APP_ID, selectedPair?.pair_id, (error, result) => {
        if (error) {
          return;
        }

        setOrderBookData(result?.pairs[0]?.order_books);
      });
    }
  }, [selectedPair, refresh]);

  useEffect(() => {
    fetchRecentTradesData(selectedPair);
    let intervalId = setInterval(
      () => fetchRecentTradesData(selectedPair),
      10000
    );

    return () => clearInterval(intervalId);
  }, [selectedPair, refresh]);

  const fetchRecentTradesData = async (selectedPair) => {
    if (selectedPair?.pair_id) {
      fetchRecentTrades(selectedPair?.pair_id, (error, result) => {
        if (error) {
          return;
        }

        setRecentTrade(result);
      });
    }
  };

  useEffect(() => {
    if (pairs?.length) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs, refresh]);

  useEffect(() => {
    fetchUserOrders(address, selectedPair?.pair_id);
    let intervalId = setInterval(
      () => fetchUserOrders(address, selectedPair?.pair_id),
      10000
    );

    return () => clearInterval(intervalId);
  }, [address, selectedPair?.pair_id, refresh]);

  useEffect(() => {
    fetchOrders(selectedPair);
    let intervalId = setInterval(() => fetchOrders(selectedPair), 10000);

    return () => clearInterval(intervalId);
  }, [selectedPair, refresh]);

  const fetchUserOrders = async (address, pairId) => {
    if (address && pairId) {
      queryUserOrders(Long.fromNumber(pairId), address, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setMyOrders(result?.orders);
      });
    }
  };

  const fetchOrders = async (pair) => {
    if (pair?.pair_id) {
      queryOrders(Long.fromNumber(pair?.pair_id), (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setOrders(result?.orders);
      });
    }
  };

  const tabItems = [
    {
      label: 'Buy',
      key: '1',
      children: (
        <Buy
          pair={selectedPair}
          balances={balances}
          markets={markets}
          orderLifespan={orderLifespan}
          clickedValue={clickedValue}
          setRefresh={setRefresh}
          refresh={refresh}
        />
      ),
    },
    {
      label: 'Sell',
      key: '2',
      children: (
        <Sell
          pair={selectedPair}
          balances={balances}
          markets={markets}
          orderLifespan={orderLifespan}
          clickedValue={clickedValue}
          setRefresh={setRefresh}
          refresh={refresh}
        />
      ),
    },
  ];

  const ref = useRef(null);

  const handlePairChange = (value) => {
    setSelectedPair(pairs?.find((item) => item?.pair_id === value));
    setClickedValue(0)
    if (ref?.current) {
      ref.current.value = '';
    }
  };

  const handleCancel = (order) => {
    setOrder(order);
    setCancelInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: '/comdex.liquidity.v1beta1.MsgCancelOrder',
          value: {
            orderer: address.toString(),
            appId: Long.fromNumber(APP_ID),
            pairId: order?.pairId,
            orderId: order?.id,
          },
        },
        fee: defaultFee(),
        memo: '',
      },
      address,
      (error, result) => {
        setCancelInProgress(false);

        if (error) {
          message.error(error);
          return;
        }
        if (result?.code) {
          message.info(errorMessageMappingParser(result?.rawLog));
          return;
        }

        fetchOrders(selectedPair);
        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const ordersTablecolumns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (value) => <>{`#${value}`}</>,
      sorter: (a, b) => Number(a?.order_id) - Number(b?.order_id),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Expire Time',
      dataIndex: 'expire_time',
      key: 'expire_time',
      sorter: (a, b) =>
        moment(a?.expire_time).unix() - moment(b?.expire_time).unix(),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Pair',
      dataIndex: 'pair',
      key: 'pair',
      sorter: (a, b) => a?.pair?.localeCompare(b?.pair),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Type',
      dataIndex: 'direction',
      key: 'direction',
      render: (value) => (
        <>
          {value === 'Buy' ? (
            <div className="buy">{'Buy'}</div>
          ) : (
            <div className="sell">{'Sell'}</div> || '-'
          )}
        </>
      ),
      sorter: (a, b) => a?.direction?.localeCompare(b?.direction),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => Number(a?.price) - Number(b?.price),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Amount',
      dataIndex: 'trade_amount',
      key: 'trade_amount',
      sorter: (a, b) => Number(a?.trade_amount) - Number(b?.trade_amount),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a?.status?.localeCompare(b?.status),
      sortDirections: ['ascend', 'descend'],
      showSorterTooltip: false,
    },
    {
      title: 'Action',
      dataIndex: 'cancel',
      key: 'cancel',
      align: 'right',
      render: (item) => (
        <Button
          type="primary"
          loading={order?.id === item?.id && cancelInProgress}
          onClick={() => handleCancel(item)}
          className="btn-filled4"
          size="small"
        >
          Cancel
        </Button>
      ),
    },
  ];

  const openOrdersData =
    myOrders.length > 0 &&
    myOrders.map((item, index) => {
      return {
        key: index,
        id: item?.id ? item?.id?.toNumber() : '',
        expire_time: item?.expireAt
          ? moment(item.expireAt).format('MMM DD, YYYY HH:mm')
          : '',
        direction: item?.direction === 1 ? 'Buy' : 'Sell',
        pair:
          item?.direction === 1
            ? `${denomConversion(item?.receivedCoin?.denom)}/${denomConversion(
                item?.offerCoin?.denom
              )}`
            : `${denomConversion(item?.offerCoin?.denom)}/${denomConversion(
                item?.receivedCoin?.denom
              )}`,
        offered_coin: item?.offerCoin
          ? `${amountConversion(
              item?.offerCoin?.amount,
              assetMap[item?.offerCoin?.denom]?.decimals
            )} ${denomConversion(item?.offerCoin?.denom)}`
          : '',
        trade_amount: item?.amount ? amountConversion(item?.amount) : 0,
        price: item?.price ? orderPriceReverseConversion(item.price) : 0,
        received: item?.receivedCoin
          ? `${amountConversion(
              item?.receivedCoin?.amount,
              assetMap[item?.receivedCoin?.denom]?.decimals
            )} ${denomConversion(item?.receivedCoin?.denom)}`
          : '',
        remaining: item?.remainingOfferCoin
          ? `${amountConversion(
              item?.remainingOfferCoin?.amount,
              assetMap[item?.remainingOfferCoin?.denom]?.decimals
            )} ${denomConversion(item?.remainingOfferCoin?.denom)}`
          : '',
        order_id: item?.id?.toNumber(),
        status: item?.status ? orderStatusText(item.status) : '',
        cancel: item,
      };
    });

  let buyOrders = orders?.filter((item) => item.direction === 1);
  buyOrders = buyOrders.sort((a, b) => {
    return b.price - a.price;
  });

  let sellOrders = orders?.filter((item) => item.direction === 2);
  sellOrders = sellOrders.sort((a, b) => {
    return b.price - a.price;
  });

  let recentTradeFilter = recentTrade.sort((a, b) => {
    const dateA = new Date(a?.timestamp);
    const dateB = new Date(b?.timestamp);
    if (dateA.getTime() > dateB.getTime()) {
      return -1;
    } else if (dateA.getTime() < dateB.getTime()) {
      return 1;
    } else {
      return 0;
    }
  });

  const orderItems = [
    {
      label: `Open Orders(${
        openOrdersData.length > 0 ? openOrdersData.length : 0
      })`,
      key: '10',
      children: (
        <OrderbookTable
          openOrdersData={openOrdersData}
          ordersTablecolumns={ordersTablecolumns}
        />
      ),
    },
    {
      label: 'Trade History',
      key: '12',
      children: <TradehistoryTable pairs={pairs} />,
    },
  ];

  const handleOrderLifespanChange = (value) => {
    value = value.toString().trim();

    if (
      value >= 0 &&
      Number(value) <= params?.maxOrderLifespan?.seconds.toNumber()
    ) {
      setOrderLifeSpan(value);
    }
  };

  const SettingPopup = (
    <div className="slippage-tolerance">
      <div className={'slippage-title'}>
        <div>Limit order lifespan</div>

        <TooltipIcon text="Your transaction will revert if it is pending for more than this period of time." />
      </div>
      <div className="tolerance-bottom">
        <Radio.Group
          onChange={(event) => setOrderLifeSpan(event.target.value)}
          defaultValue="a"
          value={orderLifespan}
        >
          <Radio.Button value={0}>1Block</Radio.Button>
          <Radio.Button value={21600}>6H</Radio.Button>
          <Radio.Button value={43200}>12H</Radio.Button>
          <Radio.Button value={86400}>24H</Radio.Button>
        </Radio.Group>
        <div className="input-section lifespan-setting">
          <CustomInput
            className="input-cmdx"
            onChange={(event) => handleOrderLifespanChange(event.target.value)}
            value={orderLifespan}
            validationError={false}
            placeholder="0"
          />
          <span className="percent-text">S</span>
        </div>
      </div>
    </div>
  );

  const [filterValue, setFilterValue] = useState(0);

  useEffect(
    () => setFilterValue(orderBookData[0]?.price_unit),
    [orderBookData]
  );

  const Items = [
    {
      key: 'item-1',
      label: (
        <div className={styles.dropdown__orderbook}>
          <div className="filter-button-radio">
            <Radio.Group
              onChange={(event) => setFilterValue(event.target.value)}
              defaultValue="a"
              value={filterValue}
            >
              {orderBookData &&
                orderBookData.map((item, i) => (
                  <Radio.Button value={item?.price_unit} key={i}>
                    {Number(item?.price_unit)
                      .toFixed(7)
                      .replace(/\.?0+$/, '')}
                  </Radio.Button>
                ))}
            </Radio.Group>
          </div>
        </div>
      ),
    },
  ];

  const checkPrice = (priceUnit) => {
    const data = orderBookData.filter((item) => item?.price_unit === priceUnit);
    return data;
  };

  const BuySellData = checkPrice(filterValue);

  const matchBuySell = (baseCoin, assetCoin) => {
    if (baseCoin === assetCoin) {
      return true;
    } else {
      return false;
    }
  };

  const onSearchChange = (searchKey) => {
    const searchTerm = searchKey.trim().toLowerCase();
    if (searchTerm) {
      let resultsObj = pairs.filter((item) => {
        return (
          item?.pair_symbol
            ?.replace(/\//g, '-')
            ?.toLowerCase()
            .match(new RegExp(searchTerm, 'g')) ||
          item?.pair_symbol?.toLowerCase().match(new RegExp(searchTerm, 'g'))
        );
      });

      setFilteredPair(resultsObj);
    } else {
      setFilteredPair(pairs);
    }
  };

  const [content, setContent] = useState([]);
  const [updateStar, setUpdateStar] = useState(false);

  useEffect(() => {
    setContent(JSON.parse(localStorage.getItem('market')));
  }, [updateStar]);

  const newTableData =
    content !== null &&
    content.map((el) => {
      return el.replace(/['"]+/g, '');
    });

  var res1 =
    filteredPair &&
    filteredPair.filter(function (el) {
      return (
        newTableData.length > 0 && newTableData.indexOf(el?.pair_symbol) >= 0
      );
    });
  var res2 =
    filteredPair &&
    filteredPair.filter(function (el) {
      return (
        newTableData.length > 0 && newTableData.indexOf(el?.pair_symbol) < 0
      );
    });

  const finalTableData = Lodash.concat(res1, res2);

  const checkStar = (data) => {
    const dataCheck = newTableData ? newTableData.includes(data) : false;
    return dataCheck;
  };

  const onFavourite = (coin) => {
    if (localStorage.getItem('market') === null) {
      localStorage.setItem('market', JSON.stringify([]));
    }
    var old_arr = JSON.parse(localStorage.getItem('market'));

    old_arr.push(JSON.stringify(coin));
    localStorage.setItem('market', JSON.stringify(old_arr));
    setUpdateStar(!updateStar);
  };

  const Delete = (value) => {
    let displayItems = JSON.parse(localStorage.getItem('market'));
    const index = displayItems.indexOf(value);
    displayItems.splice(index, 1);
    localStorage.setItem('market', JSON.stringify(displayItems));
    setUpdateStar(!updateStar);
  };

  const items = [
    {
      label: (
        <div className={`${styles.dropdown__orderbook__wrap}`}>
          <div
            className={`${styles.dropdown__orderbook__search}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              className="pair__input"
              placeholder="Search a token by symbol"
              onChange={(event) => onSearchChange(event.target.value)}
              prefix={<Icon className={'bi bi-search'} />}
              ref={ref}
            />
          </div>
          <div className={`${styles.dropdown__orderbook__table}`}>
            <div className={`${styles.dropdown__orderbook__table__head}`}>
              <div className={`${styles.dropdown__orderbook__head__title}`}>
                Pair
              </div>
              <div className={`${styles.dropdown__orderbook__head__title}`}>
                {`Price`}
              </div>
              <div className={`${styles.dropdown__orderbook__head__title}`}>
                24h Volume Change
              </div>
            </div>
            <div className={`${styles.dropdown__orderbook__table__body__wrap}`}>
              {finalTableData.length > 0 ? (
                <>
                  {finalTableData?.map((item, index) => (
                    <div
                      className={`${styles.dropdown__orderbook__table__body}`}
                      key={index}
                      onClick={() => handlePairChange(item?.pair_id)}
                    >
                      <div
                        className={`${styles.dropdown__orderbook__body__title} ${styles.flex}`}
                      >
                        <div
                          className={`${styles.dropdown__orderbook__body__img}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {checkStar(item?.pair_symbol) ? (
                            <NextImage
                              src={StarHighlight}
                              width={10}
                              height={10}
                              alt="Star"
                              onClick={() => Delete(item?.pair_symbol)}
                            />
                          ) : (
                            <NextImage
                              src={Star}
                              width={10}
                              height={10}
                              alt="Star"
                              onClick={() => onFavourite(item?.pair_symbol)}
                            />
                          )}
                        </div>
                        <div
                          className={`${styles.dropdown__orderbook__body__pair}`}
                        >
                          {item?.pair_symbol?.replace(/\//g, '-')}
                        </div>
                      </div>
                      <div
                        className={`${styles.dropdown__orderbook__body__title}`}
                      >
                        {commaSeparator(
                          formateNumberDecimalsAuto({
                            price: item?.price || 0,
                          })
                        )}
                      </div>
                      <div
                        className={`${
                          styles.dropdown__orderbook__body__title
                        } ${styles.flex2} ${
                          Number(item?.total_volume_24h_change || 0).toFixed(
                            DOLLAR_DECIMALS
                          ) >= 0
                            ? styles.profit
                            : styles.loss
                        }`}
                      >
                        {Number(item?.total_volume_24h_change || 0).toFixed(
                          DOLLAR_DECIMALS
                        ) >= 0 ? (
                          <div
                            className={`${styles.dropdown__orderbook__profit__arrow}`}
                          >
                            <Icon className={'bi bi-arrow-up-short'} />
                          </div>
                        ) : (
                          <div
                            className={`${styles.dropdown__orderbook__loss__arrow}`}
                          >
                            <Icon className={'bi bi-arrow-down-short'} />
                          </div>
                        )}
                        {Number(item?.total_volume_24h_change || 0).toFixed(
                          DOLLAR_DECIMALS
                        ) >= 0
                          ? '+'
                          : '-'}
                        {commaSeparator(
                          Math.abs(
                            Number(item?.total_volume_24h_change || 0).toFixed(
                              DOLLAR_DECIMALS
                            )
                          )
                        )}
                        %
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {filteredPair?.length <= 0 ? (
                    <NoDataIcon />
                  ) : (
                    filteredPair?.map((item, index) => (
                      <div
                        className={`${styles.dropdown__orderbook__table__body}`}
                        key={index}
                        onClick={() => handlePairChange(item?.pair_id)}
                      >
                        <div
                          className={`${styles.dropdown__orderbook__body__title} ${styles.flex}`}
                        >
                          <div
                            className={`${styles.dropdown__orderbook__body__img}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {checkStar(item?.pair_symbol) ? (
                              <NextImage
                                src={StarHighlight}
                                width={10}
                                height={10}
                                alt="Star"
                                onClick={() => Delete(item?.pair_symbol)}
                              />
                            ) : (
                              <NextImage
                                src={Star}
                                width={10}
                                height={10}
                                alt="Star"
                                onClick={() => onFavourite(item?.pair_symbol)}
                              />
                            )}
                          </div>
                          <div
                            className={`${styles.dropdown__orderbook__body__pair}`}
                          >
                            {item?.pair_symbol?.replace(/\//g, '-')}
                          </div>
                        </div>
                        <div
                          className={`${styles.dropdown__orderbook__body__title}`}
                        >
                          {commaSeparator(
                            formateNumberDecimalsAuto({
                              price: item?.price || 0,
                            })
                          )}
                        </div>
                        <div
                          className={`${
                            styles.dropdown__orderbook__body__title
                          } ${styles.flex2} ${
                            Number(item?.total_volume_24h_change || 0).toFixed(
                              DOLLAR_DECIMALS
                            ) >= 0
                              ? styles.profit
                              : styles.loss
                          }`}
                        >
                          {Number(item?.total_volume_24h_change || 0).toFixed(
                            DOLLAR_DECIMALS
                          ) >= 0 ? (
                            <div
                              className={`${styles.dropdown__orderbook__profit__arrow}`}
                            >
                              <Icon className={'bi bi-arrow-up-short'} />
                            </div>
                          ) : (
                            <div
                              className={`${styles.dropdown__orderbook__loss__arrow}`}
                            >
                              <Icon className={'bi bi-arrow-down-short'} />
                            </div>
                          )}
                          {Number(item?.total_volume_24h_change || 0).toFixed(
                            DOLLAR_DECIMALS
                          ) >= 0
                            ? '+'
                            : '-'}
                          {commaSeparator(
                            Math.abs(
                              Number(
                                item?.total_volume_24h_change || 0
                              ).toFixed(DOLLAR_DECIMALS)
                            )
                          )}
                          %
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ),
      key: 'item-15',
    },
  ];

  const calculateWidth = (user_order_amount) => {
    const maxValue = Math.max(
      ...BuySellData[0]?.sells.map((obj) => obj.user_order_amount)
    );
    const amount =
      (amountConversion(user_order_amount) / amountConversion(maxValue)) * 100;

    return amount;
  };

  const avgPrice = (mouseRowIndex) => {
    let totalPrice = 0;
    let count = 0;

    for (let i = 0; i <= mouseRowIndex; i++) {
      totalPrice += Number(
        formateNumberDecimalsAuto({
          price: Number(
            formateNumberDecimalsAuto({
              price: BuySellData[0]?.buys[i]?.price || 0,
              minDecimal: 3,
            })
          ),
          minDecimal: 3,
        })
      );
      count++;
    }

    return Number(totalPrice) / count;
  };

  const totalAmount = (mouseRowIndex) => {
    let totalAmount = 0;
    let count = 0;

    for (let i = 0; i <= mouseRowIndex; i++) {
      totalAmount += Number(BuySellData[0]?.buys[i]?.user_order_amount);
      count++;
    }

    const price = formateNumberDecimalsAuto({
      price:
        Number(
          formateNumberDecimalsAuto({
            price: selectedPair?.price || 0,
          })
        ) * marketPrice(markets, selectedPair?.base_coin_denom),
    });

    return amountConversion(totalAmount) * price;
  };

  const avgPrice2 = (mouseRowIndex) => {
    let totalPrice = 0;
    let count = 0;

    for (let i = mouseRowIndex; i < BuySellData[0]?.sells?.length; i++) {
      totalPrice += Number(
        formateNumberDecimalsAuto({
          price: Number(
            formateNumberDecimalsAuto({
              price: BuySellData[0]?.sells[i]?.price || 0,
              minDecimal: 3,
            })
          ),
          minDecimal: 3,
        })
      );
      count++;
    }

    return Number(totalPrice) / count;
  };

  const totalAmount2 = (mouseRowIndex) => {
    let totalAmount = 0;
    let count = 0;

    for (let i = mouseRowIndex; i < BuySellData[0]?.sells?.length; i++) {
      totalAmount += Number(
        amountConversion(BuySellData[0]?.sells[i]?.user_order_amount)
      );
      count++;
    }

    const price = formateNumberDecimalsAuto({
      price:
        Number(
          formateNumberDecimalsAuto({
            price: selectedPair?.price || 0,
          })
        ) * marketPrice(markets, selectedPair?.base_coin_denom),
    });

    return totalAmount * price;
  };

  return (
    <div
      className={`${styles.orderbook__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.orderbook__wrap__head__title} ${styles.order} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <Toggle value={toggleValue} handleToggleValue={handleToggleValue} />
        <span>{'Pro-Mode'}</span>
      </div>
      <div
        className={`${styles.orderbook__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.orderbook__element__left} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__trading__view}  ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__trading__header}  ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Dropdown
                menu={{ items }}
                placement="bottomLeft"
                trigger={['click']}
                overlayClassName="dropconnect-overlay"
              >
                <div
                  className={`${styles.orderbook__trading__element} ${
                    styles.gap
                  } ${styles.cursor}`}
                  onClick={(e) => e.preventDefault()}
                >
                  <NextImage src={ArrowRL} alt="ArrowRL" />
                  <div
                    className={`${styles.orderbook__trading__title}  ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {selectedPair?.pair_symbol?.replace(/\//g, '-') || null}
                  </div>
                  <NextImage src={Drop} alt="Drop" />
                </div>
              </Dropdown>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                }`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'Price'}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <span>
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price: selectedPair?.price || 0,
                        minDecimal: 3,
                      })
                    )}
                  </span>
                  <span
                    className={`${styles.orderbook__trading__element__price}  ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    ~$
                    {commaSeparator(
                      formateNumberDecimalsAuto({
                        price:
                        (Number(Number(selectedPair?.price || 0) *
                     Number(marketPrice(markets, selectedPair?.base_coin_denom))).toFixed(8)),
                      })
                    )}
                  </span>
                </div>
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'24h Volume'}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {commaSeparator(
                    formatNumber(
                      Number(selectedPair?.total_volume_24h || 0).toFixed(
                        DOLLAR_DECIMALS
                      )
                    )
                  )}
                </div>
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'24h High'}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title}  ${
                    styles.profit
                  }  ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {commaSeparator(
                    formateNumberDecimalsAuto({
                      price: selectedPair?.high || 0,
                    })
                  )}
                </div>
              </div>
              <div
                className={`${styles.orderbook__trading__element} ${
                  styles.element__child
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.header
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'24h Low'}
                </div>
                <div
                  className={`${styles.orderbook__trading__element__title} ${
                    styles.loos
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {commaSeparator(
                    formateNumberDecimalsAuto({
                      price: selectedPair?.low || 0,
                    })
                  )}
                </div>
              </div>
            </div>
            <div
              className={`${styles.orderbook__trading__part} ${styles.loos} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {chartLoading ? (
                <div
                  className={`${styles.orderbook__trading__spin} ${
                    styles.loos
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  <Loading />
                </div>
              ) : (
                <TVChartContainer
                  selectedPair={selectedPair}
                  symbol={selectedPair?.pair_symbol}
                />
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.middle__row}`}>
          <div
            className={`${styles.orderbook__element__middle__upper} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__element__middle__upper__head} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__upper__head__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__upper__head__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Orderbook'}
                </div>

                <MyDropdown
                  items={Items}
                  placement={'bottomRight'}
                  trigger={['click']}
                  className="farm-sort"
                >
                  <div
                    className={`${
                      styles.orderbook__upper__head__right__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {!isNaN(
                      Number(filterValue)
                        .toFixed(7)
                        .replace(/\.?0+$/, '')
                    )
                      ? Number(filterValue)
                          .toFixed(7)
                          .replace(/\.?0+$/, '')
                      : 0}{' '}
                    <Icon className={'bi bi-chevron-down'} />
                  </div>
                </MyDropdown>
              </div>
              <div
                className={`${styles.orderbook__lower__head__main} ${
                  styles.upper
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                <div
                  className={`${styles.orderbook__lower__head}  ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.orderbook__lower__head__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {selectedPair === undefined
                      ? `Price`
                      : `Price (${selectedPair?.quote_coin})`}
                  </div>
                  <div
                    className={`${styles.orderbook__lower__head__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {selectedPair === undefined
                      ? `Amount`
                      : `Amount (${selectedPair?.base_coin})`}
                  </div>
                </div>

                {BuySellData[0]?.sells.length <= 0 ||
                BuySellData[0]?.sells === undefined ? (
                  <div
                    className={`${
                      styles.orderbook__lower__table__head__title
                    } ${styles.no__data} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'No Data'}
                  </div>
                ) : (
                  BuySellData[0]?.sells &&
                  BuySellData[0]?.sells.map((item, index) => (
                    <div key={index}>
                      <Tooltip
                        title={
                          <>
                            <OrderBookTooltipContent
                              price={avgPrice2(index)}
                              total={totalAmount2(index)}
                            />
                          </>
                        }
                        overlayClassName="farm_upto_apr_tooltip"
                        placement="left"
                      >
                        <div
                          className={`${styles.orderbook__lower__head} ${
                           styles.cursor 
                          }`}
                          onClick={() =>
                            setClickedValue(
                              formateNumberDecimalsAuto({
                                price: Number(
                                  commaSeparator(
                                    formateNumberDecimalsAuto({
                                      price:
                                      Number(item?.price) *
                                        10 **
                                         (
                                            selectedPair?.base_coin_exponent -
                                              selectedPair?.quote_coin_exponent
                                          ) || 0,
                                    })
                                  )
                                ),
                              })
                            )
                          }
                        >
                          <div
                            className={`${styles.orderbook__buy__width__wrap}  ${styles.loss}`}
                            style={{
                              width: `${calculateWidth(
                                item?.user_order_amount
                              )}%`,
                            }}
                          ></div>

                          <div
                            className={`${
                              styles.orderbook__lower__table__head__title
                            } ${styles.loss} ${
                              theme === 'dark' ? styles.dark : styles.light
                            }`}
                          >
                            {commaSeparator(
                              formateNumberDecimalsAuto({
                                price:
                                  Number(item?.price) *
                                    10 **
                                     (
                                        selectedPair?.base_coin_exponent -
                                          selectedPair?.quote_coin_exponent
                                      ) || 0,
                                minDecimal: 3,
                              })
                            )}
                          </div>

                          <div
                            className={`${
                              styles.orderbook__lower__table__head__title
                            } ${theme === 'dark' ? styles.dark : styles.light}`}
                          >
                            {item?.user_order_amount
                              ? amountConversion(item?.user_order_amount)
                              : 0}
                          </div>
                        </div>
                      </Tooltip>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className={`${styles.orderbook__middle__head__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__middle__head__main__title} ${
                  styles.active
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {commaSeparator(
                  formateNumberDecimalsAuto({
                    price: selectedPair?.price || 0,
                    minDecimal: 3,
                  })
                )}
              </div>
              <div
                className={`${styles.orderbook__middle__head__main__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {' '}
                ~$
                {commaSeparator(
                  formateNumberDecimalsAuto({
                    price:
                    (Number(Number(selectedPair?.price || 0) *
                     Number(marketPrice(markets, selectedPair?.base_coin_denom))).toFixed(8)),
                  })
                )}
              </div>
            </div>
            <div
              className={`${styles.orderbook__lower__head__main} ${
                styles.lower
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {BuySellData[0]?.buys.length <= 0 ||
              BuySellData[0]?.buys === undefined ? (
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    styles.no__data
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'No Data'}
                </div>
              ) : (
                BuySellData[0]?.buys &&
                BuySellData[0]?.buys.map((item, index) => (
                  <div key={index}>
                    <Tooltip
                      title={
                        <>
                          <OrderBookTooltipContent
                            price={avgPrice(index)}
                            total={totalAmount(index)}
                          />
                        </>
                      }
                      overlayClassName="farm_upto_apr_tooltip"
                      placement="left"
                    >
                      <div
                        className={`${styles.orderbook__lower__head} ${
                          styles.cursor 
                        }`}
                        onClick={() =>
                          setClickedValue(
                            formateNumberDecimalsAuto({
                              price: Number(
                                commaSeparator(
                                  formateNumberDecimalsAuto({
                                    price:
                                  Number(item?.price) *
                                    10 **
                                     (
                                        selectedPair?.base_coin_exponent -
                                          selectedPair?.quote_coin_exponent
                                      ) || 0,
                                  })
                                )
                              ),
                            })
                          )
                        }
                      >
                        <div
                          className={`${styles.orderbook__buy__width__wrap} ${styles.profit} `}
                          style={{
                            width: `${calculateWidth(
                              item?.user_order_amount
                            )}%`,
                          }}
                        ></div>

                        <div
                          className={`${
                            styles.orderbook__lower__table__head__title
                          }  ${styles.profit} ${
                            theme === 'dark' ? styles.dark : styles.light
                          }`}
                        >
                          {commaSeparator(
                            formateNumberDecimalsAuto({
                              price:
                                  Number(item?.price) *
                                    10 **
                                     (
                                        selectedPair?.base_coin_exponent -
                                          selectedPair?.quote_coin_exponent
                                      ) || 0,
                              minDecimal: 3,
                            })
                          )}
                        </div>

                        <div
                          className={`${
                            styles.orderbook__lower__table__head__title
                          } ${theme === 'dark' ? styles.dark : styles.light}`}
                        >
                          {item?.user_order_amount
                            ? amountConversion(item?.user_order_amount)
                            : 0}
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            className={`${styles.orderbook__element__middle__lower} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__upper__head__table} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__upper__head__left__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Recent Trades'}
              </div>
            </div>
            <div
              className={`${styles.orderbook__middle__lower__table} ${
                recentTradeFilter.length === 0 ? styles.no_data : ''
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.orderbook__middle__lower__table__head} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {selectedPair === undefined
                    ? `Price`
                    : `Price (${selectedPair?.quote_coin})`}
                </div>
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    styles.width
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {selectedPair === undefined
                    ? `Amount`
                    : `Amount (${selectedPair?.base_coin})`}
                </div>
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    styles.width
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'Time'}
                </div>
              </div>

              {recentTradeFilter.length === 0 ? (
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    styles.no__data
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'No Recent Trades'}
                </div>
              ) : (
                recentTradeFilter &&
                recentTradeFilter.map((item, i) => (
                  <div
                    className={`${styles.orderbook__lower__head} ${
                      styles.lower
                    }  ${theme === 'dark' ? styles.dark : styles.light}`}
                    key={i}
                  >
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${
                        matchBuySell(
                          item?.pair?.base_coin?.base_denom,
                          item?.asset_in?.denom
                        )
                          ? styles.loss
                          : styles.profit
                      }  ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {commaSeparator(
                        formateNumberDecimalsAuto({
                          price: item?.price || 0,
                          minDecimal: 3,
                        })
                      )}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {item?.asset_in
                        ? amountConversion(item?.asset_in?.amount)
                        : 0}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__lower__table__head__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {moment(item?.timestamp).format('h:mm:ss')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles.orderbook__element__right} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
          id="spot"
        >
          <div
            className={`${styles.orderbook__element__right__head} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__element__right__head__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Spot'}
            </div>
            <Popover
              className="setting-popover"
              content={SettingPopup}
              placement="bottomRight"
              overlayClassName="cmdx-popver"
              trigger="click"
            >
              <div>
                <NextImage src={OrderSlider} alt="Logo" />
              </div>
            </Popover>
          </div>
          <div
            className={`${styles.orderbook__element__right__body__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Tabs className="comdex-tabs" type="card" items={tabItems} />
          </div>
        </div>
      </div>
      <div
        className={`${styles.orderbook__table__view} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <Tabs className="order-tabs" type="card" items={orderItems} />
      </div>
    </div>
  );
};

OrderBook.propTypes = {
  address: PropTypes.string,
  assetMap: PropTypes.object,
  lang: PropTypes.string,
  markets: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
    assetMap: state.asset.map,
    lang: state.language,
    params: state.swap.params,
  };
};

export default connect(stateToProps)(OrderBook);
