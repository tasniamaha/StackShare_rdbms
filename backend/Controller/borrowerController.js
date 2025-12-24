// Controller/borrowerController.js
const express = require("express");
const router = express.Router();


// Mock borrower stats
const stats = {
  activeBorrows: 2,
  pendingReturns: 1,
  reservations: 2,
  totalBorrowed: 15,
};

// Mock active borrowed items
const activeItems = [
  {
    id: 1,
    name: "DSLR Camera - Canon 80D",
    lender: "Photography Club",
    due: "Tomorrow, 5 PM",
    img: "https://static.vecteezy.com/system/resources/thumbnails/053/425/986/small/dslr-camera-on-wet-ground-autumn-leaves-photo.jpeg",
  },
  {
    id: 2,
    name: "Scientific Calculator",
    lender: "IUT-2023-045",
    due: "Today, 8 PM",
    img: "https://www.shutterstock.com/image-vector/collection-four-different-scientific-basic-260nw-2681577193.jpg",
  },
];

// Mock upcoming reservations
const upcomingReservations = [
  {
    id: 1,
    name: "3D Printer - Ender 3",
    time: "Dec 10, 2 PM - 5 PM",
    location: "ME Lab",
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijak8WQERevbexfwoqGeNFzYbS4yPNF4PX1T2GE-ZJl1eilNXlyLAkRwLNipKH96WazgZuVeQBAaQhVBu4tpvdjb5h6Qwcp23QNFTy8CWEMB6TxtaQ3d6VJiIfISaPbs44lAdf9cEnvLqZnxrHWNm-j3zVAHjLBvS6JH1zij00Edux_HBNQv9sHjw9J3xK/w1200-h630-p-k-no-nu/center3.png",
  },
  {
    id: 2,
    name: "VR Headset - Quest 2",
    time: "Dec 12, 10 AM - 2 PM",
    location: "CSE Club",
    img: "https://www.cnet.com/a/img/resize/1af4bc1f5ad06daf0dd30192c2bd909c347a9884/hub/2020/09/13/5636d8d5-ece3-429b-8356-4c4e4cbe2bda/31-oculus-quest-2.jpg?auto=webp&fit=crop&height=900&width=1200",
  },
];

// Mock recommendations
const recommendations = [
  {
    id: 1,
    name: "Arduino Starter Kit",
    desc: "Popular in CSE",
    img: "https://docs.arduino.cc/static/bbceab04f8e0726194ef4dfe2457097f/image.svg",
  },
  {
    id: 2,
    name: "Gaming Controller",
    desc: "Based on recent borrows",
    img: "https://www.shutterstock.com/image-vector/joystick-gamepad-icon-set-flat-260nw-2474904863.jpg",
  },
];

// GET /api/borrower/stats
router.get("/stats", (req, res) => {
  res.json({ success: true, data: stats });
});

// GET /api/borrower/active-items
router.get("/active-items", (req, res) => {
  res.json({ success: true, data: activeItems });
});

// GET /api/borrower/upcoming-reservations
router.get("/upcoming-reservations", (req, res) => {
  res.json({ success: true, data: upcomingReservations });
});

// GET /api/borrower/recommendations
router.get("/recommendations", (req, res) => {
  res.json({ success: true, data: recommendations });
});

module.exports = router;
