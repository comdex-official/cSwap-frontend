import { Button, message, Table } from "antd";
import * as PropTypes from "prop-types";
import { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setLPPrices } from "../../actions/oracle";
import { SvgIcon } from "../../components/common";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { fetchRestLPPrices } from "../../services/oracle/query";
import { denomConversion } from "../../utils/coin";
import { commaSeparator, formateNumberDecimalsAuto } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";

const LPAsssets = ({
  balances,
  setLPPrices,
  lpPrices,
  isHideToggleOn,
  searchKey,
  activeKey,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    getLpPrices();
  }, []);

  const lpColumns = [
    {
      title: "Base Asset",
      dataIndex: "baseAsset",
      key: "baseAsset",
    },
    {
      title: "Quote Asset",
      dataIndex: "quoteAsset",
      key: "quoteAsset",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "left",
      width: 150,
      render: (price) => (
        <>
          <p className="text-left">
            ${formateNumberDecimalsAuto({ price: Number(price) || 0 })}
          </p>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "left",
      render: (amount) => (
        <>
          <p>${commaSeparator(Number(amount || 0).toFixed(DOLLAR_DECIMALS))}</p>
        </>
      ),
    },
    {
      title: "Farm",
      dataIndex: "farm",
      key: "farm",
      align: "left",
      // width: 210,
      render: (item) => (
        <Button
          type="primary"
          onClick={() => navigate(`/farm/${Number(item?.pool_id)}/#farm`)}
          size="small"
        >
          Farm
        </Button>
      ),
    },
    {
      title: "Unfarm",
      dataIndex: "unfarm",
      key: "unfarm",
      width: 110,
      render: (item) => (
        <Button
          type="primary"
          onClick={() => navigate(`/farm/${Number(item?.pool_id)}/#unfarm`)}
          size="small"
        >
          Unfarm
        </Button>
      ),
    },
  ];

  const getLpPrices = () => {
    fetchRestLPPrices((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setLPPrices(result.data);
    });
  };

  const getLpAmount = (token) => {
    const lpAmount = balances.filter((item) => item.denom === token?.denom);
    return (lpAmount[0]?.amount / 10 ** token?.exponent) * token?.price || 0;
  };

  let tableData =
    lpPrices &&
    lpPrices.map((item) => {
      return {
        key: item?.asset_details?.base_asset?.symbol,
        baseSymbol: item?.asset_details?.base_asset?.symbol,
        quoteSymbol: item?.asset_details?.base_asset?.symbol,
        baseAsset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    item?.asset_details?.base_asset?.denom
                  )}
                />
              </div>{" "}
              {denomConversion(item?.asset_details?.base_asset?.denom)}{" "}
            </div>
          </>
        ),
        quoteAsset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    item?.asset_details?.quote_asset?.denom
                  )}
                />
              </div>{" "}
              {denomConversion(item?.asset_details?.quote_asset?.denom)}{" "}
            </div>
          </>
        ),
        price: item?.price,
        amount: getLpAmount(item),
        exponent: item?.exponent,
        denom: item?.denom,
        farm: item,
        unfarm: item,
      };
    });

  tableData =
    searchKey && activeKey === "2"
      ? tableData?.filter((item) => {
          return (
            item?.baseSymbol
              ?.toLowerCase()
              .includes(searchKey?.toLowerCase()) ||
            item?.quoteSymbol?.toLowerCase().includes(searchKey?.toLowerCase())
          );
        })
      : tableData;

  tableData =
    isHideToggleOn && activeKey === "2"
      ? tableData?.filter((item) => getLpAmount(item) > 0)
      : tableData;

  console.log("the data", tableData);
  return (
    <Table
      className="custom-table assets-table"
      dataSource={tableData}
      columns={lpColumns}
      pagination={false}
      scroll={{ x: "100%" }}
    />
  );
};

LPAsssets.propTypes = {
  activeKey: PropTypes.string,
  isHideToggleOn: PropTypes.bool,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  lpPrices: PropTypes.object,
  searchKey: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lpPrices: state.oracle.lpPrice.list,
    balances: state.account.balances.list,
  };
};

const actionsToProps = {
  setLPPrices,
};

export default connect(stateToProps, actionsToProps)(LPAsssets);
