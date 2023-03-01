import { Table } from "antd";

const LPAsssets = ({ colums, data }) => {
  return (
    <Table
      className="custom-table assets-table"
      dataSource={data}
      columns={colums}
      pagination={false}
      scroll={{ x: "100%" }}
    />
  );
};

export default LPAsssets;
