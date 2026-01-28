import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import BorrowRequest from "../borrow/BorrowRequest";

const DeviceDetails = () => {
  const { id } = useParams(); // device ID from route
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDeviceDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/devices/${id}`);
      setDevice(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch device details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceDetails();
  }, [id]);

  if (loading) return <p>Loading device details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!device) return <p>No device found</p>;

  return (
    <div className="device-details">
      <h2>{device.device_name}</h2>
      <p>Status: {device.device_status}</p>
      <p>Category: {device.category || "N/A"}</p>
      <p>Description: {device.description || "No description available"}</p>
      <p>Owner: {device.owner_name || "N/A"}</p>

      {/* Borrow history if available */}
      {device.borrow_history && device.borrow_history.length > 0 && (
        <section>
          <h3>Borrow History</h3>
          <ul>
            {device.borrow_history.map((borrow) => (
              <li key={borrow.borrow_id}>
                {borrow.student_name} — Borrowed: {borrow.start_date} — Returned: {borrow.end_date || "Pending"}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Borrow Request (if device is available) */}
      {device.device_status === "Available" && (
        <section>
          <h3>Request to Borrow</h3>
          <BorrowRequest deviceId={device.device_id} />
        </section>
      )}
    </div>
  );
};

export default DeviceDetails;
