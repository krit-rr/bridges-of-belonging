import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import * as d3 from "d3";

export default function Graphic1() {
  const [issueCounts, setIssueCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [shapers, setShapers] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    const shapersRef = ref(db, "shapers");

    onValue(shapersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const all = Object.values(data);
      setShapers(all);

      const counts = {};

      all.forEach((s) => {
        s.issues?.forEach((issue) => {
          counts[issue] = (counts[issue] || 0) + 1;
        });
      });

      setIssueCounts(counts);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(issueCounts).length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const data = Object.entries(issueCounts).map(([issue, count]) => ({
      issue,
      count,
    }));

    const pack = d3.pack().size([width, height]).padding(20);

    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.count);

    const nodes = pack(root).leaves();

    const colorScale = d3.scaleOrdinal().domain(data.map((d) => d.issue))
    .range([
      "#60a5fa",
      "#818cf8",
      "#a78bfa",
      "#38bdf8",
      "#22d3ee",
      "#93c5fd",
      "#c4b5fd",
      "#7dd3fc",
      "#2563eb",
      "#6d28d9",
    ]);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        const matching = shapers.filter((s) =>
          s.issues?.includes(d.data.issue)
        );

        setSelected({
          issue: d.data.issue,
          count: d.data.count,
          shapers: matching,
        });
      });

    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => colorScale(d.data.issue))
      .attr("opacity", 0.85)
      .transition()
      .duration(600)
      .delay((d, i) => i * 60)
      .attr("r", (d) => d.r);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "#fff")
      .attr("font-size", d => Math.min(14, d.r / 4))
      .attr("font-weight", "600")
      .attr("font-family", "Inter, sans-serif")
      .style("pointer-events", "none")
      .text(d => {
        if (d.r < 30) return "";
        const label = d.data.issue.split("/")[0].trim();
        const maxChars = Math.floor(d.r / 4);
        return label.length > maxChars ? label.slice(0, maxChars) + "…" : label;
      });
  node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.1em")
    .attr("fill", "rgba(255,255,255,0.75)")
    .attr("font-size", d => Math.min(12, d.r / 5))
    .attr("font-family", "Inter, sans-serif")
    .style("pointer-events", "none")
    .text(d => d.r > 30 ? `${d.data.count} shaper${d.data.count !== 1 ? "s" : ""}` : "");
  }, [issueCounts, shapers]);

  return (
    <div
      style={{
        background: "#020b18",
        minHeight: "100vh",
        position: "relative",
      }}
    >
    
    <div style={styles.bgGlow1} />
    <div style={styles.bgGlow2} />

      <div style={styles.header}>
        <h1 style={styles.title}>What's Weighing on Us</h1>

        <p style={styles.subtitle}>
          Click to learn more information.
        </p>
      </div>

      <svg ref={svgRef} style={{ display: "block" }} />

      {selected && (
        <div style={styles.card}>
          <button
            style={styles.close}
            onClick={() => setSelected(null)}
          >
            ✕
          </button>

          <h2 style={styles.cardTitle}>{selected.issue}</h2>

          <p style={styles.cardCount}>
            {selected.count} Shaper
            {selected.count !== 1 ? "s" : ""} feeling this
          </p>

          <p style={styles.sectionLabel}>By Hub</p>

          <div style={styles.hubList}>
            {Object.entries(
              selected.shapers.reduce((acc, s) => {
                acc[s.hub] = (acc[s.hub] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .map(([hub, count]) => (
                <div key={hub} style={styles.hubRow}>
                  <span style={styles.hubName}>
                    📍 {hub}
                  </span>

                  <span style={styles.hubCount}>
                    {count} shaper
                    {count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 10,
    pointerEvents: "none",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    background:
      "linear-gradient(135deg, #e8f4f8 0%, #93c5fd 50%, #c4b5fd 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  subtitle: {
    color: "rgba(232, 244, 248, 0.45)",
    fontSize: 14,
    marginTop: 6,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.03em",
  },

  card: {
    position: "fixed",
    bottom: 32,
    right: 32,
    width: 300,
    background: "rgba(5, 20, 40, 0.92)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    padding: 24,
    boxShadow:
      "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
    fontFamily: "'Inter', sans-serif",
    zIndex: 100,
    maxHeight: "55vh",
    overflowY: "auto",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e8f4f8",
  },

  close: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "rgba(232,244,248,0.5)",
  },

  cardTitle: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 700,
    color: "#e8f4f8",
  },

  cardCount: {
    color: "#93c5fd",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(232, 244, 248, 0.35)",
    margin: "14px 0 8px",
  },

  hubList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  hubRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  hubName: {
    fontWeight: 500,
    fontSize: 14,
    color: "#e8f4f8",
  },

  hubCount: {
    color: "#93c5fd",
    fontWeight: 600,
    fontSize: 13,
  },

  shaperList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  shaperRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 12,
  },

  shaperName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#e8f4f8",
  },

  shaperHub: {
    margin: "2px 0 0",
    color: "rgba(232,244,248,0.5)",
    fontSize: 12,
  },

  reachOut: {
    background: "linear-gradient(135deg, #1e40af, #6d28d9)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
    boxShadow: "0 4px 16px rgba(109, 40, 217, 0.3)",
  },
  bgGlow1: {
    position: "absolute",
    top: -200,
    left: -150,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(59,130,246,0.18)",
    filter: "blur(120px)",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: -200,
    right: -150,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(139,92,246,0.18)",
    filter: "blur(120px)",
    pointerEvents: "none",
  },
};