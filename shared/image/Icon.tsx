import React from 'react';

interface IconProps {
  className: any;
  size?: any;
  onClick?: () => void;
}

export const Icon = ({ className, size, onClick }: IconProps) => {
  return (
    <i
      className={className}
      style={{ fontSize: `${size}` }}
      onClick={onClick}
    />
  );
};
