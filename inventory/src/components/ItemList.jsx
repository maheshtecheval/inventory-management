import { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap"; // Import necessary Bootstrap components
import SearchBar from "./SearchBar";
import OrderSummary from "./OrderSummary";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

function ItemList() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    try {
      const fetchItems = async () => {
        const response = await fetch("http://localhost:5000/api/items");
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      };
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  }, []);

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
    try {
      await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((item) => item._id !== id));
      setFilteredItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Delete Item successfully...");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentItem(null);
  };

  const handleModalSave = async () => {
    await fetch(`http://localhost:5000/api/items/${currentItem._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentItem),
    });
    setItems((prev) =>
      prev.map((item) =>
        item._id === currentItem._id ? { ...item, ...currentItem } : item
      )
    );
    setFilteredItems((prev) =>
      prev.map((item) =>
        item._id === currentItem._id ? { ...item, ...currentItem } : item
      )
    );
    handleModalClose();
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
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="container-fluid">
      <SearchBar onSearch={handleSearch} />
      <div className="table-responsive custom-table-wrapper">
        <Table className="table table-hover align-middle table-bordered custom-table">
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
              <th>Quant</th>
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
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleEdit(item)}
                  >
                    <i className="bi bi-pen"></i>
                  </button>
                  <button className="btn btn-info btn-sm me-2">
                    <Link to={`/item/${item._id}`}>
                      <i className="bi bi-eye"></i>
                    </Link>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    <i className="bi bi-trash"></i>
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

      <OrderSummary selectedItems={selectedItems} />

      {/* Modal for editing item */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
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

export default ItemList;
