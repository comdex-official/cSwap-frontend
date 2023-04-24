import { Tabs } from "antd";
import AxelarBridge from "./AxelarBridge";
import GravityBridge from "./GravityBridge";
import IbcTransfer from "./IbcTransfer";
import "./index.scss";

const items = [
  {
    key: '1',
    label: `IBC Transfer`,
    children: <IbcTransfer />,
  },
  {
    key: '2',
    label: `Gravity Bridge`,
    children: <GravityBridge />,
  },
  {
    key: '3',
    label: `Axelar Bridge`,
    children: <AxelarBridge />,
  },
];

const Bridge = () => {
  return (
    <div className="bridge-card">
      <h3 className="title">Bridge</h3>
      <Tabs type="card" defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Bridge;
