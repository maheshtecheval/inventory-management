import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, Row, Col, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sizeId, setSizeId] = useState(null);
  const [designId, setDesignId] = useState(null);
  const [sizeQuantityChange, setSizeQuantityChange] = useState(0);
  const [designQuantityChange, setDesignQuantityChange] = useState(0);

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

  const handleSizeQuantityChange = async () => {
    if (!sizeId) {
      toast.error("Please select a size.");
      return;
    }
    const change = parseInt(sizeQuantityChange, 10);
    if (isNaN(change) || change === 0) return;

    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizeId, sizeQuantityChange: change }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItem(updatedItem);
        setSizeQuantityChange(0);
        toast.success("Size quantity updated successfully!");
      } else {
        throw new Error("Failed to update size quantity.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDesignQuantityChange = async () => {
    if (!designId) {
      toast.error("Please select a design.");
      return;
    }
    const change = parseInt(designQuantityChange, 10);
    if (isNaN(change) || change === 0) return;

    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, designQuantityChange: change }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItem(updatedItem);
        setDesignQuantityChange(0);
        toast.success("Design quantity updated successfully!");
      } else {
        throw new Error("Failed to update design quantity.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete the item.");
    }
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
                <strong>Size:</strong>
                <Form.Select onChange={(e) => setSizeId(e.target.value)}>
                  <option>Select Size</option>
                  {item.size.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.size} - {s.quantity} in stock
                    </option>
                  ))}
                </Form.Select>
              </Card.Text>
              <Card.Text>
                <strong>Design:</strong>
                <Form.Select onChange={(e) => setDesignId(e.target.value)}>
                  <option>Select Design</option>
                  {item.designs.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.design} - {d.quantity} in stock
                    </option>
                  ))}
                </Form.Select>
              </Card.Text>
              <Card.Text>
                <strong>Shed:</strong> {item.shed}
              </Card.Text>
            </Col>
            <Col md={6}>
              <Card.Text>
                <strong>Quantity In Stock:</strong> {item.totalQuantity}
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
                  value={sizeQuantityChange}
                  onChange={(e) => setSizeQuantityChange(e.target.value)}
                  placeholder="Enter quantity for size"
                />
              </Col>
              <Col md={6} className="text-center">
                <Button variant="success" onClick={handleSizeQuantityChange}>
                  Update Size Quantity
                </Button>
              </Col>
            </Row>
            <Row className="mt-3 align-items-center">
              <Col md={6}>
                <Form.Control
                  type="number"
                  value={designQuantityChange}
                  onChange={(e) => setDesignQuantityChange(e.target.value)}
                  placeholder="Enter quantity for design"
                />
              </Col>
              <Col md={6} className="text-center">
                <Button variant="primary" onClick={handleDesignQuantityChange}>
                  Update Design Quantity
                </Button>
              </Col>
            </Row>
            <Row className="mt-5">
              <Col md={12}>
                <div className="d-flex justify-content-between">
                  <Button variant="danger" onClick={handleDelete}>
                    <i className="bi bi-trash"></i> Delete Item
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
