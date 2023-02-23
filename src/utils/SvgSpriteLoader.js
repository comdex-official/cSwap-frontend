import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

const SvgSprite = (props) => {
  const [svg, setSvg] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isErrored, setIsErrored] = useState(false);

  useEffect(() => {
    const svgVersion = "1.5.2";
    const isLocalStorage =
      "localStorage" in window && window.localStorage !== null;
    let data;
    if (isLocalStorage && localStorage.getItem("inlineSVGrev") === svgVersion) {
      data = localStorage.getItem("inlineSVGdata");
      setSvg(data);
      setIsLoaded(true);
    } else {
      fetch(props.url)
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error("Network response was not ok.");
        })
        .then(function (data) {
          if (data !== undefined) {
            if (isLocalStorage) {
              localStorage.setItem("inlineSVGdata", data);
              localStorage.setItem("inlineSVGrev", svgVersion);
            }
            setSvg(data);
          }
        })
        .catch(setIsErrored)
        .then(() => setIsLoaded(true));
    }
  }, [props.url]);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: svg }}
      className={`svgInline svgInline--${isLoaded ? "loaded" : "loading"} ${
        isErrored ? "svgInline--errored" : ""
      }`}
    />
  );
};

SvgSprite.propTypes = {
  url: PropTypes.any,
};

export default SvgSprite;
