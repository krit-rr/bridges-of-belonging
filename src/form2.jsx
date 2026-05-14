import { useState } from "react";
import { ref, query, orderByChild, equalTo, onValue, update } from "firebase/database";
import { db } from "./firebase";

// TODO: EDit and create fill in option
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

export default function Form2() {
  const [step, setStep] = useState("lookup"); // lookup → form → done
  const [email, setEmail] = useState("");
  const [shaperKey, setShaperKey] = useState(null);
  const [shaperName, setShaperName] = useState("");
  const [practice, setPractice] = useState("");
  const [skills, setSkills] = useState([]);
  const [openToConnect, setOpenToConnect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (skill) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleLookup = () => {
    if (!email) return;
    setLoading(true);
    setError("");

    const shapersRef = query(
      ref(db, "shapers"),
      orderByChild("email"),
      equalTo(email.trim().toLowerCase())
    );

    onValue(shapersRef, (snapshot) => {
      setLoading(false);
      const data = snapshot.val();
      if (!data) {
        setError("We couldn't find your email — make sure you filled out Part 1 first.");
        return;
      }
      const key = Object.keys(data)[0];
      const shaper = Object.values(data)[0];
      setShaperKey(key);
      setShaperName(shaper.name);
      setStep("form");
    }, { onlyOnce: true });
  };

  const handleSubmit = async () => {
    if (skills.length === 0) {
      alert("Pick at least one skill to offer.");
      return;
    }
    setLoading(true);
    await update(ref(db, `shapers/${shaperKey}`), {
      practice,
      skills,
      openToConnect
    });
    setLoading(false);
    setStep("done");
  };

  if (step === "done") {
    return (
    // TODO: Edit
      <div style={styles.container}>
        <h1 style={styles.heading}>You're on the network</h1>
        <p style={styles.sub}>Thanks {shaperName.split(" ")[0]} — now click here or look up.</p>
      </div>
    );
  }

  if (step === "lookup") {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Part 2 — Bridges & Connections</h1>
        <p style={styles.sub}>Enter the email you used in Part 1 to continue.</p>

        <label style={styles.label}>Your Email</label>
        <input
          style={styles.input}
          placeholder="same email as before"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.submit}
          onClick={handleLookup}
          disabled={loading}
        >
          {loading ? "Looking you up..." : "Continue →"}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* // TODO: Display */}
      <h1 style={styles.heading}>Hey {shaperName.split(" ")[0]}</h1>
      <p style={styles.sub}>Let's build your bridge.</p>

      <label style={styles.label}>What's helped you stay engaged?</label>
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
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      <label style={styles.label}>Open to being contacted by other Shapers?</label>
      <div style={styles.tagGrid}>
        <button
          style={{
            ...styles.tag,
            ...(openToConnect ? styles.tagSelected : {})
          }}
          onClick={() => setOpenToConnect(true)}
        >
          Yes, reach out!
        </button>
        <button
          style={{
            ...styles.tag,
            ...(!openToConnect ? styles.tagSelected : {})
          }}
          onClick={() => setOpenToConnect(false)}
        >
          Not right now
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
  },
  error: {
    color: "#c0392b",
    fontSize: 14,
    marginTop: 8
  }
};