import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, Row, Col, Spinner } from "react-bootstrap";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async () => {
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE",
    });
    navigate("/");
  };

  if (loading) return <Spinner animation="border" variant="primary" />;

  if (!item) return <p>Item not found.</p>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header as="h5">{item.name}</Card.Header>
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
          <div className="d-flex justify-content-between mt-3">
            <Button variant="primary" onClick={() => handleQuantityChange(1)}>
              + Quantity
            </Button>
            <Button
              variant="warning"
              onClick={() => handleQuantityChange(-1)}
              disabled={item.quantity <= 0}
            >
              - Quantity
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <i className="bi bi-trash"></i> item
            </Button>
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
