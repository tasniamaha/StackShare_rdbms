// deviceController.js
const express = require("express");
const router = express.Router();

// Mock device data
let devices = [
  {
    id: 1,
    name: "Dell Laptop",
    type: "Laptop",
    quantity: 5,
    description: "High-performance laptop for programming and design."
  },
  {
    id: 2,
    name: "Canon DSLR",
    type: "Camera",
    quantity: 3,
    description: "Professional DSLR camera for photography projects."
  },
  {
    id: 3,
    name: "Oculus VR Headset",
    type: "VR Headset",
    quantity: 2,
    description: "Immersive VR headset for simulations and learning."
  },
  {
    id: 4,
    name: "Arduino Kit",
    type: "Microcontroller",
    quantity: 10,
    description: "Complete Arduino kit for robotics and electronics projects."
  },
  {
    id: 5,
    name: "HP Laser Printer",
    type: "Printer",
    quantity: 1,
    description: "Reliable printer for document and report printing."
  }
];

// Get all devices (borrower view)
router.get("/devices", (req, res) => {
  res.json({
    success: true,
    data: devices
  });
});

// Get a single device by ID
router.get("/devices/:id", (req, res) => {
  const deviceId = parseInt(req.params.id);
  const device = devices.find(d => d.id === deviceId);

  if (device) {
    res.json({ success: true, data: device });
  } else {
    res.status(404).json({ success: false, message: "Device not found" });
  }
});

// Add a new device (owner view)
router.post("/devices", (req, res) => {
  const { name, type, quantity, description } = req.body;

  if (!name || !type || quantity === undefined || !description) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const newDevice = {
    id: devices.length + 1,
    name,
    type,
    quantity,
    description
  };

  devices.push(newDevice);

  res.status(201).json({
    success: true,
    message: "Device added successfully",
    data: newDevice
  });
});

// Update device quantity (owner view)
router.put("/devices/:id", (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { quantity } = req.body;
  const device = devices.find(d => d.id === deviceId);

  if (!device) {
    return res.status(404).json({ success: false, message: "Device not found" });
  }

  if (quantity !== undefined) device.quantity = quantity;

  res.json({ success: true, message: "Device updated", data: device });
});

// Delete a device (owner view)
router.delete("/devices/:id", (req, res) => {
  const deviceId = parseInt(req.params.id);
  const index = devices.findIndex(d => d.id === deviceId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Device not found" });
  }

  const deletedDevice = devices.splice(index, 1);

  res.json({ success: true, message: "Device deleted", data: deletedDevice[0] });
});

module.exports = router;
