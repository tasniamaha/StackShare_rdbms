import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <h1>StackShare</h1>
      <p>Borrow and lend devices safely within your university.</p>

      <div className="landing-buttons">
        <button>Login</button>
        <button>Register</button>
        <button>Emergency Post</button>
      </div>
    </div>
  );
}

export default LandingPage;

