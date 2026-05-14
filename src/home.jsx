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
          <button style={styles.card} onClick={() => navigate("/form1")}>
            <span style={styles.cardTitle}>Share Your Issues</span>
            <span style={styles.cardDesc}>What's been on your mind?</span>
          </button>
          <button style={styles.card} onClick={() => navigate("/graphic1")}>
            <span style={styles.cardTitle}>See the Pressure Map</span>
            <span style={styles.cardDesc}>What's weighing on the room</span>
          </button>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <p style={styles.sectionLabel}>PART 2 — Connect & Solve</p>
        <div style={styles.cardRow}>
          <button style={styles.card} onClick={() => navigate("/form2")}>
            <span style={styles.cardTitle}>Share Your Skills</span>
            <span style={styles.cardDesc}>What can you offer the network?</span>
          </button>
          <button style={styles.card} onClick={() => navigate("/graphic2")}>
            <span style={styles.cardTitle}>See the Network</span>
            <span style={styles.cardDesc}>Who's connected to whom</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f1f17",
    padding: "48px 24px",
    fontFamily: "sans-serif",
    color: "#fff"
  },
  hero: {
    textAlign: "center",
    marginBottom: 48
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    margin: 0,
    color: "#fff"
  },
  subtitle: {
    color: "#a8d5b5",
    fontSize: 16,
    marginTop: 8
  },
  section: {
    maxWidth: 520,
    margin: "0 auto 32px"
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: "#52b788",
    marginBottom: 16,
    textTransform: "uppercase"
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16
  },
  card: {
    background: "#1b4332",
    border: "1.5px solid #2d6a4f",
    borderRadius: 16,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: "#fff",
    transition: "background 0.2s"
  },
  cardIcon: {
    fontSize: 32
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 15,
    textAlign: "center"
  },
  cardDesc: {
    fontSize: 12,
    color: "#a8d5b5",
    textAlign: "center"
  },
  divider: {
    maxWidth: 520,
    margin: "0 auto 32px",
    borderTop: "1px solid #2d6a4f"
  }
};