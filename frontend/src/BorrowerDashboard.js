import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./BorrowerDashboard.css"; // Import the CSS file
import statusIcon from "./assets/image/status.png";


const BorrowerDashboard = () => {
  const stats = [
    { title: "Active Borrows", value: 2 },
    { title: "Pending Returns", value: 1 },
    { title: "Reservations", value: 2 },
    { title: "Total Borrowed", value: 15 }
  ];

  const activeItems = [
    { name: "DSLR Camera - Canon 80D", lender: "Photography Club", due: "Tomorrow, 5 PM", img: "https://media.the-digital-picture.com/Images/Standard/Camera-Top/Canon-EOS-80D.webp" },
    { name: "Scientific Calculator", lender: "IUT-2023-045", due: "Today, 8 PM", img: "https://www.shutterstock.com/image-vector/collection-four-different-scientific-basic-260nw-2681577193.jpg" }
  ];

  const upcomingReservations = [
    { name: "3D Printer - Ender 3", time: "Dec 10, 2 PM - 5 PM", location: "ME Lab", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijak8WQERevbexfwoqGeNFzYbS4yPNF4PX1T2GE-ZJl1eilNXlyLAkRwLNipKH96WazgZuVeQBAaQhVBu4tpvdjb5h6Qwcp23QNFTy8CWEMB6TxtaQ3d6VJiIfISaPbs44lAdf9cEnvLqZnxrHWNm-j3zVAHjLBvS6JH1zij00Edux_HBNQv9sHjw9J3xK/w1200-h630-p-k-no-nu/center3.png" },
    { name: "VR Headset - Quest 2", time: "Dec 12, 10 AM - 2 PM", location: "CSE Club", img: "https://www.cnet.com/a/img/resize/1af4bc1f5ad06daf0dd30192c2bd909c347a9884/hub/2020/09/13/5636d8d5-ece3-429b-8356-4c4e4cbe2bda/31-oculus-quest-2.jpg?auto=webp&fit=crop&height=900&width=1200" }
  ];

  const recommendations = [
    { name: "Arduino Starter Kit", desc: "Popular in CSE", img: "https://docs.arduino.cc/static/bbceab04f8e0726194ef4dfe2457097f/image.svg" },
    { name: "Gaming Controller", desc: "Based on recent borrows", img: "https://www.shutterstock.com/image-vector/joystick-gamepad-icon-set-flat-260nw-2474904863.jpg" }
  ];

  const handleButtonClick = (action) => {
    alert(`You clicked: ${action}! (This is a demo – in a real app, it would navigate or perform the action)`);
  };

  return (
    <div className="page">
      {/* Animated background blobs */}
      <div className="animatedBg">
        <motion.div className="blob1" animate={{ x: [0, 100, 0], y: [0, -100, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="blob2" animate={{ x: [0, -150, 0], y: [0, 120, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="blob3" animate={{ x: [0, 80, 0], y: [0, -80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="headingContainer">
        <motion.img
          src="https://cdn.vectorstock.com/i/1000v/41/37/dashboard-control-knob-ui-icon-vector-27774137.jpg"
          alt="Dashboard Icon"
          className="dashboardIcon"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <h2 className="heading">Borrower Dashboard</h2>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="subtext">
        Welcome back! Here's your borrowing activity
      </motion.p>

      <div className="statsGrid">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
            whileHover={{ scale: 1.1, y: -12 }}
            className="statCard"
          >
            <motion.img
              src={
                i === 0 ? "https://media.istockphoto.com/id/1385658906/vector/3d-trading-on-smartphone-isolated-on-purple-background-using-funding-business-graph-on.jpg?s=612x612&w=0&k=20&c=eakg3KbepI63IxCQK0aHAl16QbwAnK8azcf26P11FB0=" :
                i === 1 ? "https://static.vecteezy.com/system/resources/previews/032/614/957/non_2x/return-and-delivery-icon-vector.jpg" :
                i === 2 ? "https://media.istockphoto.com/id/1401106949/vector/3d-calendar-marked-date-for-booking-ticket-plane-day-on-travel-holiday-calendar-with-mark.jpg?s=612x612&w=is&k=20&c=sQZtZbRfFDAi6TYvlXWN2jCCUPvBKiZ3yOjRxSfltUY=" :
                "https://img.freepik.com/free-vector/gradient-dashboard-element-collection_23-2148372636.jpg?semt=ais_hybrid&w=740&q=80"
              }
              alt={`${stat.title} Icon`}
              className="statIcon"
              whileHover={{ scale: 1.3, rotate: 360 }}
              transition={{ duration: 0.6 }}
            />
            <p className="statTitle">{stat.title}</p>
            <motion.h3
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 + 0.5, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.4 }}
            >
              {stat.value}
            </motion.h3>
          </motion.div>
        ))}
      </div>

      <div className="mainGrid">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="card">
          <h3>Active Borrowed Items</h3>
          <AnimatePresence>
            {activeItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }} className="itemRow" whileHover={{ backgroundColor: "#f5f0ff" }}>
                <div className="itemInfo">
                  <motion.img
                    src={item.img}
                    alt={item.name}
                    className="itemImage"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring" }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p className="smallText">Lent by: {item.lender}</p>
                    <p className="dueText">Due: {item.due}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleButtonClick("Return " + item.name)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="returnBtn"
                >
                  Return
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.7 }} className="card">
          <h3>Quick Actions</h3>
          {["Browse Devices", "Post Emergency", "View Reservations"].map((text, i) => (
            <motion.button
              key={i}
              onClick={() => handleButtonClick(text)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              whileHover={{ scale: 1.1, backgroundColor: "#7c3aed", color: "#fff", boxShadow: "0 8px 20px rgba(124, 58, 237, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="actionBtn"
            >
              {text}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div className="mainGrid">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }} className="card">
          <h3 className="sectionTitleWithIcon">
            <motion.img
              src="https://www.shutterstock.com/image-illustration/neon-light-bulb-word-idea-260nw-2464593703.jpg"
              alt="Recommendation Icon"
              className="sectionIcon"
              whileHover={{ scale: 1.4, rotate: 15 }}
            />
            Recommended for You
          </h3>
          <div className="recoGrid">
            {recommendations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                whileHover={{ scale: 1.15, y: -10 }}
                className="recoCard"
              >
                <motion.img
                  src={item.img}
                  alt={item.name}
                  className="recoImage"
                  whileHover={{ scale: 1.1 }}
                />
                <strong>{item.name}</strong>
                <p className="smallText">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }} className="card">
          <h3 className="sectionTitleWithIcon">
            <motion.img
              src="https://www.shutterstock.com/image-illustration/verified-badge-icon-purple-color-260nw-2699579867.jpg"
              alt="Status Icon"
              className="sectionIcon"
              whileHover={{ scale: 1.4, rotate: -15 }}
            />
            Your Stats
          </h3>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <p>Total Borrowed: <strong>15 items</strong></p>
            <p>On-time Returns: <strong>100%</strong></p>
            <p>Reputation Score: ⭐ <strong style={{ color: "#7c3aed" }}>4.9</strong></p>
            <p>Member Since: <strong>Jan 2024</strong></p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.7 }} className="card">
        <h3 className="sectionTitleWithIcon">
          <motion.img
            src="https://static.vecteezy.com/system/resources/previews/022/443/194/non_2x/calendar-icon-vector.jpg"
            alt="Upcoming Icon"
            className="sectionIcon"
            whileHover={{ scale: 1.4, rotate: 360 }}
            transition={{ duration: 0.8 }}
          />
          Upcoming Reservations
        </h3>
        {upcomingReservations.map((res, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.1 }} className="itemRow" whileHover={{ backgroundColor: "#faf5ff" }}>
            <div className="itemInfo">
              <motion.img
                src={res.img}
                alt={res.name}
                className="itemImage"
                whileHover={{ scale: 1.15, rotate: -5 }}
              />
              <div>
                <strong>{res.name}</strong>
                <p className="smallText">{res.time}</p>
                <p className="smallText">{res.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BorrowerDashboard;