import "./index.scss";
import * as PropTypes from "prop-types";
import { Button } from "antd";
import { Col, Row } from "../common";
import { Link } from "react-router-dom";
import React from "react";

const Header = (props) => {
  return (
    <div className="page-heading-wrapper">
      <Row className="page-heading">
        <Col>
          <h2>
            {props.title}
            {props.description && <span>{props.description}</span>}
          </h2>
        </Col>
        {props.links && props.links.length > 0 && (
          <Col>
            <div className="link-buttons">
              {props.links.map((item) => (
                <Link key={item.name} to={item.route}>
                  <Button className="ml-2" size="small">
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

Header.propTypes = {
  description: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      route: PropTypes.string,
    })
  ),
  title: PropTypes.string,
};

export default Header;
