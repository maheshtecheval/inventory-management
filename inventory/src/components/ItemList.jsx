import { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Row, Col, Card } from "react-bootstrap"; // Import necessary Bootstrap components
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
  const [showCaregory, setshowCaregory] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState([]);

  const showCaregorywise = () => {
    setshowCaregory(!showCaregory);
  };
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

  useEffect(() => {
    const fetchDashbordStats = async () => {
      const response = await fetch(
        "http://localhost:5000/api/items/dashboard-stats"
      );
      const statdata = await response.json();
      if (response.ok) {
        setData(statdata);
      }
    };
    fetchDashbordStats();
  }, []);
  console.log(data, 60);
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
  console.log(sortedItems);
  const handleItemSelect = (itemId, quantity) => {
    if (quantity > 0) {
      setSelectedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      toast.info("Item out of stock");
    }
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
  const currentItems = sortedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="container-fluid">
      <div className="container-fluid mt-2">
        {data.categoryWiseQuantity ? (
          <>
            <Row className="g-2" fluid>
              <Col md={2}>
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>Total Items</Card.Title>
                    <Card.Text>{data.totalItems}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={2}>
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>Total Quantity</Card.Title>
                    <Card.Text>{data.totalQuantity} </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>Highest Order Amount</Card.Title>
                    <Card.Text>
                      ₹{data.totalOrderAmount} | Highest Order: ₹
                      {data.highestOrderAmount}{" "}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <Card.Title>Highest Selling Item</Card.Title>
                    <Card.Text>
                      {data.highestSellItem._id} | Total Sold:{" "}
                      {data.highestSellItem.totalSold}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center m-1">
                  <Card.Body>
                    <Card.Text>
                      <Button
                        className="btn btn-info btn-sm m-2"
                        onClick={showCaregorywise}
                      >
                        {" "}
                        <i className="bi bi-eye"></i> Category Wise Quantity
                      </Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              {showCaregory ? (
                <>
                  {" "}
                  <Col md={12}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Category Wise Quantity</Card.Title>
                        <ul className="list-group list-group-flush">
                          {data.categoryWiseQuantity.map((category, index) => (
                            <li
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center list-group-item list-group-item-action list-group-item-primary"
                            >
                              <span>{category.category}</span>
                              <span>{category.totalQuantity}</span>
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              ) : (
                <></>
              )}
            </Row>{" "}
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="d-flex justify-content-center">
        <SearchBar onSearch={handleSearch} />{" "}
      </div>
      <div className="table-responsive custom-table-wrapper">
        <Table className="table table-hover align-middle table-bordered custom-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
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
            {currentItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleItemSelect(item._id, item.quantity)}
                  />
                </td>
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
