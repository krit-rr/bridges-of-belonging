// import React from "react";
import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import * as d3 from "d3";

export default function Graphic2() {
  const [shapers, setShapers] = useState([]);
  const [selected, setSelected] = useState(null);
  const svgRef = useRef();

  // Listen for real-time Firebase updates
  useEffect(() => {
    const shapersRef = ref(db, "shapers");
    onValue(shapersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setShapers(Object.values(data));
    });
  }, []);

  // Build and render graph whenever shapers updates
  useEffect(() => {
    if (shapers.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // Build edges between shapers who share an issue or skill
    const links = [];
    for (let i = 0; i < shapers.length; i++) {
      for (let j = i + 1; j < shapers.length; j++) {
        const sharedIssues = shapers[i].issues?.filter(issue =>
          shapers[j].issues?.includes(issue)
        ) || [];
        const sharedSkills = shapers[i].skills?.filter(skill =>
          shapers[j].skills?.includes(skill)
        ) || [];
        if (sharedIssues.length > 0 || sharedSkills.length > 0) {
          links.push({
            source: i,
            target: j,
            shared: [...sharedIssues, ...sharedSkills]
          });
        }
      }
    }

    const nodes = shapers.map((s, i) => ({ ...s, id: i }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(50));

    // Draw edges
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#a8d5b5")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Draw nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => setSelected(d))
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    node.append("circle")
      .attr("r", 28)
      .attr("fill", "#2d6a4f")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.name.split(" ")[0])
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", 12)
      .attr("font-weight", "600")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

  }, [shapers]);

  return (
    <div style={{ background: "#0f1f17", minHeight: "100vh", position: "relative" }}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Bridges of Belonging</h1>
        <p style={styles.subtitle}>{shapers.length} Shaper{shapers.length !== 1 ? "s" : ""} in the network · Click any node to connect</p>
      </div>

      {/* Graph */}
      <svg ref={svgRef} style={{ display: "block" }} />

      {/* Profile card on click */}
      {selected && (
        <div style={styles.card}>
          <button style={styles.close} onClick={() => setSelected(null)}>✕</button>
          <h2 style={styles.cardName}>{selected.name}</h2>
          <p style={styles.cardHub}>📍 {selected.hub}</p>

          <p style={styles.cardLabel}>Weighing on them</p>
          <div style={styles.tagRow}>
            {selected.issues?.map(i => (
              <span key={i} style={styles.tagIssue}>{i}</span>
            ))}
          </div>

          {selected.skills?.length > 0 && (
            <div>
              <p style={styles.cardLabel}>They can offer</p>
              <div style={styles.tagRow}>
                {selected.skills.map(s => (
                  <span key={s} style={styles.tagSkill}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {selected.practice && (
            <div>
                <p style={styles.cardLabel}>What's helped them</p>
                <p style={styles.cardPractice}>"{selected.practice}"</p>
            </div>
            )}

            <a href={`mailto:${selected.email}?subject=Bridges of Belonging - Connecting from the Retreat&body=Hey ${
                selected.name.split(" ")[0]
            }, I saw we're both navigating some of the same things at the retreat — would love to connect.`}
            style={styles.emailBtn}
            >
            Reach out to {selected.name.split(" ")[0]} →
            </a>
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
    width: 320,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
    fontFamily: "sans-serif",
    zIndex: 100
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
  cardName: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 700
  },
  cardHub: {
    margin: "0 0 16px",
    color: "#555",
    fontSize: 14
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#888",
    margin: "12px 0 6px"
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6
  },
  tagIssue: {
    background: "#f0faf4",
    color: "#2d6a4f",
    border: "1px solid #a8d5b5",
    borderRadius: 12,
    padding: "4px 10px",
    fontSize: 12
  },
  tagSkill: {
    background: "#fff8e1",
    color: "#b45309",
    border: "1px solid #fcd34d",
    borderRadius: 12,
    padding: "4px 10px",
    fontSize: 12
  },
  cardPractice: {
    fontStyle: "italic",
    color: "#444",
    fontSize: 14,
    lineHeight: 1.5
  },
  emailBtn: {
    display: "block",
    marginTop: 20,
    background: "#2d6a4f",
    color: "#fff",
    textAlign: "center",
    padding: "12px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14
  }
};