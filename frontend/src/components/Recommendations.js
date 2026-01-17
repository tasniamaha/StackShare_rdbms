// src/components/Recommendations.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Recommendations.css"; // Optional: create a CSS file for styling

const Recommendations = ({ studentId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Example endpoint: /api/devices/recommendations/:studentId
        const res = await axios.get(
          `http://localhost:5000/api/devices/recommendations/${studentId}`
        );
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [studentId]);

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p>{error}</p>;
  if (recommendations.length === 0) return <p>No recommendations available.</p>;

  return (
    <div className="recommendations-container">
      <h3>Recommended Devices</h3>
      <div className="recommendation-list">
        {recommendations.map((device) => (
          <div key={device.device_id} className="recommendation-card">
            <h4>{device.device_name}</h4>
            <p>Category: {device.device_category}</p>
            <p>Status: {device.device_status}</p>
            <p>Location: {device.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
