import { useState } from "react";
import { ref, query, orderByChild, equalTo, onValue, update } from "firebase/database";
import { db } from "./firebase";

const SKILLS = [
  "Project design & ideation",
  "Fundraising & grant writing",
  "Community organizing",
  "Cross-hub collaboration",
  "Mental health & peer support",
  "Storytelling & communications",
  "Policy & advocacy",
  "Tech & digital tools",
  "Event planning & facilitation",
  "Connecting people across networks"
];

export default function Form2() {
  const [step, setStep] = useState("lookup");
  const [email, setEmail] = useState("");
  const [shaperKey, setShaperKey] = useState(null);
  const [shaperName, setShaperName] = useState("");
  const [practice, setPractice] = useState("");
  const [link, setLink] = useState("");
  const [skills, setSkills] = useState([]);
  const [openToConnect, setOpenToConnect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [customSkills, setCustomSkills] = useState([]);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
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

    onValue(
      shapersRef,
      (snapshot) => {
        setLoading(false);

        const data = snapshot.val();

        if (!data) {
          setError(
            "We couldn't find your email — make sure you filled out Part 1 first."
          );
          return;
        }

        const key = Object.keys(data)[0];
        const shaper = Object.values(data)[0];

        setShaperKey(key);
        setShaperName(shaper.name);

        setStep("form");
      },
      { onlyOnce: true }
    );
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
      link,       
      openToConnect
    });

    setLoading(false);
    setStep("done");
  };

  if (step === "done") {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Thanks {shaperName.split(" ")[0]}! You're in.</h1>

        <p style={styles.sub}>
          Click to see your connections and resources, or navigate back home.
        </p>

        <button
          style={styles.submit}
          onClick={() => (window.location.href = "/bridges_of_belonging/#/graphic2")
          }
        >
          Connections and Resources →
        </button>

        <button
          style={styles.submit}
          onClick={() => window.location.href = "/bridges_of_belonging"}
        >
          Home →
        </button>
        
      </div>
    );
  }

  if (step === "lookup") {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>
          Part 2 — Bridges & Connections
        </h1>

        <p style={styles.sub}>
          Enter the email you used in Part 1 to continue.
        </p>

        <label style={styles.label}>Your Email</label>

        <input
          style={styles.input}
          placeholder="same email as before"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      <h1 style={styles.heading}>
        Hey {shaperName.split(" ")[0]}
      </h1>

      <p style={styles.sub}>Let's build your bridge.</p>

      <label style={styles.label}>
        What piece of advice would you give?
      </label>

      <textarea
        style={styles.textarea}
        placeholder="A practice, mindset, anything..."
        value={practice}
        onChange={(e) => setPractice(e.target.value)}
      />

      <label style={styles.label}>
        Any resources you'd like to share?
      </label>

      <textarea
        style={styles.textarea}
        placeholder="Type link here"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      <label style={styles.label}>
        What can you offer the network?
      </label>

      <div style={styles.tagGrid}>
        {SKILLS.map((skill) => (
          <button
            key={skill}
            type="button"
            style={{
              ...styles.tag,
              ...(skills.includes(skill)
                ? styles.tagSelected
                : {}),
            }}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </button>
        ))}

        {customSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            style={{
              ...styles.tag,
              ...(skills.includes(skill)
                ? styles.tagSelected
                : {}),
            }}
            onClick={() => toggleSkill(skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <input
          style={{
            ...styles.input,
            flex: 1,
          }}
          placeholder="Add another skill..."
          value={customSkill}
          onChange={(e) =>
            setCustomSkill(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              customSkill.trim()
            ) {
              e.preventDefault();

              const newSkill = customSkill.trim();

              setCustomSkills((prev) => [
                ...prev,
                newSkill,
              ]);

              setSkills((prev) => [
                ...prev,
                newSkill,
              ]);

              setCustomSkill("");
            }
          }}
        />

        <button
          type="button"
          style={{
            ...styles.tag,
            whiteSpace: "nowrap",
          }}
          onClick={() => {
            if (customSkill.trim()) {
              const newSkill =
                customSkill.trim();

              setCustomSkills((prev) => [
                ...prev,
                newSkill,
              ]);

              setSkills((prev) => [
                ...prev,
                newSkill,
              ]);

              setCustomSkill("");
            }
          }}
        >
          Add +
        </button>
      </div>

      <label style={styles.label}>
        Open to being contacted by other Shapers?
      </label>

      <div style={styles.tagGrid}>
        <button
          type="button"
          style={{
            ...styles.tag,
            ...(openToConnect
              ? styles.tagSelected
              : {}),
          }}
          onClick={() => setOpenToConnect(true)}
        >
          Yes, reach out!
        </button>

        <button
          type="button"
          style={{
            ...styles.tag,
            ...(!openToConnect
              ? styles.tagSelected
              : {}),
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
        {loading
          ? "Saving..."
          : "Add me to the network →"}
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