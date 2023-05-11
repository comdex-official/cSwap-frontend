import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

const SvgIcon = ({
  name,
  viewbox,
  width,
  height,
  fill,
  className,
  onClick,
  ...attrs
}: any) => {
  const classes = classNames(className, 'icon');
  return (
    <svg
      className={classes}
      viewBox={viewbox}
      {...attrs}
      style={{ width: width, height: height, fill: fill }}
      onClick={onClick}
    >
      <use xlinkHref={'#' + name} />
    </svg>
  );
};

export default SvgIcon;
