// src/components/BorrowRequestTable.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import "./BorrowRequestTable.css";

const BorrowRequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending borrow requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("stackshare_token"); // Updated key name
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get("http://localhost:5000/api/borrow/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching borrow requests:", err);
      setError(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (borrow_id) => {
    if (!window.confirm("Approve this borrow request?")) return;

    try {
      const token = localStorage.getItem("stackshare_token");
      await axios.put(
        `http://localhost:5000/api/borrow/approve/${borrow_id}`,
        { approved_by: 1 }, // You may want to send real admin ID later
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests(); // Refresh
    } catch (err) {
      console.error("Error approving:", err);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (borrow_id) => {
    if (!window.confirm("Reject this borrow request?")) return;

    try {
      const token = localStorage.getItem("stackshare_token");
      await axios.put(
        `http://localhost:5000/api/borrow/reject/${borrow_id}`,
        { approved_by: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests(); // Refresh
    } catch (err) {
      console.error("Error rejecting:", err);
      alert("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="brt-loading">
        <Loader2 className="brt-spinner" size={48} />
        <p>Loading borrow requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brt-error">
        <p>{error}</p>
        <button className="brt-retry-btn" onClick={fetchRequests}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="borrow-request-table"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2>Pending Borrow Requests</h2>

      {requests.length === 0 ? (
        <div className="brt-empty">
          <p>No pending borrow requests at the moment.</p>
        </div>
      ) : (
        <div className="brt-table-container">
          <table className="brt-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Device Name</th>
                <th>Request Date</th>
                <th>Borrow Start</th>
                <th>Borrow End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.borrow_id}>
                  <td>{req.student_name || "Unknown"}</td>
                  <td>{req.device_name || "Unnamed Device"}</td>
                  <td>
                    {req.request_date
                      ? new Date(req.request_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {req.borrow_start_date
                      ? new Date(req.borrow_start_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {req.borrow_end_date
                      ? new Date(req.borrow_end_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="brt-actions">
                    <motion.button
                      className="brt-btn approve"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(req.borrow_id)}
                    >
                      <CheckCircle size={16} /> Approve
                    </motion.button>
                    <motion.button
                      className="brt-btn reject"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(req.borrow_id)}
                    >
                      <XCircle size={16} /> Reject
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default BorrowRequestTable;
