import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "./firebase";

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

const SKILLS = [
  "Facilitation",
  "Mental health support",
  "Policy & advocacy",
  "Community organizing",
  "Storytelling & media",
  "Tech & data",
  "Research & writing",
  "Network connections",
  "Fundraising",
  "Wellness practices"
];

export default function Submit() {
  const [name, setName] = useState("");
  const [hub, setHub] = useState("");
  const [email, setEmail] = useState("");
  const [issues, setIssues] = useState([]);
  const [practice, setPractice] = useState("");
  const [skills, setSkills] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      practice,
      skills,
      timestamp: Date.now()
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>You're on the map</h1>
        <p style={styles.sub}>Thanks {name} — look up at the screen to find yourself in the network.</p>
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

      <label style={styles.label}>Your Hub City</label>
      <input
        style={styles.input}
        placeholder="e.g. Boston, New York, Pittsburgh"
        value={hub}
        onChange={e => setHub(e.target.value)}
      />

      <label style={styles.label}>Your Email</label>
      <input
        style={styles.input}
        placeholder="For other Shapers to reach you"
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
      </div>

      <label style={styles.label}>What's helped you stay engaged? (optional)</label>
      <textarea
        style={styles.textarea}
        placeholder="A practice, mindset, resource, anything..."
        value={practice}
        onChange={e => setPractice(e.target.value)}
      />

      <label style={styles.label}>What can you offer the network? (pick all that apply)</label>
      <div style={styles.tagGrid}>
        {SKILLS.map(skill => (
          <button
            key={skill}
            style={{
              ...styles.tag,
              ...(skills.includes(skill) ? styles.tagSelected : {})
            }}
            onClick={() => toggleItem(skills, setSkills, skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      <button
        style={styles.submit}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Add me to the map →"}
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