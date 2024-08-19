import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

function OrderDetailsByID() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/order/${id}`
        );
        if (!response.ok) {
          throw new Error("Error fetching order details");
        }
        const data = await response.json();
        setOrder(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Order Details", 14, 20);

    // Adding customer details
    doc.setFontSize(12);
    doc.text(`Name: ${order.customerName || "N/A"}`, 14, 30);
    doc.text(`Mobile: ${order.mobile || "N/A"}`, 14, 40);
    doc.text(`Email: ${order.email || "N/A"}`, 14, 50);
    doc.text(`Address: ${order.address || "N/A"}`, 14, 60);
    doc.text(`Status: ${order.orderStatus || "N/A"}`, 14, 70);
    doc.text(
      `Order Date: ${
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
      }`,
      14,
      80
    );

    // Adding table
    const tableColumn = ["Item", "Price", "Quantity", "Total"];
    const tableRows = order.items.map((item) => [
      item.name || "N/A",
      `Rs ${item.price || "N/A"}`,
      item.quantity || "N/A",
      `Rs ${item.item_total_price || "N/A"}`,
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 90 });
    doc.text(
      `Total Amount: Rs ${order.totalAmount || "N/A"}`,
      14,
      doc.autoTable.previous.finalY + 10
    );

    doc.save("order-details.pdf");
  };

  const handleDelete = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
         toast.success('Delete order successfully...')
      } else {
        console.error("Failed to delete order");
        toast.error('Failed to delete order...')
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error('Failed to delete order...')
    }
  };

  if (!order) return <p>Loading...</p>;

  return (
    <Container className="mt-4" fluid>
      <Card>
        {/* <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button> */}

        <Card.Header as="h5">Order Details</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6>Customer Detail</h6>
              <p>
                <strong>Name:</strong> {order.customerName || "N/A"}
              </p>
              <p>
                <strong>Mobile:</strong> {order.mobile || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {order.email || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {order.address || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {order.orderStatus || "N/A"}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </Col>
            <Col md={8}>
              <h6>Order Summary</h6>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>{item.name || "N/A"}</td>
                        <td>₹{item.price ? item.price : "N/A"}</td>
                        <td>{item.quantity || "N/A"}</td>
                        <td>
                          ₹
                          {item.item_total_price
                            ? item.item_total_price
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <h5 className="mt-3">
                Total Amount: ₹{order.totalAmount ? order.totalAmount : "N/A"}
              </h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <div className="d-flex justify-content-center mt-5">
        <Button
          className="me-2"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <div>
          <Button
            variant="outline-primary"
            onClick={handlePrint}
            className="me-2"
          >
            Print
          </Button>
          <Button className="me-5" variant="outline-primary" onClick={handleDownload}>
            Download PDF
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(order._id)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default OrderDetailsByID;
