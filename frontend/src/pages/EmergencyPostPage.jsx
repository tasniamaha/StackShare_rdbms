import "./EmergencyPostPage.css";

export default function EmergencyPostPage() {
  return (
    <div className="emergency-bg">
      <div className="emergency-card">
        <h2>Emergency Post</h2>
        <p className="subtitle">
          Post urgent requests to your university community
        </p>

        <form className="emergency-form">
          <input
            type="text"
            placeholder="Post Title"
            required
          />

          <textarea
            rows="4"
            placeholder="Describe the emergency..."
            required
          />

          <select required>
            <option value="low">
              Low (needed in ~2 weeks)
            </option>
            <option value="normal">
              Normal (needed in ~2 days)
            </option>
            <option value="high">
              High (needed in ~1 hour)
            </option>
            <option value="critical">
              Critical (needed NOW)
            </option>
          </select>

          <button type="submit">
            Post Emergency
          </button>
        </form>
      </div>
    </div>
  );
}
