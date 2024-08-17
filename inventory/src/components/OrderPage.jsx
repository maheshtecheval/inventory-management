import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    customerName: '',
    mobile: '',
    email: '',
    address: '',
    items: [id]
  });

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/orders/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="customerName"
        value={order.customerName}
        onChange={handleChange}
        placeholder="Customer Name"
        required
      />
      <input
        type="text"
        name="mobile"
        value={order.mobile}
        onChange={handleChange}
        placeholder="Mobile"
      />
      <input
        type="email"
        name="email"
        value={order.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type="text"
        name="address"
        value={order.address}
        onChange={handleChange}
        placeholder="Address"
        required
      />
      <button type="submit">Place Order</button>
    </form>
  );
}

export default OrderPage;
