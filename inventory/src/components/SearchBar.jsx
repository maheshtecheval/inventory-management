import { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({
    name: "",
    style: "",
    size: "",
    design: "",
    shed: "",
    quantity: "",
    price: "",
    unit: "",
    category: "",
  });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/items/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    setShowForm(false); // Hide form after submission
  };
  const handleShowForm = () => {
    setShowForm(!showForm); // Toggle form visibility
  };
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <>
      <div className="container my-2">
        <div className="row custom-row  ">
          <div className="col-md-8 custom-col ">
            <input
              className="form-control"
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search items..."
            />
          </div>
          <div className="col-md-4 custom-col">
            <button className="btn btn-primary" onClick={handleShowForm}>
              Add New Item
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={item.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Style</label>
                  <input
                    type="text"
                    className="form-control"
                    name="style"
                    value={item.style}
                    onChange={handleChange}
                    placeholder="Style"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={item.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Tiles">Tiles</option>
                    <option value="Bath Tub">Bath Tub</option>
                    <option value="Wash Basin">Wash Basin</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    className="form-control"
                    name="unit"
                    value={item.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="Box">Box</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    className="form-control"
                    name="size"
                    value={item.size}
                    onChange={handleChange}
                    placeholder="Size"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Design</label>
                  <input
                    type="text"
                    className="form-control"
                    name="design"
                    value={item.design}
                    onChange={handleChange}
                    placeholder="Design"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Shed</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shed"
                    value={item.shed}
                    onChange={handleChange}
                    placeholder="Shed"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={item.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={item.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success mt-3">
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default SearchBar;
