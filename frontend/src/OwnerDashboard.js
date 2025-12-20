// OwnerDashboard.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  List,
  History,
  PlusCircle,
  FileText,
  Wrench,
  CheckCircle,
  XCircle,
  TrendingUp,
  Star,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import "./OwnerDashboard.css";

const OwnerDashboard = () => {
  const stats = [
    { title: "Active Lends", value: 3, icon: Package, color: "text-green-600" },
    { title: "Pending Requests", value: 2, icon: Clock, color: "text-amber-600" },
    { title: "Items Listed", value: 6, icon: List, color: "text-blue-600" },
    { title: "Total Lends", value: 28, icon: History, color: "text-purple-600" },
  ];

  const activeLends = [
    {
      name: "DSLR Camera - Canon 80D",
      borrower: "IUT-2022-018",
      due: "Tomorrow, 5 PM",
      img: "https://media.the-digital-picture.com/Images/Standard/Camera-Top/Canon-EOS-80D.webp",
    },
    {
      name: "Arduino Starter Kit",
      borrower: "IUT-2023-077",
      due: "Dec 12, 9 PM",
      img: "https://docs.arduino.cc/static/bbceab04f8e0726194ef4dfe2457097f/image.svg",
    },
  ];

  const pendingRequests = [
    {
      name: "VR Headset - Quest 2",
      requester: "IUT-2021-044",
      duration: "Dec 14 (10 AM – 2 PM)",
      img: "https://www.cnet.com/a/img/resize/1af4bc1f5ad06daf0dd30192c2bd909c347a9884/hub/2020/09/13/5636d8d5-ece3-429b-8356-4c4e4cbe2bda/31-oculus-quest-2.jpg",
    },
  ];

  const quickActions = [
    { label: "Add New Item", icon: PlusCircle, action: "Add New Item" },
    { label: "View Requests", icon: FileText, action: "View Requests" },
    { label: "Maintenance Log", icon: Wrench, action: "Maintenance Log" },
  ];

  const handleAction = (action) => {
    alert(`Action: ${action} (Demo only)`);
  };

  return (
    <div className="page">
      {/* Animated Background Blobs */}
      <div className="animatedBg">
        <motion.div
          className="blob1"
          animate={{ x: [0, 100, 0], y: [0, -80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="blob2"
          animate={{ x: [0, -120, 0], y: [0, 100, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="blob3"
          animate={{ x: [0, 80, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="headingContainer"
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: -8 }}
          className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg"
        >
          <Package size={60} className="text-purple-600" />
        </motion.div>
        <div>
          <h2 className="heading">Owner Dashboard</h2>
          <p className="subtext">
            Manage your items, requests, and lending activity
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="statsGrid">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -8 }}
            className="statCard"
          >
            <stat.icon size={60} className={`${stat.color} statIcon`} />
            <p className="statTitle">{stat.title}</p>
            <motion.h3
              className="text-4xl font-bold text-gray-800"
              whileHover={{ scale: 1.2 }}
            >
              {stat.value}
            </motion.h3>
            <TrendingUp size={20} className="text-gray-400 mt-4" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid: Active Lends + Quick Actions */}
      <div className="mainGrid">
        {/* Active Lends */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="sectionTitleWithIcon text-2xl font-bold text-gray-800">
            <Clock size={36} className="text-green-600 sectionIcon" />
            Active Lends
          </div>
          <AnimatePresence>
            {activeLends.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ backgroundColor: "rgba(167, 139, 250, 0.1)" }}
                className="itemRow"
              >
                <div className="itemInfo">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="itemImage"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                    <p className="smallText">Borrower: {item.borrower}</p>
                    <p className="dueText">Due: {item.due}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAction("Mark Returned")}
                  className="returnBtn hover:bg-purple-600 hover:text-white"
                >
                  <CheckCircle size={20} />
                  Mark Returned
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="sectionTitleWithIcon text-2xl font-bold text-gray-800">
            Quick Actions
          </div>
          <div className="space-y-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action.action)}
                className="actionBtn hover:bg-purple-600 hover:text-white"
              >
                <action.icon size={28} />
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="sectionTitleWithIcon text-2xl font-bold text-gray-800">
          <AlertCircle size={36} className="text-amber-600 sectionIcon" />
          Pending Borrow Requests
        </div>
        {pendingRequests.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-lg">
            No pending requests at the moment.
          </p>
        ) : (
          <div>
            {pendingRequests.map((req, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: "rgba(236, 72, 153, 0.08)" }}
                className="itemRow"
              >
                <div className="itemInfo">
                  <img
                    src={req.img}
                    alt={req.name}
                    className="itemImage"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{req.name}</p>
                    <p className="smallText">Requested by: {req.requester}</p>
                    <p className="smallText text-gray-700">{req.duration}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction("Approve")}
                    className="returnBtn bg-green-600 text-white border-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction("Reject")}
                    className="returnBtn bg-red-600 text-white border-red-600 hover:bg-red-700"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Owner Stats Summary - Fixed Grid Layout */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card owner-stats-card"
      >
        <div className="sectionTitleWithIcon text-3xl font-bold text-white">
          <Star size={42} className="text-yellow-300 sectionIcon" />
          Your Owner Stats
        </div>

        <div className="stats-grid-summary">
          <div className="stats-item">
            <UserCheck size={48} className="stats-item-icon" />
            <p className="stats-label">Successful Lends</p>
            <p className="stats-value">28</p>
          </div>
          <div className="stats-item">
            <CheckCircle size={48} className="stats-item-icon text-green-300" />
            <p className="stats-label">On-time Returns</p>
            <p className="stats-value">96%</p>
          </div>
          <div className="stats-item">
            <Star size={48} className="stats-item-icon text-yellow-300" />
            <p className="stats-label">Reputation Score</p>
            <p className="stats-value">4.8</p>
          </div>
          <div className="stats-item">
            <Wrench size={48} className="stats-item-icon" />
            <p className="stats-label">In Maintenance</p>
            <p className="stats-value">1</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerDashboard;