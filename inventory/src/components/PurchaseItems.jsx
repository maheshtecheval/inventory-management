// src/components/PurchaseItems.js
import { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Pagination from 'react-bootstrap/Pagination';

const ITEMS_PER_PAGE = 10;
const PURCHASES_PER_PAGE = 10;

function PurchaseItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isNewItem, setIsNewItem] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const [currentPurchasePage, setCurrentPurchasePage] = useState(1);

  // Sorting function
  const sortItems = (order) => {
    const sorted = [...filteredItems].sort((a, b) => {
      if (order === "asc") {
        return a.totalQuantity - b.totalQuantity;
      } else {
        return b.totalQuantity - a.totalQuantity;
      }
    });
    return sorted;
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
        const response = await fetch("http://localhost:5000/api/purchases");
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch purchases");
      }
    };

    fetchItems();
    fetchPurchases();
  }, []); // Removed dependencies to prevent infinite loop

  // Search functionality
  const handleSearch = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.style.toLowerCase().includes(lowercasedQuery) ||
        item.category.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  // Handle adding a new purchase for an existing item
  const handleAddNewPurchaseItems = (item) => {
    setCurrentItem({
      ...item,
      sizeId: item.sizes.length > 0 ? item.sizes[0]._id : "",
      designId: item.designs.length > 0 ? item.designs[0]._id : "",
      quantity: 1, // Default quantity
    });
    setIsNewItem(false);
    setShowModal(true);
  };

  // Handle creating a new item via purchase
  const handleNewPurchase = () => {
    setCurrentItem({
      name: "",
      style: "",
      size: "",
      sizeId: "",
      design: "",
      designId: "",
      shed: "",
      quantity: 0,
      price: 0,
      unit: "",
      category: "",
      notes: "",
    });
    setIsNewItem(true);
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

  // Save changes from the modal
  const handleModalSave = async () => {
    try {
      if (isNewItem) {
        // Validate required fields
        if (!currentItem.name || !currentItem.sizeId || !currentItem.designId || currentItem.quantity <= 0) {
          toast.error("Please fill in all required fields with valid data.");
          return;
        }

        // Save new item to both PurchaseItem and Item schemas
        const response = await fetch("http://localhost:5000/api/purchases/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentItem),
        });

        if (response.ok) {
          toast.success("New item added successfully!");
          const newItem = await response.json();
          // Optionally, update local state
          setItems([...items, newItem.purchase]);
          setFilteredItems([...filteredItems, newItem.purchase]);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to add new item");
        }
      } else {
        // Save to PurchaseItem and update existing Item quantity
        const response = await fetch("http://localhost:5000/api/purchases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: currentItem._id,
            sizeId: currentItem.sizeId,
            designId: currentItem.designId,
            quantity: currentItem.quantity,
          }),
        });

        if (response.ok) {
          toast.success("Purchase recorded and item quantity updated successfully!");
          const updatedPurchase = await response.json();
          // Optionally, update local state
          setPurchases([...purchases, updatedPurchase.purchase]);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to update item quantity");
        }
      }
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the purchase");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === "quantity" ? parseInt(value, 10) : value,
    });
  };

  // Handle pagination
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
      {/* Search and New Purchase Button */}
      <div className="d-flex justify-content-between mb-2">
        <Form.Control
          type="text"
          placeholder="Search by Name, Style, or Category..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button variant="warning" onClick={handleNewPurchase}>
          New Purchase
        </Button>
      </div>

      {/* Items Table */}
      <div className="table-responsive custom-table-wrapper">
        <Table className="table table-hover align-middle table-bordered custom-table">
          <thead>
            <tr>
              <th>Sr NO</th>
              <th>Name</th>
              <th onClick={handleSort} style={{ cursor: "pointer" }}>
                Quantity {sortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th>Style</th>
              <th>Sizes</th>
              <th>Designs</th>
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
                <td>{startIndex + index + 1}</td>
                <td>{item.name}</td>
                <td
                  style={{
                    color:
                      item.totalQuantity === 0
                        ? "red"
                        : item.totalQuantity < 10
                        ? "orange"
                        : "green",
                    fontWeight: "bold",
                  }}
                >
                  {item.totalQuantity}
                </td>
                <td>{item.style}</td>
                <td>
                  {item.size.map((s) => (
                    <div key={s._id}>
                      {s.size}: {s.quantity}
                    </div>
                  ))}
                </td>
                <td>
                  {item.designs.map((d) => (
                    <div key={d._id}>
                      {d.design}: {d.quantity}
                    </div>
                  ))}
                </td>
                <td>{item.shed}</td>
                <td>₹ {item.price}</td>
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

      {/* Pagination for Items */}
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

      {/* Toggle Purchase Data */}
      <div className="d-flex justify-content-end mt-3">
        <Button variant="info" onClick={handleTogglePurchases}>
          {showPurchases ? "Hide" : "Show"} Purchase Data
        </Button>
      </div>

      {/* Purchase Data Table */}
      {showPurchases && (
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
                  <td>{purchase.itemId.name}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.itemId.style}</td>
                  <td>{purchase.sizeId.size}</td>
                  <td>{purchase.designId.design}</td>
                  <td>{purchase.itemId.shed}</td>
                  <td>₹ {purchase.price}</td>
                  <td>{purchase.unit}</td>
                  <td>{purchase.category}</td>
                  <td>{purchase.notes}</td>
                  <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination for Purchases */}
      {showPurchases && (
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
      )}

      {/* Modal for Adding/Editing Purchases */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isNewItem ? "Add New Purchase" : "Record Purchase"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (
            <Form>
              {/* Name */}
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={currentItem.name}
                  onChange={handleChange}
                  disabled={!isNewItem}
                />
              </Form.Group>

              {/* Style */}
              <Form.Group className="mb-3" controlId="formStyle">
                <Form.Label>Style *</Form.Label>
                <Form.Control
                  type="text"
                  name="style"
                  value={currentItem.style}
                  onChange={handleChange}
                  disabled={!isNewItem}
                />
              </Form.Group>

              {/* Shed */}
              <Form.Group className="mb-3" controlId="formShed">
                <Form.Label>Shed *</Form.Label>
                <Form.Control
                  type="text"
                  name="shed"
                  value={currentItem.shed}
                  onChange={handleChange}
                  disabled={!isNewItem}
                />
              </Form.Group>

              {/* Size Selection */}
              {isNewItem ? (
                <Form.Group className="mb-3" controlId="formSize">
                  <Form.Label>Size *</Form.Label>
                  <Form.Control
                    type="text"
                    name="size"
                    value={currentItem.size}
                    onChange={handleChange}
                    placeholder="Enter size (e.g., Small, Medium)"
                  />
                </Form.Group>
              ) : (
                <Form.Group className="mb-3" controlId="formSizeId">
                  <Form.Label>Select Size *</Form.Label>
                  <Form.Select
                    name="sizeId"
                    value={currentItem.sizeId}
                    onChange={handleChange}
                  >
                    {currentItem.sizes.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.size} - {s.quantity} in stock
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Design Selection */}
              {isNewItem ? (
                <Form.Group className="mb-3" controlId="formDesign">
                  <Form.Label>Design *</Form.Label>
                  <Form.Control
                    type="text"
                    name="design"
                    value={currentItem.design}
                    onChange={handleChange}
                    placeholder="Enter design description"
                  />
                </Form.Group>
              ) : (
                <Form.Group className="mb-3" controlId="formDesignId">
                  <Form.Label>Select Design *</Form.Label>
                  <Form.Select
                    name="designId"
                    value={currentItem.designId}
                    onChange={handleChange}
                  >
                    {currentItem.designs.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.design} - {d.quantity} in stock
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Quantity */}
              <Form.Group className="mb-3" controlId="formQuantity">
                <Form.Label>Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleChange}
                  min="1"
                />
              </Form.Group>

              {/* Price */}
              {isNewItem && (
                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={currentItem.price}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              )}

              {/* Unit */}
              {isNewItem && (
                <Form.Group className="mb-3" controlId="formUnit">
                  <Form.Label>Unit *</Form.Label>
                  <Form.Control
                    type="text"
                    name="unit"
                    value={currentItem.unit}
                    onChange={handleChange}
                    placeholder="e.g., pcs, kg"
                  />
                </Form.Group>
              )}

              {/* Category */}
              {isNewItem && (
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={currentItem.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                  />
                </Form.Group>
              )}

              {/* Notes */}
              {isNewItem && (
                <Form.Group className="mb-3" controlId="formNotes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={currentItem.notes}
                    onChange={handleChange}
                  />
                </Form.Group>
              )}
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
