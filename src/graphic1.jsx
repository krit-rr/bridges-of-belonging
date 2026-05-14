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
      all.forEach(s => {
        s.issues?.forEach(issue => {
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

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const data = Object.entries(issueCounts).map(([issue, count]) => ({
      issue,
      count
    }));

    const pack = d3.pack()
      .size([width, height])
      .padding(20);

    const root = d3.hierarchy({ children: data })
      .sum(d => d.count);

    const nodes = pack(root).leaves();

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.issue))
      .range([
        "#2d6a4f", "#40916c", "#52b788",
        "#74c69d", "#95d5b2", "#b7e4c7",
        "#1b4332", "#081c15", "#d8f3dc", "#a8d5b5"
      ]);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        const matching = shapers.filter(s =>
          s.issues?.includes(d.data.issue)
        );
        setSelected({ issue: d.data.issue, count: d.data.count, shapers: matching });
      });

    node.append("circle")
      .attr("r", 0)
      .attr("fill", d => colorScale(d.data.issue))
      .attr("opacity", 0.85)
      .transition()
      .duration(600)
      .delay((d, i) => i * 60)
      .attr("r", d => d.r);

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "#fff")
      .attr("font-size", d => Math.max(10, d.r / 4))
      .attr("font-weight", "600")
      .style("pointer-events", "none")
      .text(d => d.r > 30 ? d.data.issue.split("/")[0].trim() : "");

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.1em")
      .attr("fill", "#fff")
      .attr("font-size", d => Math.max(10, d.r / 4))
      .style("pointer-events", "none")
      .text(d => d.r > 30 ? `${d.data.count} shaper${d.data.count !== 1 ? "s" : ""}` : "");

  }, [issueCounts]);

  return (
    <div style={{ background: "#0f1f17", minHeight: "100vh", position: "relative" }}>

      <div style={styles.header}>
        <h1 style={styles.title}>What's Weighing on Us</h1>
        <p style={styles.subtitle}>Bigger bubble = more Shapers feeling it · Click to see who</p>
      </div>

      <svg ref={svgRef} style={{ display: "block" }} />

      {selected && (
        <div style={styles.card}>
          <button style={styles.close} onClick={() => setSelected(null)}>✕</button>
          {/* // TODO: Edit What Shows */}
          <h2 style={styles.cardTitle}>{selected.issue}</h2>
          <p style={styles.cardCount}>{selected.count} Shaper{selected.count !== 1 ? "s" : ""} feeling this</p>
          <div style={styles.shaperList}>
            {selected.shapers.map((s, i) => (
              <div key={i} style={styles.shaperRow}>
                <div>
                  <p style={styles.shaperName}>{s.name}</p>
                  <p style={styles.shaperHub}>📍 {s.hub}</p>
                </div>
                <a
                    href={`mailto:${s.email}?subject=Bridges of Belonging&body=Hey ${
                        s.name.split(" ")[0]
                    }, I saw we're both feeling ${selected.issue} - would love to connect.`}
                    style={styles.reachOut}
                    >
                    Reach out
                    </a>
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
    pointerEvents: "none"
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    fontFamily: "sans-serif"
  },
  subtitle: {
    color: "#a8d5b5",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "sans-serif"
  },
  card: {
    position: "fixed",
    bottom: 32,
    right: 32,
    width: 340,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
    fontFamily: "sans-serif",
    zIndex: 100,
    maxHeight: "60vh",
    overflowY: "auto"
  },
  close: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#888"
  },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 700
  },
  cardCount: {
    color: "#2d6a4f",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 16
  },
  shaperList: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  shaperRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: 12
  },
  shaperName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14
  },
  shaperHub: {
    margin: "2px 0 0",
    color: "#888",
    fontSize: 12
  },
  reachOut: {
    background: "#2d6a4f",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap"
  }
};