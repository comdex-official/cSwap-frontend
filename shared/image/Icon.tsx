import React from 'react';

interface IconProps {
  className: any;
  size?: any;
  id?: string;
  onClick?: () => void;
}

export const Icon = ({ className, size, onClick, id }: IconProps) => {
  return (
    <i
      className={className}
      style={{ fontSize: `${size}` }}
      onClick={onClick}
      id={id}
    />
  );
};
