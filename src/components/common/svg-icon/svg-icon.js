import PropTypes from "prop-types";
import React from "react";
import classNames from "classnames";

const SvgIcon = ({
  name,
  viewbox,
  width,
  height,
  fill,
  className,
  onClick,
  ...attrs
}) => {
  const classes = classNames(className, "icon");
  return (
    <>
      <svg
        className={classes}
        viewBox={viewbox}
        {...attrs}
        style={{ width: width, height: height, fill: fill }}
        onClick={onClick}
      >
        <use xlinkHref={"#" + name} />
      </svg>
    </>
  );
};

SvgIcon.propTypes = {
  /**
   * Icon Id name for svg sprite.
   */
  name: PropTypes.string,
  className: PropTypes.string,
  /**
   * Icon color.
   */
  fill: PropTypes.string,
  /**
   * Icon height.
   */
  height: PropTypes.string,
  /**
   * Svg icon viewBox value.
   */
  viewbox: PropTypes.string,
  /**
   * Icon width.
   */
  width: PropTypes.string,
  /**
   * Icon onClick handler.
   */
  onClick: PropTypes.func,
};

export default SvgIcon;
