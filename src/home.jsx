import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Bridges of Belonging - Town Hall</h1>
        <p style={styles.subtitle}>Northeast Hubs Retreat 2026</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>PART 1 — What's Wrong?</p>
        <div style={styles.cardRow}>
          <button style={styles.card} onClick={() => navigate("/bridges_of_belonging/#/form1")}>
            <span style={styles.cardTitle}>[Form] Share Your Issues</span>
            <span style={styles.cardDesc}>What's been on your mind?</span>
          </button>
          <button style={styles.card} onClick={() => navigate("/bridges_of_belonging/#/graphic1")}>
            <span style={styles.cardTitle}>[Visual] See the Pressure Map</span>
            <span style={styles.cardDesc}>What's weighing on the room?</span>
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <p style={styles.sectionLabel}>PART 2 — Connect & Solve</p>
        <div style={styles.cardRow}>
          <button style={styles.card} onClick={() => navigate("/bridges_of_belonging/#/form2")}>
            <span style={styles.cardTitle}>[Form] Share Your Skills</span>
            <span style={styles.cardDesc}>What can you offer the network?</span>
          </button>
          <button style={styles.card} onClick={() => navigate("/bridges_of_belonging/#/graphic2")}>
            <span style={styles.cardTitle}>[Visual] See the Network</span>
            <span style={styles.cardDesc}>Who can we connect? <br></br> What can we learn?</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "32px 24px",
    fontFamily: "'Inter', sans-serif",
    color: "#e8f4f8",
    position: "relative"
  },
  hero: {
    textAlign: "center",
    marginBottom: 64
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    margin: 0,
    color: "#fff",
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #e8f4f8 0%, #93c5fd 50%, #c4b5fd 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },
  subtitle: {
    color: "rgba(232, 244, 248, 0.5)",
    fontSize: 24,
    marginTop: 12,
    letterSpacing: "0.05em"
  },
  section: {
    maxWidth: 760,
    margin: "0 auto 56px"
  },
  sectionLabel: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "0.10em",
    color: "#93c5fd",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20
  },
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: "14px 18px",
    minHeight: 96,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: "#e8f4f8",
    transition: "all 0.2s ease",
    backdropFilter: "blur(12px)",
    boxShadow:
      "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 17,
    textAlign: "center",
    color: "#e8f4f8",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  },
  cardDesc: {
    fontSize: 14,
    color: "rgba(232, 244, 248, 0.45)",
    textAlign: "center",
    lineHeight: 1.25,
    maxWidth: 240,
  },
  divider: {
    maxWidth: 540,
    margin: "0 auto 40px",
    borderTop: "1px solid rgba(255,255,255,0.06)"
  }
};