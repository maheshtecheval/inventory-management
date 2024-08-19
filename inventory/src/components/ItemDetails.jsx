import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, Row, Col, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantityChange, setQuantityChange] = useState(0);
  const [quantityChangeRemove, setquantityChangeRemove] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleQuantityChange = async (change) => {
    const updatedItem = { ...item, quantity: item.quantity + change };
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    setItem(updatedItem);
  };

  const handleBulkAddQuantityChange = async () => {
    const change = parseInt(quantityChange, 10);
    if (isNaN(change)) return;

    const updatedItem = { ...item, quantity: item.quantity + change };
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    setItem(updatedItem);
    setQuantityChange(0);
  };
  const handleBulkRemoveQuantityChange = async () => {
    const change = parseInt(quantityChangeRemove, 10);
    if (isNaN(change)) return;
    if (change > item.quantity) {
      toast.error("Inefficient quantity in Stock");
      return;
    }
    const updatedItem = { ...item, quantity: item.quantity - change };
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedItem),
    });
    setItem(updatedItem);
    setquantityChangeRemove(0);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE",
    });
    navigate("/");
  };

  if (loading) return <Spinner animation="border" variant="primary" />;

  if (!item) return <p>Item not found.</p>;

  return (
    <div className="container mt-4 fs-6">
      <Card>
        <Card.Header>
          <strong>Name: </strong> {item.name}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card.Text>
                <strong>Style:</strong> {item.style}
              </Card.Text>
              <Card.Text>
                <strong>Size:</strong> {item.size}
              </Card.Text>
              <Card.Text>
                <strong>Design:</strong> {item.design}
              </Card.Text>
              <Card.Text>
                <strong>Shed:</strong> {item.shed}
              </Card.Text>
            </Col>
            <Col md={6}>
              <Card.Text>
                <strong>Quantity In Stock:</strong> {item.quantity}
              </Card.Text>
              <Card.Text>
                <strong>Price:</strong> ₹ {item.price}
              </Card.Text>
              <Card.Text>
                <strong>Unit:</strong> {item.unit}
              </Card.Text>
              <Card.Text>
                <strong>Category:</strong> {item.category}
              </Card.Text>
            </Col>
          </Row>
          <div className="mt-3">
            <Row className="align-items-center">
              <Col md={6}>
                <Form.Control
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="Enter quantity"
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="d-flex justify-content-between mt-2">
                  <Button
                    variant="success"
                    onClick={handleBulkAddQuantityChange}
                  >
                    Bulck Add Quantity
                  </Button>
                </div>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Control
                  type="number"
                  value={quantityChangeRemove}
                  onChange={(e) => setquantityChangeRemove(e.target.value)}
                  placeholder="Enter quantity"
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="d-flex justify-content-between mt-2">
                  <Button
                    variant="primary"
                    onClick={handleBulkRemoveQuantityChange}
                  >
                    Bulck Remove Quantity
                  </Button>
                </div>
              </Col>
            </Row>
            <Row className="mt-5">
              <Col md={12} className="mt-5">
                <div className="d-flex justify-content-between">
                  <Button
                    variant="primary"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +1 Quantity
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={item.quantity <= 0}
                  >
                    -1 Quantity
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-center mt-5">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  );
}

export default ItemDetails;
