import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import * as d3 from "d3";

const HUB_COLORS = [
  "#60a5fa",
  "#818cf8",
  "#a78bfa",
  "#38bdf8",
  "#22d3ee",
  "#93c5fd",
  "#c4b5fd",
  "#7dd3fc",
  "#2563eb",
];

export default function Graphic2() {
  const [shapers, setShapers] = useState([]);
  const [selected, setSelected] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    const shapersRef = ref(db, "shapers");

    onValue(shapersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setShapers(Object.values(data));
    });
  }, []);

  useEffect(() => {
    if (shapers.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const centerX = width / 2 + 40;
    const centerY = height / 2 + 20;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const links = [];

    for (let i = 0; i < shapers.length; i++) {
      for (let j = i + 1; j < shapers.length; j++) {
        const sharedIssues =
          shapers[i].issues?.filter((issue) =>
            shapers[j].issues?.includes(issue)
          ) || [];

        const sharedSkills =
          shapers[i].skills?.filter((skill) =>
            shapers[j].skills?.includes(skill)
          ) || [];

        if (sharedIssues.length > 0 || sharedSkills.length > 0) {
          links.push({
            source: i,
            target: j,
            shared: [...sharedIssues, ...sharedSkills],
          });
        }
      }
    }

    const connectionCount = {};

    links.forEach((l) => {
      connectionCount[l.source] =
        (connectionCount[l.source] || 0) + 1;

      connectionCount[l.target] =
        (connectionCount[l.target] || 0) + 1;
    });

    const nodes = shapers.map((s, i) => ({
      ...s,
      id: i,
      connections: connectionCount[i] || 0,
    }));

    const hubs = [...new Set(shapers.map((s) => s.hub))];

    const colorScale = d3
      .scaleOrdinal()
      .domain(hubs)
      .range(HUB_COLORS);

    const nodeRadius = (d) => 20 + d.connections * 4;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id).distance(140)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(centerX, centerY))
      .force(
        "collision",
        d3.forceCollide((d) => nodeRadius(d) + 6)
      )
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05));

    // LINKS
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(147, 197, 253, 0.35)")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0)
      .transition()
      .duration(1200)
      .attr("stroke-opacity", 0.35);

    // NODES
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => setSelected(d))
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active)
              simulation.alphaTarget(0.3).restart();

            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active)
              simulation.alphaTarget(0);

            d.fx = null;
            d.fy = null;
          })
      );

    // Pulse Ring
    node
      .append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", "none")
      .attr("stroke", (d) => colorScale(d.hub))
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 80)
      .attr("r", (d) => nodeRadius(d) + 14)
      .attr("opacity", 0)
      .ease(d3.easeExpOut);

    // Main Circle
    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => colorScale(d.hub))
      .attr("stroke", "rgba(255,255,255,0.8)")
      .attr("stroke-width", 2)
      .attr(
        "filter",
        "drop-shadow(0 0 12px rgba(0,0,0,0.35))"
      )
      .transition()
      .duration(500)
      .delay((d, i) => i * 80)
      .attr("r", (d) => nodeRadius(d))
      .ease(d3.easeBounceOut);

    // Labels
    node
      .append("text")
      .text(d => {
        const firstName = d.name.split(" ")[0];
        const maxChars = Math.floor(nodeRadius(d) / 5);
        return firstName.length > maxChars ? firstName.slice(0, maxChars) + "…" : firstName;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", d => Math.min(13, nodeRadius(d) / 2.5))
      .attr("font-weight", "600")
      .attr("font-family", "Inter, sans-serif")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      nodes.forEach((d) => {
        const r = nodeRadius(d);

        d.x = Math.max(
          300,
          Math.min(width - 220, d.x)
        );

        d.y = Math.max(
          80 + r,
          Math.min(height - r - 20, d.y)
        );
      });

      svg
        .selectAll("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr(
        "transform",
        (d) => `translate(${d.x},${d.y})`
      );
    });

    return () => simulation.stop();
  }, [shapers]);

  const hubs = [...new Set(shapers.map((s) => s.hub))];

  const emailHref = selected
    ? `mailto:${selected.email}?subject=Bridges of Belonging - Connecting from the Retreat&body=Hey ${
        selected.name.split(" ")[0]
      }, I saw we're both navigating some of the same things at the retreat - would love to connect.`
    : "#";

  return (
    <div
      style={{
        background: "#020b18",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          Bridges of Belonging
        </h1>

        <p style={styles.subtitle}>
          {shapers.length} Shaper
          {shapers.length !== 1 ? "s" : ""} in the
          network · Click any node to connect
        </p>
      </div>

      <svg
        ref={svgRef}
        style={{ display: "block" }}
      />

      {/* Sidebar */}
      {(shapers.some((s) => s.practice) ||
        shapers.some((s) => s.link)) && (
        <div style={styles.sidebar}>
          {shapers.some((s) => s.practice) && (
            <div>
              <h3 style={styles.sidebarTitle}>
                Your Tips
              </h3>

              <div style={styles.practiceList}>
                {shapers
                  .filter((s) => s.practice)
                  .map((s, i) => (
                    <div
                      key={i}
                      style={styles.practiceItem}
                    >
                      <p style={styles.practiceText}>
                        "{s.practice}"
                      </p>

                      <p style={styles.practiceName}>
                        — {s.name}, {s.hub}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {shapers.some((s) => s.link) && (
            <div style={{ marginTop: 24 }}>
              <h3 style={styles.sidebarTitle}>
                Resources Shared
              </h3>

              <div style={styles.practiceList}>
                {shapers
                  .filter((s) => s.link)
                  .map((s, i) => (
                    <div
                      key={i}
                      style={styles.practiceItem}
                    >
                      <a
                        href={
                          s.link.startsWith("http")
                            ? s.link
                            : `https://${s.link}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={styles.resourceLink}
                      >
                        {s.link}
                      </a>

                      <p style={styles.practiceName}>
                        — {s.name}, {s.hub}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {hubs.length > 0 && (
        <div style={styles.legend}>
          <p style={styles.legendTitle}>Hubs</p>

          {hubs.map((hub, i) => (
            <div
              key={hub}
              style={styles.legendItem}
            >
              <div
                style={{
                  ...styles.legendDot,
                  background:
                    HUB_COLORS[
                      i % HUB_COLORS.length
                    ],
                }}
              />

              <span style={styles.legendLabel}>
                {hub}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Profile Card */}
      {selected && (
        <div style={styles.card}>
          <button
            style={styles.close}
            onClick={() => setSelected(null)}
          >
            ✕
          </button>

          <h2 style={styles.cardName}>
            {selected.name}
          </h2>

          <p style={styles.cardHub}>
            📍 {selected.hub}
          </p>

          <p style={styles.cardLabel}>
            Weighing on them
          </p>

          <div style={styles.tagRow}>
            {selected.issues?.map((i) => (
              <span
                key={i}
                style={styles.tagIssue}
              >
                {i}
              </span>
            ))}
          </div>

          {selected.skills?.length > 0 && (
            <div>
              <p style={styles.cardLabel}>
                They can offer
              </p>

              <div style={styles.tagRow}>
                {selected.skills.map((s) => (
                  <span
                    key={s}
                    style={styles.tagSkill}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selected.practice && (
            <div>
              <p style={styles.cardLabel}>
                What's helped them
              </p>

              <p style={styles.cardPractice}>
                "{selected.practice}"
              </p>
            </div>
          )}

          {selected.link && (
            <div>
              <p style={styles.cardLabel}>
                Resource they shared
              </p>

              <a
                href={
                  selected.link.startsWith("http")
                    ? selected.link
                    : `https://${selected.link}`
                }
                target="_blank"
                rel="noreferrer"
                style={styles.resourceLink}
              >
                {selected.link}
              </a>
            </div>
          )}

          {selected.openToConnect !== false ? (
            <a
              href={emailHref}
              style={styles.emailBtn}
            >
              Reach out to{" "}
              {selected.name.split(" ")[0]} →
            </a>
          ) : (
            <p style={styles.notConnecting}>
              Not available to connect right now
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
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

  sidebar: {
    position: "fixed",
    top: 80,
    left: 24,
    width: 240,
    background: "rgba(5, 20, 40, 0.8)",
    backdropFilter: "blur(16px)",
    borderRadius: 20,
    padding: 20,
    zIndex: 50,
    maxHeight: "70vh",
    overflowY: "auto",
    border:
      "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.4)",
  },

  sidebarTitle: {
    color: "rgba(232, 244, 248, 0.45)",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    margin: "0 0 16px",
  },

  practiceList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  practiceItem: {
    borderLeft:
      "2px solid rgba(147, 197, 253, 0.5)",
    paddingLeft: 12,
  },

  practiceText: {
    color: "#e8f4f8",
    fontSize: 13,
    fontStyle: "italic",
    margin: "0 0 4px",
    lineHeight: 1.5,
  },

  practiceName: {
    color: "rgba(232, 244, 248, 0.5)",
    fontSize: 11,
    margin: 0,
  },

  resourceLink: {
    color: "#93c5fd",
    fontSize: 12,
    wordBreak: "break-all",
    textDecoration: "underline",
  },

  legend: {
    position: "fixed",
    top: 80,
    right: 24,
    background: "rgba(5, 20, 40, 0.8)",
    backdropFilter: "blur(16px)",
    borderRadius: 16,
    padding: "16px 20px",
    zIndex: 50,
    border:
      "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.4)",
  },

  legendTitle: {
    color: "rgba(232, 244, 248, 0.45)",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    margin: "0 0 12px",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },

  legendLabel: {
    color: "#e8f4f8",
    fontSize: 13,
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
    border:
      "1px solid rgba(255, 255, 255, 0.1)",
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

  cardName: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 700,
    color: "#e8f4f8",
  },

  cardHub: {
    margin: "0 0 16px",
    color: "rgba(232, 244, 248, 0.5)",
    fontSize: 14,
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(232, 244, 248, 0.35)",
    margin: "14px 0 8px",
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },

  tagIssue: {
    background:
      "rgba(147, 197, 253, 0.1)",
    color: "#93c5fd",
    border:
      "1px solid rgba(147, 197, 253, 0.25)",
    borderRadius: 12,
    padding: "4px 10px",
    fontSize: 12,
  },

  tagSkill: {
    background:
      "rgba(196, 181, 253, 0.1)",
    color: "#c4b5fd",
    border:
      "1px solid rgba(196, 181, 253, 0.25)",
    borderRadius: 12,
    padding: "4px 10px",
    fontSize: 12,
  },

  cardPractice: {
    fontStyle: "italic",
    color: "rgba(232,244,248,0.8)",
    fontSize: 14,
    lineHeight: 1.6,
  },

  emailBtn: {
    display: "block",
    marginTop: 20,
    background:
      "linear-gradient(135deg, #1e40af, #6d28d9)",
    color: "#fff",
    textAlign: "center",
    padding: "12px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    boxShadow:
      "0 4px 16px rgba(109, 40, 217, 0.3)",
  },

  notConnecting: {
    marginTop: 20,
    textAlign: "center",
    color: "rgba(232,244,248,0.45)",
    fontSize: 13,
    fontStyle: "italic",
  },
};