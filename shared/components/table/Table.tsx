import { useMemo } from 'react';
import { useTable } from 'react-table';
import styles from './Table.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { No_Data } from '@/shared/image';

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
                <th
                  {...column.getHeaderProps()}
                  key={i}
                  className={`${data.length <= 0 && styles.not__data}`}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {data.length > 0 && (
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
        )}
      </table>

      {data.length <= 0 && (
        <div className={`${styles.table__empty__data__wrap}`}>
          <div className={`${styles.table__empty__data}`}>
            <NextImage src={No_Data} alt="Message" />
            <span>{'NO DATA'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
