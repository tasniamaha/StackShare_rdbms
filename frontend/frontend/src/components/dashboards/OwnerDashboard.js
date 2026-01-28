// src/components/dashboards/OwnerDashboard.js
import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

const OwnerDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [activeLends, setActiveLends] = useState([]);
  const [lendHistory, setLendHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newDeviceName, setNewDeviceName] = useState("");

  // Fetch all owner dashboard data
  const fetchOwnerData = async () => {
    setLoading(true);
    setError("");

    try {
      const [devicesRes, activeLendsRes, historyRes] = await Promise.all([
        apiClient.get("/owner/devices"),
        apiClient.get("/owner/active-lends"),
        apiClient.get("/owner/lend-history"),
      ]);

      setDevices(devicesRes.data);
      setActiveLends(activeLendsRes.data);
      setLendHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Add a new device
  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) return alert("Device name required");

    try {
      await apiClient.post("/owner/devices", { device_name: newDeviceName });
      setNewDeviceName("");
      fetchOwnerData(); // refresh dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add device");
    }
  };

  // Delete a device
  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;

    try {
      await apiClient.delete(`/owner/devices/${id}`);
      fetchOwnerData(); // refresh dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete device");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="owner-dashboard">
      <h2>Owner Dashboard</h2>

      {/* Device Management */}
      <section>
        <h3>My Devices</h3>
        <input
          type="text"
          placeholder="New Device Name"
          value={newDeviceName}
          onChange={(e) => setNewDeviceName(e.target.value)}
        />
        <button onClick={handleAddDevice}>Add Device</button>

        {devices.length === 0 ? (
          <p>No devices added yet.</p>
        ) : (
          <ul>
            {devices.map((device) => (
              <li key={device.device_id}>
                {device.device_name} — Status: {device.device_status}{" "}
                <button onClick={() => handleDeleteDevice(device.device_id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Active Lends */}
      <section>
        <h3>Active Lends</h3>
        {activeLends.length === 0 ? (
          <p>No active lends</p>
        ) : (
          <ul>
            {activeLends.map((lend) => (
              <li key={lend.borrow_id}>
                {lend.device_name} — Borrowed by: {lend.student_name} — Due:{" "}
                {lend.due_date}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lend History */}
      <section>
        <h3>Lend History</h3>
        {lendHistory.length === 0 ? (
          <p>No lend history</p>
        ) : (
          <ul>
            {lendHistory.map((lend) => (
              <li key={lend.borrow_id}>
                {lend.device_name} — Borrowed by: {lend.student_name} — Returned:{" "}
                {lend.return_date || "Pending"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default OwnerDashboard;
