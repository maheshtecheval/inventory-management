import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
const OrderSummary = ({ selectedItems }) => {
  const [items, setItems] = useState(selectedItems);
  const [orderItems, setOrderItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateBill, setShowGenerateBill] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    mobile: "",
    email: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (id, newQuantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        customerName: customerDetails.customerName,
        mobile: customerDetails.mobile,
        email: customerDetails.email,
        address: customerDetails.address,
        items: orderItems.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          // item_total_price:item.price * item.quantity,
        })),
      };

      const response = await fetch(
        "http://localhost:5000/api/orders/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        if (result.pdfUrl) {
          window.open(result.pdfUrl, "_blank");
        }
        toast.success("Order created successfully!");
        setShowGenerateBill(false);
        setShowModal(false);
      } else {
        toast.error(result.message || "Failed to create order.");
      }
    } catch (error) {
      console.error("Error in bill generation:", error);
      toast.error("An error occurred while creating the order.");
    }
  };

  const handleCreateOrder = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/items/get-multiple",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedItems }),
        }
      );
      const data = await response.json();
      setOrderItems(data);
      setShowGenerateBill(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error in creating order:", error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-center mt-2">
        <Button className="btn btn-primary" onClick={handleCreateOrder}>
          Create Order
        </Button>
      </div>

      {showGenerateBill && (
        <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Enter Customer Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row mb-3">
                <Form.Group className="col-md-6" controlId="customerName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    placeholder="Customer Name"
                    value={customerDetails.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="col-md-6" controlId="mobile">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={customerDetails.mobile}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <div className="row mb-3">
                <Form.Group className="col-md-6" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={customerDetails.email}
                    onChange={handleInputChange}
                    // required
                  />
                </Form.Group>

                <Form.Group className="col-md-6" controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Home Address"
                    value={customerDetails.address}
                    onChange={handleInputChange}
                    // required
                  />
                </Form.Group>
              </div>

              <h5 className="mt-4">Order Items</h5>
              <ul className="list-group list-group-flush">
                {orderItems.map((item) => (
                  <li
                    key={item._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-1">
                        {item.name} | {item.size} | {item.design} | {item.shed}{" "}
                        | {item.style}
                      </h6>
                      <div className="input-group">
                        <span className="input-group-text">Quantity</span>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <span className="text-muted mt-3">
                      {item.quantity} x ₹ {item.price} = ₹
                      {item.quantity * item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmitOrder}>
              Generate Bill
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default OrderSummary;
