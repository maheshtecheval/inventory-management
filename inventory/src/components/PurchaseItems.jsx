import React, { useState, useEffect } from "react";
import axios from "axios";

function PurchaseItems() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [purchases, setPurchases] = useState([]);
  const [newPurchase, setNewPurchase] = useState({
    itemId: "",
    sizeId: "",
    designId: "",
    quantity: 0,
    price: 0,
  });
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items`);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePurchaseInputChange = (e, field) => {
    setNewPurchase({ ...newPurchase, [field]: e.target.value });
  };
  const handleNewPurchase = async (item) => {
    const updatedPurchase = { ...newPurchase, itemId: item._id };
    try {
      await axios.post(
        `http://localhost:5000/api/items/purchase/new`,
        updatedPurchase
      );

      const response = await axios.get(`http://localhost:5000/api/items`);
      setItems(response.data);    fetchPurchases();

    } catch (error) {
      console.error("Error making new purchase:", error);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [currentPage]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/items/purchasesitems`,
        {
          params: { page: currentPage, limit: 10 },
        }
      );
      setPurchases(response.data.purchases);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.itemId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-primary">Add New Item</button>
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Size</th>
            <th>Design</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase) => (
              <tr key={purchase._id}>
                <td>{purchase.itemId.name}</td>
                <td>{purchase.size.size}</td>
                <td>{purchase.design.design}</td>
                <td>{purchase.quantity}</td>
                <td>{purchase.price}</td>
                <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No purchases found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              <button className="page-link">{index + 1}</button>
            </li>
          ))}
        </ul>
      </nav>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Style</th>
            <th>Shed</th>
            <th>Price</th>
            <th>Size</th>
            <th>Designs</th>
            <th>Total Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.style}</td>
              <td>{item.shed}</td>
              <td>{item.price}</td>
              <td>
                {item.size.map((s) => (
                  <div key={s._id}>
                    {s.size} - {s.quantity}
                  </div>
                ))}
              </td>
              <td>
                {item.designs.map((d) => (
                  <div key={d._id}>
                    {d.design} - {d.quantity}
                  </div>
                ))}
              </td>
              <td>{item.totalQuantity}</td>
              <td>
                {/* New Purchase Form */}
                <div className="mb-2">
                  <label>Size:</label>
                  <select
                    value={newPurchase.sizeId}
                    onChange={(e) => handlePurchaseInputChange(e, "sizeId")}
                    className="form-select"
                  >
                    <option value="">Select Size</option>
                    {item.size.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label>Design:</label>
                  <select
                    value={newPurchase.designId}
                    onChange={(e) => handlePurchaseInputChange(e, "designId")}
                    className="form-select"
                  >
                    <option value="">Select Design</option>
                    {item.designs.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.design}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPurchase.quantity}
                    onChange={(e) => handlePurchaseInputChange(e, "quantity")}
                  />
                </div>
                <div className="mb-2">
                  <label>Price:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPurchase.price}
                    onChange={(e) => handlePurchaseInputChange(e, "price")}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleNewPurchase(item)}
                >
                  New Purchase
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseItems;
