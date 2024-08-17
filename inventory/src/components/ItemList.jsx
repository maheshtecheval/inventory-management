import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";
import OrderSummary from "./OrderSummary";

const ITEMS_PER_PAGE = 10;

function ItemList() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
//   const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch("http://localhost:5000/api/items");
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    };
    fetchItems();
  }, []);

  console.log(selectedItems, 23);

  const handleSearch = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.style.toLowerCase().includes(lowercasedQuery) ||
        item.size.toLowerCase().includes(lowercasedQuery) ||
        item.category.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredItems.map((item) => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((item) => item._id !== id));
    setFilteredItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const handleGenerateBill = async () => {
    // Logic to generate bill and create an order
    console.log("Order Items:", orderItems);
    // You can send the orderItems to the backend to create the order
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {/* <button className="btn btn-primary" onClick={handleCreateOrder}>Create Order</button> */}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th>Name</th>
            <th>Style</th>
            <th>Size</th>
            <th>Design</th>
            <th>Shed</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleItemSelect(item._id)}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.style}</td>
              <td>{item.size}</td>
              <td>{item.design}</td>
              <td>{item.shed}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.unit}</td>
              <td>{item.category}</td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                {/* <Link to={`/order/${item._id}`}>Add to Order</Link> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <nav aria-label="Page navigation">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>

            {Array.from(
              { length: Math.ceil(filteredItems.length / ITEMS_PER_PAGE) },
              (_, i) => (
                <li
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  key={i}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            )}

            <li
              className={`page-item ${
                currentPage === Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
                  ? "disabled"
                  : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <OrderSummary selectedItems={selectedItems} />

      {/* <div>
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
        {orderItems.length > 0 && (
          <button onClick={handleGenerateBill}>Generate Bill</button>
        )}
      </div> */}
    </div>
  );
}

export default ItemList;
