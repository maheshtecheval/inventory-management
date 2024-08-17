import { useState } from "react";

const OrderSummary = ({ selectedItems }) => {
  const [items, setItems] = useState(selectedItems);
  const [orderItems, setOrderItems] = useState([]);

  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + delta } : item
      )
    );
  };

  const handleSubmitOrder = async () => {
    const customerName = prompt("Enter customer name:");
    const mobile = prompt("Enter mobile number:");
    const email = prompt("Enter email:");
    const address = prompt("Enter address:");

    const orderData = {
      customerName,
      mobile,
      email,
      address,
      items: orderItems.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
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
    if (result.pdfUrl) {
      window.open(result.pdfUrl, "_blank");
    }
  };

  const handleIncreaseQuantity = (itemId) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  const handleCreateOrder = async () => {
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
  };

  return (
    <div>
      <h3>Order Summary</h3>
      <div>
        <button className="btn btn-primary" onClick={handleCreateOrder}>
          Create Order
        </button>

        <h3>Selected Items</h3>
        {orderItems.map((item) => (
          <div key={item._id} className="order-item">
            <h4>{item.name}</h4>
            <p>Quantity: {item.quantity}</p>
            <button onClick={() => handleIncreaseQuantity(item._id)}>
              Increase Quantity
            </button>
            <button onClick={() => handleDecreaseQuantity(item._id)}>
              Decrease Quantity
            </button>
          </div>
        ))}
      </div>
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name} - {item.quantity} x {item.price} ={" "}
            {item.quantity * item.price}
            <button onClick={() => handleQuantityChange(item._id, 1)}>+</button>
            <button
              onClick={() => handleQuantityChange(item._id, -1)}
              disabled={item.quantity === 1}
            >
              -
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmitOrder}>Generate Bill</button>
    </div>
  );
};

export default OrderSummary;
