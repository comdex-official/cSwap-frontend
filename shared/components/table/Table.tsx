import { useMemo } from 'react';
import { useTable } from 'react-table';
import styles from './Table.module.scss';

interface TableProps {
  columns: any;
  data: any;
}

const Table = ({ columns, data }: TableProps) => {
  const columnsData = useMemo(() => columns, [columns]);
  const body = useMemo(() => data, [data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: columnsData, data: body });

  return (
    <div className={`${styles.table__wrap}`}>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, i) => (
                <th {...column.getHeaderProps()} key={i}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={i}>
                {row.cells.map((cell, i) => {
                  return (
                    <td {...cell.getCellProps()} key={i}>
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
