import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";

const DeviceList = ({ category, searchQuery, showAvailableOnly }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/devices";

      if (showAvailableOnly) {
        url = "/devices/available";
      } else if (category) {
        url = `/devices/category/${category}`;
      } else if (searchQuery) {
        url = `/devices/search?query=${encodeURIComponent(searchQuery)}`;
      }

      const res = await apiClient.get(url);
      setDevices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [category, searchQuery, showAvailableOnly]);

  if (loading) return <p>Loading devices...</p>;
  if (error) return <p className="error">{error}</p>;
  if (devices.length === 0) return <p>No devices found</p>;

  return (
    <div className="device-list">
      <h2>Device List</h2>
      <ul>
        {devices.map((device) => (
          <li key={device.device_id}>
            <Link to={`/devices/${device.device_id}`}>
              {device.device_name} — Status: {device.device_status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;
