import { useState } from "react";
import "./EmergencyPostPage.css";

function EmergencyPostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Normal");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Emergency Post:");
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Urgency:", urgency);
    alert("Emergency post submitted (frontend only)");
  };

  return (
    <div className="emergency-page">
      <div className="emergency-card">
        <h2>Emergency Post</h2>
        <p className="subtitle">
          Post urgent requests to your university community
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Describe the emergency..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          ></textarea>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <button type="submit" className="post-btn">
            Post Emergency
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmergencyPostPage;
