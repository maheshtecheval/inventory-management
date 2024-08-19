import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Container,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  // Fetch paginated orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const data = await response.json();

        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []); // Default to the fetched orders initially
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [currentPage]);

  // Fetch filtered orders
  useEffect(() => {
    const fetchFilteredOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/search?query=${searchQuery}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const data = await response.json();
        setFilteredOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error searching orders:", error);
        setFilteredOrders([]); // Ensure it doesn't break on error
      }
    };

    if (searchQuery) {
      fetchFilteredOrders();
    } else {
      setFilteredOrders(orders); // Default to the original orders if no search query
    }
  }, [searchQuery, currentPage, orders]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB").format(date); // Formats to DD-MM-YYYY
  };
  console.log(orders, 67);
  return (
    <Container className="mt-2" fluid>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search Orders by customer name"
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setSearchQuery(searchQuery)}
        >
          Search
        </Button>
      </InputGroup>
      <div className="table-responsive custom-table-wrapper">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  <td>{order.customerName || "N/A"}</td>
                  <td>{order.mobile || "N/A"}</td>
                  <td>{order.email || "N/A"}</td>
                  <td>{order.address || "N/A"}</td>
                  <td>{order.orderStatus || "N/A"}</td>
                  <td>
                    ₹{order.totalAmount ? order.totalAmount.toFixed(2) : "N/A"}
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <Button
                      variant="btn-info"
                      size="sm"
                      // onClick={() => handleDelete(order._id)}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No orders found.
                </td>
              </tr>
            )}
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

            {Array.from({ length: totalPages }, (_, i) => (
              <li
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                key={i}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </Container>
  );
}

export default OrderPage;
