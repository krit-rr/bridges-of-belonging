import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "./firebase";

const ISSUES = [
  "Staying motivated between projects",
  "Feeling disconnected from other hubs",
  "Balancing shaper work with personal life",
  "Not knowing how to turn ideas into impact",
  "Feeling like my hub isn't doing enough",
  "Burnout from world events",
  "Lack of resources or funding",
  "Navigating organizational bureaucracy",
  "Feeling isolated as a young leader",
  "Uncertainty about my role as a shaper"
];

export default function Form1() {
  const [name, setName] = useState("");
  const [hub, setHub] = useState("");
  const [email, setEmail] = useState("");
  const [issues, setIssues] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customIssue, setCustomIssue] = useState("");
  const [customIssues, setCustomIssues] = useState([]);

  const toggleItem = (list, setList, item) => {
    setList(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!name || !hub || !email || issues.length === 0) {
      alert("Please fill in your name, hub, email, and at least one issue.");
      return;
    }
    setLoading(true);
    await push(ref(db, "shapers"), {
      name,
      hub,
      email,
      issues,
      timestamp: Date.now()
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Thanks {name}!</h1>
        <p style={styles.sub}>Look up at the screen to see the pressure map (or click below).</p>
        <button
          style={styles.submit}
          onClick={() => window.location.href = "bridges_of_belonging/#/graphic1"}
        >
          See the Pressure Map →
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Bridges of Belonging</h1>
      <p style={styles.sub}>Fill this out to join the network map.</p>

      <label style={styles.label}>Your Name</label>
      <input
        style={styles.input}
        placeholder=" "
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <label style={styles.label}>Your Hub</label>
      <input
        style={styles.input}
        placeholder="Full city name (e.g. Boston, New York City, Pittsburgh)"
        value={hub}
        onChange={e => setHub(e.target.value)}
      />

      <label style={styles.label}>Your Email</label>
      <input
        style={styles.input}
        placeholder="Don't forget which email you used!"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label style={styles.label}>What's weighing on you right now? (pick all that apply)</label>
      <div style={styles.tagGrid}>
      {ISSUES.map(issue => (
        <button
          key={issue}
          style={{
            ...styles.tag,
            ...(issues.includes(issue) ? styles.tagSelected : {})
          }}
          onClick={() => toggleItem(issues, setIssues, issue)}
        >
          {issue}
        </button>
      ))}
      {customIssues.map(issue => (
        <button
          key={issue}
          style={{
            ...styles.tag,
            ...(issues.includes(issue) ? styles.tagSelected : {})
          }}
          onClick={() => toggleItem(issues, setIssues, issue)}
        >
          {issue}
        </button>
      ))}
    </div>

    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
      <input
        style={{ ...styles.input, flex: 1 }}
        placeholder="Something else on your mind?"
        value={customIssue}
        onChange={e => setCustomIssue(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && customIssue.trim()) {
            const newIssue = customIssue.trim();
            setCustomIssues(prev => [...prev, newIssue]);
            setIssues(prev => [...prev, newIssue]);
            setCustomIssue("");
          }
        }}
      />
      <button
        style={{ ...styles.tag, whiteSpace: "nowrap" }}
        onClick={() => {
          if (customIssue.trim()) {
            const newIssue = customIssue.trim();
            setCustomIssues(prev => [...prev, newIssue]);
            setIssues(prev => [...prev, newIssue]);
            setCustomIssue("");
          }
        }}
      >
        Add +
      </button>
    </div>

      <button
        style={styles.submit}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Add me to the network →"}
      </button>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "48px 24px 80px",
    fontFamily: "'Inter', sans-serif",
    color: "#e8f4f8",
    position: "relative"
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 6,
    background: "linear-gradient(135deg, #e8f4f8 0%, #93c5fd 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  sub: {
    color: "rgba(232, 244, 248, 0.5)",
    marginBottom: 32,
    fontSize: 15,
    lineHeight: 1.6
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 24,
    color: "rgba(232, 244, 248, 0.7)",
    letterSpacing: "0.02em"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    boxSizing: "border-box",
    color: "#e8f4f8",
    outline: "none",
    fontFamily: "'Inter', sans-serif"
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    minHeight: 90,
    boxSizing: "border-box",
    color: "#e8f4f8",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    resize: "vertical"
  },
  tagGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    padding: "9px 16px",
    borderRadius: 24,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.04)",
    fontSize: 13,
    cursor: "pointer",
    color: "rgba(232, 244, 248, 0.7)",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s"
  },
  tagSelected: {
    background: "rgba(147, 197, 253, 0.15)",
    color: "#93c5fd",
    borderColor: "rgba(147, 197, 253, 0.4)"
  },
  submit: {
    marginTop: 40,
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #1e40af, #6d28d9)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 24px rgba(109, 40, 217, 0.3)"
  },
  error: {
    color: "#fca5a5",
    fontSize: 13,
    marginTop: 8
  }
};