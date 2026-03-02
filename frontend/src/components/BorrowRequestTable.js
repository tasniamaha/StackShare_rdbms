// src/components/BorrowRequestTable.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BorrowRequestTable.css";

const BorrowRequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending borrow requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token"); // If using auth token
      const res = await axios.get("http://localhost:5000/api/borrow/pending", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching borrow requests:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (borrow_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/borrow/approve/${borrow_id}`, { approved_by: 1 }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchRequests(); // Refresh table
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (borrow_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/borrow/reject/${borrow_id}`, { approved_by: 1 }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchRequests(); // Refresh table
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  if (loading) return <p>Loading borrow requests...</p>;

  return (
    <div className="borrow-request-table">
      <h2>Pending Borrow Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table>
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
            {requests.map(req => (
              <tr key={req.borrow_id}>
                <td>{req.student_name}</td>
                <td>{req.device_name}</td>
                <td>{new Date(req.request_date).toLocaleDateString()}</td>
                <td>{new Date(req.borrow_start_date).toLocaleDateString()}</td>
                <td>{new Date(req.borrow_end_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleApprove(req.borrow_id)}>Approve</button>
                  <button onClick={() => handleReject(req.borrow_id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BorrowRequestTable;
