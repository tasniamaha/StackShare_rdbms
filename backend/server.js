const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const borrowerController = require("./Controller/borrowerController");
const deviceController = require("./Controller/deviceController");

const app = express();

// Enable CORS
app.use(cors({ origin: "http://localhost:3001" }));

app.use(bodyParser.json());

// Borrower routesy
app.use("/api/borrower", borrowerController);

// Device routes
app.use("/api", deviceController);

app.get("/", (req, res) => {
  res.send("StackShare Backend is running!");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
