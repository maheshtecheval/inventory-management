import { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Pagination from 'react-bootstrap/Pagination';

const ITEMS_PER_PAGE = 10;

function PurchaseItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isNewItem, setIsNewItem] = useState(false); // New state to track if adding a new item
  const [purchases, setPurchases] = useState([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const PURCHASES_PER_PAGE = 10; // Number of purchase items per page
  const [currentPurchasePage, setCurrentPurchasePage] = useState(1);
  const sortItems = (order) => {
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (order === "asc") {
        return a.quantity - b.quantity;
      } else {
        return b.quantity - a.quantity;
      }
    });
    return sortedItems;
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  const sortedItems = sortItems(sortOrder);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items");
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch items");
      }
    };
     const fetchPurchases = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items/purchases");
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchItems();
    fetchPurchases();
  }, [purchases, items]);

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

  const handleAddNewPurchaseItems = (item) => {
    setCurrentItem(item);
    setIsNewItem(false); // Existing item, not new
    setShowModal(true);
  };

  const handleNewPurchase = () => {
    setCurrentItem({
      name: "",
      style: "",
      size: "",
      design: "",
      shed: "",
      quantity: 0,
      price: 0,
      unit: "",
      category: "",
      notes: "",
    });
    setIsNewItem(true); // New item
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentItem(null);
    setIsNewItem(false);
  };
  const handleTogglePurchases = () => {
    setShowPurchases(!showPurchases);
  };

  const handleModalSave = async () => {
    try {
      if (isNewItem) {
        // Save new item to both PurchaseItem and Item schemas
        const response = await fetch("http://localhost:5000/api/items/purchase/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentItem),
        });

        if (response.ok) {
          toast.success("New item added successfully!");
        } else {
          toast.error("Failed to add new item");
        }
      } else {
        // Save to PurchaseItem and update existing Item quantity
        const response = await fetch("http://localhost:5000/api/items/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentItem),
        });

        if (response.ok) {
          toast.success(
            "Purchase recorded and item quantity updated successfully!"
          );
        } else {
          toast.error("Failed to update item quantity");
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the purchase");
    }
  };

  const handleChange = (e) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  const purchaseStartIndex = (currentPurchasePage - 1) * PURCHASES_PER_PAGE;
  const currentPurchases = purchases.slice(
    purchaseStartIndex,
    purchaseStartIndex + PURCHASES_PER_PAGE
  );
  const handlePurchasePageChange = (page) => {
    setCurrentPurchasePage(page);
};
  
  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between mb-2">
        <Form.Control
          type="text"
          placeholder="Search..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button variant="warning" onClick={handleNewPurchase}>
          New
        </Button>
      </div>
      <div className="table-responsive custom-table-wrapper">
        <Table className="table table-hover align-middle table-bordered custom-table">
          <thead>
            <tr>
              <td>Sr NO</td>
              <th>Name</th>
              <th onClick={handleSort} style={{ cursor: "pointer" }}>
                Quantity {sortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th>Style</th>
              <th>Size</th>
              <th>Design</th>
              <th>Shed</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td
                  style={{
                    color:
                      item.quantity === 0
                        ? "red"
                        : item.quantity < 10
                        ? "orange"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  {item.quantity}
                </td>
                <td>{item.style}</td>
                <td>{item.size}</td>
                <td>{item.design}</td>
                <td>{item.shed}</td>
                <td>{item.price}</td>
                <td>{item.unit}</td>
                <td>{item.category}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleAddNewPurchaseItems(item)}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-center">
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

      <div className="d-flex justify-content-end">
        <Button variant="info" onClick={handleTogglePurchases}>
          {showPurchases ? "Hide" : "Show"} Purchase Data
        </Button>
      </div>

      {/* Purchase Data Table */}
      <div className="table-responsive custom-table-wrapper mt-4">
      <Table className="table table-hover align-middle table-bordered custom-table">
        <thead>
          <tr>
            <th>Sr NO</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Style</th>
            <th>Size</th>
            <th>Design</th>
            <th>Shed</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Notes</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentPurchases.map((purchase, index) => (
            <tr key={purchase._id}>
              <td>{purchaseStartIndex + index + 1}</td>
              <td>{purchase.name}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.style}</td>
              <td>{purchase.size}</td>
              <td>{purchase.design}</td>
              <td>{purchase.shed}</td>
              <td>{purchase.price}</td>
              <td>{purchase.unit}</td>
              <td>{purchase.category}</td>
              <td>{purchase.notes}</td>
              <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    {/* Pagination Controls for Purchases */}
    <div className="d-flex justify-content-center">
      <Pagination>
        {Array.from({ length: Math.ceil(purchases.length / PURCHASES_PER_PAGE) }).map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === currentPurchasePage}
            onClick={() => handlePurchasePageChange(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
      {/* Modal for editing item */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isNewItem ? "Add New Item" : "Edit Item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (
            <Form>
              <Form.Group className="mb-1" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={currentItem.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formStyle">
                <Form.Label>Style</Form.Label>
                <Form.Control
                  type="text"
                  name="style"
                  value={currentItem.style}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formSize">
                <Form.Label>Size</Form.Label>
                <Form.Control
                  type="text"
                  name="size"
                  value={currentItem.size}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formDesign">
                <Form.Label>Design</Form.Label>
                <Form.Control
                  type="text"
                  name="design"
                  value={currentItem.design}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formShed">
                <Form.Label>Shed</Form.Label>
                <Form.Control
                  type="text"
                  name="shed"
                  value={currentItem.shed}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={currentItem.price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formUnit">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  type="text"
                  name="unit"
                  value={currentItem.unit}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={currentItem.category}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formNotes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={currentItem.notes}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PurchaseItems;
