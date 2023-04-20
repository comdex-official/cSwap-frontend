import { Button, message, Table } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setLPPrices } from "../../actions/oracle";
import IconFromDenom from "../../components/common/IconFromDenom";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { fetchRestLPPrices } from "../../services/oracle/query";
import { denomConversion } from "../../utils/coin";
import { commaSeparator, formateNumberDecimalsAuto } from "../../utils/number";

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
      title: "Pool ID",
      dataIndex: "poolId",
      key: "asset",
      render: (value) => (
        <>
          <p>#{value}</p>
        </>
      ),
    },
    {
      title: "Liquidity Farming Pair",
      dataIndex: "pair",
      key: "pair",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      // align: "center",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
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

  const getLpTokens = (token) => {
    const lpAmount = balances.filter((item) => item.denom === token?.denom);
    return lpAmount[0]?.amount / 10 ** token?.exponent;
  };

  const showPairDenoms = (item) => {
    if (item?.asset_details?.base_asset?.denom) {
      return `${denomConversion(
        item?.asset_details?.base_asset?.denom
      )}/${denomConversion(item?.asset_details?.quote_asset?.denom)}`;
    }
  };

  let tableData =
    lpPrices &&
    lpPrices.map((item) => {
      return {
        key: item?.asset_details?.base_asset?.symbol,
        baseSymbol: item?.asset_details?.base_asset?.symbol,
        quoteSymbol: item?.asset_details?.quote_asset?.symbol,
        pair: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <IconFromDenom denom={item?.asset_details?.base_asset?.denom}/>
              </div>{" "}
              <div className="assets-icon asset-icon-reverse" style={{ marginLeft: "-18px" }}>
                <IconFromDenom denom={item?.asset_details?.quote_asset?.denom}/>
              </div>{" "}
              {showPairDenoms(item)}
            </div>
          </>
        ),
        poolId: item?.pool_id,
        price: item?.price,
        amount: getLpAmount(item),
        exponent: item?.exponent,
        noOfTokens: getLpTokens(item),
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
