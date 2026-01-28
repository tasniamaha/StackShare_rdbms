import { useState } from "react";
import apiClient from "../api/apiClient";

const BorrowRequest = ({ deviceId }) => {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Client-side validation
  const validate = () => {
    if (!reason.trim()) return "Reason for borrowing is required";
    if (!startDate) return "Start date is required";
    if (!endDate) return "End date is required";
    if (new Date(endDate) < new Date(startDate))
      return "End date cannot be before start date";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);

    try {
      // Send POST request to create borrow
      const res = await apiClient.post("/borrows/request", {
        device_id: deviceId,  // backend expects device_id
        reason,
        start_date: startDate,
        end_date: endDate,
      });

      setMessage("Borrow request created successfully!");
      setReason("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message || "Failed to create borrow request");
      } else {
        setMessage("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borrow-request-container">
      <h3>Borrow Device</h3>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Reason for borrowing"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Borrow"}
        </button>
      </form>
    </div>
  );
};

export default BorrowRequest;
