import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Row,
  Col,
  Card,
  InputGroup,
  FormControl,
} from "react-bootstrap"; // Import necessary Bootstrap components
import SearchBar from "./SearchBar";
import OrderSummary from "./OrderSummary";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;
// Helper function to calculate total quantity

function ItemList() {
  const [currentItem, setCurrentItem] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategory, setShowCategory] = useState(false);

  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedDesigns, setSelectedDesigns] = useState({});

  const showCategoryWise = () => {
    setShowCategory(!showCategory);
  };

  console.log("selectedItems", selectedItems);
  console.log("filteredItems", filteredItems);

  const sortItems = (order) => {
    return [...filteredItems].sort((a, b) => {
      if (order === "asc") {
        return a.totalQuantity - b.totalQuantity;
      } else {
        return b.totalQuantity - a.totalQuantity;
      }
    });
  };

  const handleSort = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
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
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/items/dashboard-stats"
        );
        const statdata = await response.json();
        setData(statdata);
        console.log(statdata, 78);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDashboardStats();
  }, []);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allSelectableItems = filteredItems
        .filter((item) => item.totalQuantity > 0)
        .map((item) => item._id);
      setSelectedItems(allSelectableItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleItemSelect = (itemId, totalQuantity) => {
    if (totalQuantity > 0) {
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
      toast.success("Item deleted successfully...");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    const totalQuantity = calculateTotalQuantity(item.size, item.designs);
    setCurrentItem({ ...item, totalQuantity });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentItem(null);
  };

  const handleModalSave = async (currentItem) => {
    try {
      await fetch(`http://localhost:5000/api/items/${currentItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem),
      });
      setItems((prev) =>
        prev.map((item) => (item._id === currentItem._id ? currentItem : item))
      );
      setFilteredItems((prev) =>
        prev.map((item) => (item._id === currentItem._id ? currentItem : item))
      );
      handleModalClose();
      toast.success("Item updated successfully...");
    } catch (error) {
      toast.error("Error updating item");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...currentItem.size];
    const oldQuantity = newSizes[index].quantity || 0;
    const newQuantity = field === "quantity" ? Number(value) : oldQuantity;

    newSizes[index] = { ...newSizes[index], [field]: value };

    const quantityDifference = newQuantity - oldQuantity;

    setCurrentItem((prevItem) => ({
      ...prevItem,
      size: newSizes,
      totalQuantity: prevItem.totalQuantity + quantityDifference,
    }));
  };

  const handleDesignChange = (index, field, value) => {
    const newDesigns = [...currentItem.designs];
    const oldQuantity = newDesigns[index].quantity || 0;
    const newQuantity = field === "quantity" ? Number(value) : oldQuantity;

    newDesigns[index] = { ...newDesigns[index], [field]: value };

    const quantityDifference = newQuantity - oldQuantity;

    setCurrentItem((prevItem) => ({
      ...prevItem,
      designs: newDesigns,
      totalQuantity: prevItem.totalQuantity + quantityDifference,
    }));
  };

  const addSize = () => {
    setCurrentItem((prevItem) => ({
      ...prevItem,
      size: [...prevItem.size, { size: "", quantity: 0 }],
    }));
  };

  const addDesign = () => {
    setCurrentItem((prevItem) => ({
      ...prevItem,
      designs: [...prevItem.designs, { design: "", quantity: 0 }],
    }));
  };

  const removeSize = (index) => {
    const newSizes = currentItem.size.filter((_, i) => i !== index);
    setCurrentItem((prevItem) => ({
      ...prevItem,
      size: newSizes,
      totalQuantity: calculateTotalQuantity(newSizes, currentItem.designs),
    }));
  };

  const removeDesign = (index) => {
    const newDesigns = currentItem.designs.filter((_, i) => i !== index);
    setCurrentItem((prevItem) => ({
      ...prevItem,
      designs: newDesigns,
      totalQuantity: calculateTotalQuantity(currentItem.size, newDesigns),
    }));
  };

  const calculateTotalQuantity = (sizes, designs) => {
    const sizeTotal = sizes.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    const designTotal = designs.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    return sizeTotal + designTotal;
  };

  const handleSizeChangeForTable = (itemId, value) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleDesignChangeForTable = (itemId, value) => {
    setSelectedDesigns((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleAddItemWithSizeDesign = (item) => {
    const selectedSize = selectedSizes[item._id];
    const selectedDesign = selectedDesigns[item._id];

    // Check if both size and design are selected
    if (!selectedSize || !selectedDesign) {
      toast.info("Please select both size and design.");
      return;
    }

    // Find the selected size and design details from the item
    const sizeDetails = item.size.find((size) => size._id === selectedSize);
    const designDetails = item.designs.find(
      (design) => design._id === selectedDesign
    );

    if (!sizeDetails || !designDetails) {
      toast.info("Invalid size or design selection.");
      return;
    }

    // Add the item with all sizes and designs (but only selected size and design for display)
    const updatedSelectedItem = {
      ...item,
      selectedSize: sizeDetails.size,
      selectedSizeId: sizeDetails._id, // Storing ID for reference
      selectedDesign: designDetails.design,
      selectedDesignId: designDetails._id, // Storing ID for reference
      quantity: 1, // Default quantity (you can adjust this as needed)
    };

    setSelectedItems((prev) => [
      ...prev, // Prevent duplicates
      updatedSelectedItem,
    ]);

    toast.success("Item added with selected size and design!");
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );
  console.log(selectedItems);

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
                        onClick={showCategoryWise}
                      >
                        {" "}
                        <i className="bi bi-eye"></i> Category Wise Quantity
                      </Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              {showCategory ? (
                <>
                  {" "}
                  <Col md={12}>
                    <Card className="shadow-sm">
                      <Card.Header className="bg-primary text-white">
                        <Card.Title className="mb-0 text-center ">
                          Category Wise Quantity
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <div className="accordion" id="categoryAccordion">
                          {data.categoryWiseQuantity.map((category, index) => (
                            <div key={index} className="accordion-item mb-3">
                              <h2
                                className="accordion-header"
                                id={`heading-${index}`}
                              >
                                <button
                                  className="accordion-button bg-success text-white d-flex justify-content-around align-items-center"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse-${index}`}
                                  aria-expanded="true"
                                  aria-controls={`collapse-${index}`}
                                >
                                  <div className="me-auto">
                                    <strong>{category.category}</strong>
                                  </div>
                                  <span className="badge bg-light text-dark ms-2">
                                    {category.totalQuantity}
                                  </span>
                                </button>
                              </h2>
                              <div
                                id={`collapse-${index}`}
                                className="accordion-collapse collapse show"
                                aria-labelledby={`heading-${index}`}
                                data-bs-parent="#categoryAccordion"
                              >
                                <div className="accordion-body bg-light p-3">
                                  {/* Display sizes */}
                                  <div className="mb-4">
                                    <h6 className="text-primary fw-bold">
                                      Sizes
                                    </h6>
                                    <div className="table-responsive">
                                      <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-secondary">
                                          <tr>
                                            <th style={{ width: "50%" }}>
                                              Size
                                            </th>
                                            <th style={{ width: "50%" }}>
                                              Quantity
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {category.sizes.map((sizeArray) =>
                                            sizeArray.map((size, sIndex) => (
                                              <tr key={sIndex}>
                                                <td>{size.size}</td>
                                                <td>{size.quantity}</td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Display designs */}
                                  <div>
                                    <h6 className="text-primary fw-bold">
                                      Designs
                                    </h6>
                                    <div className="table-responsive">
                                      <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-secondary">
                                          <tr>
                                            <th style={{ width: "50%" }}>
                                              Design
                                            </th>
                                            <th style={{ width: "50%" }}>
                                              Quantity
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {category.designs.map((designArray) =>
                                            designArray.map(
                                              (design, dIndex) => (
                                                <tr key={dIndex}>
                                                  <td>{design.design}</td>
                                                  <td>{design.quantity}</td>
                                                </tr>
                                              )
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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

      {/* Search Bar */}
      <div className="d-flex justify-content-center">
        <SearchBar onSearch={handleSearch} />{" "}
      </div>

      {/* Item Table */}
      <div className="table-responsive custom-table-wrapper">
        <Table className="table table-hover align-middle table-bordered custom-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedItems.length ===
                    filteredItems.filter((item) => item.totalQuantity > 0)
                      .length
                  }
                />
              </th>
              <th>Name</th>
              <th onClick={handleSort} style={{ cursor: "pointer" }}>
                totalQuantity {sortOrder === "asc" ? "▲" : "▼"}
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
                    onChange={() =>
                      handleItemSelect(item._id, item.totalQuantity)
                    }
                  />
                </td>
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
                  <Form.Select
                    value={selectedSizes[item._id] || ""}
                    onChange={(e) =>
                      handleSizeChangeForTable(item._id, e.target.value)
                    }
                  >
                    <option>Select Size</option>
                    {item.size.map((sizeOption, index) => (
                      <option key={index} value={sizeOption._id || sizeOption}>
                        {sizeOption.size || sizeOption}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Form.Select
                    value={selectedDesigns[item._id] || ""}
                    onChange={(e) =>
                      handleDesignChangeForTable(item._id, e.target.value)
                    }
                  >
                    <option>Select Design</option>
                    {item.designs.map((designOption, index) => (
                      <option
                        key={index}
                        value={designOption._id || designOption}
                      >
                        {designOption.design || designOption}
                      </option>
                    ))}
                  </Form.Select>
                </td>
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
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleAddItemWithSizeDesign(item)}
                  >
                    <i class="bi bi-cart"></i>
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

      {/* Pagination */}
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
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                {currentItem?.size.map((size, index) => (
                  <div key={index} className="mb-2">
                    <InputGroup>
                      <FormControl
                        value={size.size}
                        onChange={(e) =>
                          handleSizeChange(index, "size", e.target.value)
                        }
                      />
                      <FormControl
                        type="number"
                        value={size.quantity}
                        onChange={(e) =>
                          handleSizeChange(index, "quantity", e.target.value)
                        }
                      />
                      <Button
                        variant="danger"
                        onClick={() => removeSize(index)}
                      >
                        Remove
                      </Button>
                    </InputGroup>
                  </div>
                ))}
                <Button onClick={addSize}>Add Size</Button>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Design</Form.Label>
                {currentItem?.designs.map((design, index) => (
                  <div key={index} className="mb-2">
                    <InputGroup>
                      <FormControl
                        value={design.design}
                        onChange={(e) =>
                          handleDesignChange(index, "design", e.target.value)
                        }
                      />
                      <FormControl
                        type="number"
                        value={design.quantity}
                        onChange={(e) =>
                          handleDesignChange(index, "quantity", e.target.value)
                        }
                      />
                      <Button
                        variant="danger"
                        onClick={() => removeDesign(index)}
                      >
                        Remove
                      </Button>
                    </InputGroup>
                  </div>
                ))}
                <Button onClick={addDesign}>Add Design</Button>
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
              <Form.Group className="mb-1" controlId="formTotalQuantity">
                <Form.Label>Total Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="totalQuantity"
                  value={calculateTotalQuantity(
                    currentItem.size,
                    currentItem.designs
                  )}
                  readOnly
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
          <Button
            variant="primary"
            onClick={() => handleModalSave(currentItem)}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Show Category Wise Items */}
      <div className="d-flex justify-content-end">
        <Button variant="link" onClick={showCategoryWise}>
          Show Caregory Wise Items
        </Button>
      </div>

      {/* Order Summary */}
      {selectedItems.length > 0 && (
        <OrderSummary
          selectedItems={selectedItems}
          // setSelectedItems={setSelectedItems}
          selectedSizes={selectedSizes}
          selectedDesigns={selectedDesigns}
        />
      )}
    </div>
  );
}

export default ItemList;
