import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const OrderSummary = ({ selectedItems }) => {
  const [showModal, setShowModal] = useState(false);
  const [showGenerateBill, setShowGenerateBill] = useState(false);
  const [items, setItems] = useState(selectedItems); // Store selectedItems in local state
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    mobile: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    setItems(selectedItems); // Initialize items when selectedItems changes
  }, [selectedItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (id, newQuantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.selectedDesignId === id
          ? { ...item, quantity: newQuantity, price: item.unitPrice * newQuantity }
          : item
      )
    );
  };

  const handlePriceChange = (id, newPrice) => {
    setItems((prev) =>
      prev.map((item) =>
        item.selectedDesignId === id ? { ...item, price: newPrice } : item
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
        items: items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          design: item.selectedDesign,
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

  const handleSubmitOnlyOrder = async () => {
    try {
      const orderData = {
        customerName: customerDetails.customerName,
        mobile: customerDetails.mobile,
        email: customerDetails.email,
        address: customerDetails.address,
        items: items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          design: item.selectedDesign,
        })),
      };
      const response = await fetch(
        "http://localhost:5000/api/orders/order-without-bill",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success("Order created successfully!");
        setShowGenerateBill(false);
        setShowModal(false);
      } else {
        toast.error(result.message || "Failed to create order.");
      }
    } catch (error) {
      console.error("Error in order creation:", error);
      toast.error("An error occurred while creating the order.");
    }
  };

  const showOrderDetails = () => {
    setShowModal(true);
    setShowGenerateBill(true);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div>
      <div className="d-flex justify-content-center mt-1">
        <Button className="btn btn-primary" onClick={showOrderDetails}>
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
                  />
                </Form.Group>
              </div>

              <h5 className="mt-2">Order Items</h5>
              <ul className="list-group list-group-flush">
                {items.map((item) => (
                  <li
                    key={`${item._id}-${item.selectedSize}-${item.selectedDesign}`}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="flex-grow-1">
                      <h6 className="mb-2">
                        {item.name} | {item.selectedSize} |{" "}
                        {item.selectedDesign} | {item.shed} | {item.style}
                      </h6>
                      <div className="d-flex flex-column flex-md-row align-items-center">
                        <div className="input-group mb-3 mb-md-0 me-md-3">
                          <span className="input-group-text">Quantity</span>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.selectedDesignId,
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="input-group mb-3 mb-md-0 me-md-3">
                          <span className="input-group-text">Price</span>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={item.price}
                            onChange={(e) =>
                              handlePriceChange(
                                item.selectedDesignId,
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      ₹ {item.quantity * item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </Form>
            <div className="d-flex justify-content-end mt-3">
              <h4>Total Amount: ₹ {totalAmount}</h4>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn btn-secondary me-2"
              onClick={handleSubmitOnlyOrder}
            >
              Submit Order Without Bill
            </Button>
            <Button className="btn btn-primary" onClick={handleSubmitOrder}>
              Generate Bill & Submit Order
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default OrderSummary;
