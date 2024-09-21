import { useState } from "react";


function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({
    name: "",
    style: "",
    shed: "",
    price: "",
    unit: "",
    category: "",
    totalQuantity: "",
    designs: [{ design: "", quantity: "" }],
    size: [{ size: "", quantity: "" }],
    notes: "",
  });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleDesignChange = (index, e) => {
    const designs = [...item.designs];
    designs[index][e.target.name] = e.target.value;
    setItem({ ...item, designs });
  };

  const handleSizeChange = (index, e) => {
    const size = [...item.size];
    size[index][e.target.name] = e.target.value;
    setItem({ ...item, size });
  };

  const handleAddDesign = () => {
    setItem({ ...item, designs: [...item.designs, { design: "", quantity: "" }] });
  };

  const handleRemoveDesign = (index) => {
    const designs = [...item.designs];
    designs.splice(index, 1);
    setItem({ ...item, designs });
  };

  const handleAddSize = () => {
    setItem({ ...item, size: [...item.size, { size: "", quantity: "" }] });
  };

  const handleRemoveSize = (index) => {
    const size = [...item.size];
    size.splice(index, 1);
    setItem({ ...item, size});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send item to the backend via POST request
    const response = await fetch("http://localhost:5000/api/items/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Item added successfully");
    } else {
      alert("Error adding item: " + data.message);
    }
    setShowForm(false); // Hide form after submission
    // Reset form
    setItem({ name: "", style: "", designs: [{ design: "" }], size: [{ size: "" }], shed: "", quantity: "", price: "", unit: "", category: "", notes: "" });
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleShowForm = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

  return (
    <div className="container my-3">
      {/* Search Bar */}
      <div className="row align-items-center mb-3">
        <div className="col-md-10">
          <input
            className="form-control"
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search items..."
          />
        </div>
        <div className="col-md-2 text-end">
          <button className="btn btn-primary" onClick={handleShowForm}>
            {showForm ? "Close Form" : "Add New Item"}
          </button>
        </div>
      </div>


      {showForm && (
        <div className="container">
        <h2 className="my-4">Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={item.name}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="col-md-6">
              <label className="form-label">Style</label>
              <input
                type="text"
                className="form-control"
                name="style"
                value={item.style}
                onChange={handleChange}
              />
            </div>
  
            <div className="col-md-6">
              <label className="form-label">Shed</label>
              <input
                type="text"
                className="form-control"
                name="shed"
                value={item.shed}
                onChange={handleChange}
              />
            </div>
  
            <div className="col-md-6">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={item.price}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="col-md-6">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-control"
                name="unit"
                value={item.unit}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="col-md-6">
              <label className="form-label">Category</label>
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
                <option value="Sink">Sink</option>
              </select>
            </div>
          </div>
  
          {/* Dynamic Sizes Section */}
          <div className="my-4">
            <h4>Sizes</h4>
            {item.size.map((size, index) => (
              <div className="row mb-2" key={index}>
                <div className="col-md-5">
                  <label className="form-label">Size</label>
                  <input
                    type="text"
                    className="form-control"
                    name="size"
                    value={size.size}
                    onChange={(e) => handleSizeChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={size.quantity}
                    onChange={(e) => handleSizeChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveSize(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-success" onClick={handleAddSize}>
              Add Size
            </button>
          </div>
  
          {/* Dynamic Designs Section */}
          <div className="my-4">
            <h4>Designs</h4>
            {item.designs.map((design, index) => (
              <div className="row mb-2" key={index}>
                <div className="col-md-5">
                  <label className="form-label">Design</label>
                  <input
                    type="text"
                    className="form-control"
                    name="design"
                    value={design.design}
                    onChange={(e) => handleDesignChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={design.quantity}
                    onChange={(e) => handleDesignChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveDesign(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-success" onClick={handleAddDesign}>
              Add Design
            </button>
          </div>
  
          <div className="my-4">
            <label className="form-label">Total Quantity</label>
            <input
              type="number"
              className="form-control"
              name="totalQuantity"
              value={item.totalQuantity}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="my-4">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={item.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional notes"
            />
          </div>
  
          <button type="submit" className="btn btn-primary mt-3">
            Submit
          </button>
        </form>
      </div>
      )}
    </div>
  );
}

export default SearchBar;
