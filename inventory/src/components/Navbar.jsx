import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const NavbarComponent = ({ onLogout }) => {

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Inventory</Navbar.Brand>
        <Nav className="mr-auto">
          <Link to="/" className="nav-link">Home</Link>
        </Nav>
        <Button variant="outline-light" onClick={onLogout}>Logout</Button>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
