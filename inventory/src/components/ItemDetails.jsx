import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const response = await fetch(`http://localhost:5000/api/items/${id}`);
      const data = await response.json();
      setItem(data);
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

  if (!item) return <p>Loading...</p>;

  return (
    <div className="mb-3">
      <h2>{item.name}</h2>
      <p>Style: {item.style}</p>
      <p>Size: {item.size}</p>
      <p>Design: {item.design}</p>
      <p>Shed: {item.shed}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Price: {item.price}</p>
      <p>Unit: {item.unit}</p>
      <p>Category: {item.category}</p>
      <button onClick={() => handleQuantityChange(1)}>Increase Quantity</button>
      <button onClick={() => handleQuantityChange(-1)}>
        Decrease Quantity
      </button>
      <button onClick={handleDelete}>Delete Item</button>
    </div>
  );
}

export default ItemDetails;
