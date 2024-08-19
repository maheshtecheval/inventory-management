import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-3">
      <Container>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">
              © {new Date().getFullYear()} ABC Company. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
