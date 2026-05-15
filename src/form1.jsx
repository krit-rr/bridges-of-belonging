import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "./firebase";

// TODO: Edit these
const ISSUES = [
  "News fatigue / information overload",
  "Political polarization",
  "Climate anxiety",
  "Community disconnect",
  "Local vs. global focus tension",
  "Economic uncertainty",
  "Mental health & burnout",
  "Civic engagement fatigue",
  "Identity & belonging",
  "Misinformation"
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
          onClick={() => window.location.href = "/#/graphic1"}
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
        placeholder="First and last name"
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
    padding: "32px 20px",
    fontFamily: "sans-serif",
    color: "#1a1a1a"
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4
  },
  sub: {
    color: "#555",
    marginBottom: 24,
    fontSize: 15
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 20
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: 16,
    border: "1.5px solid #ddd",
    borderRadius: 8,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: 15,
    border: "1.5px solid #ddd",
    borderRadius: 8,
    minHeight: 80,
    boxSizing: "border-box"
  },
  tagGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  tag: {
    padding: "8px 14px",
    borderRadius: 20,
    border: "1.5px solid #ddd",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer"
  },
  tagSelected: {
    background: "#2d6a4f",
    color: "#fff",
    borderColor: "#2d6a4f"
  },
  submit: {
    marginTop: 32,
    width: "100%",
    padding: "16px",
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer"
  }
};