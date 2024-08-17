const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const itemRoutes = require("./routes/itemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/auth");
const path = require("path");
const app = express();
app.use(cors());
// Serve static files from the "invoices" directory
app.use("/invoices", express.static(path.join(__dirname, "invoices")));

connectDB();

app.use(bodyParser.json());

app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
