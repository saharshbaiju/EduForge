import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./heatmap.css";

export default function Heatmap({ username }) {
  const [data, setData] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!username) return;

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:5000/streak/${username}`);
        if (!res.ok) throw new Error("API error");

        const result = await res.json();

        const formatted = result.dates.map(d => ({
          date: new Date(d).toISOString().split("T")[0],
          count: 1
        }));

        setData(formatted);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [username]);

  const currentYear = new Date().getFullYear();

  const handleMouseMove = (e) => {
    if (e.target.tagName === "rect" && e.target.getAttribute("class")) {
      const dataDate = e.target.getAttribute("data-date");
      
      if (dataDate) {
        setHoveredDate(dataDate);
        setTooltipPos({
          x: e.clientX,
          y: e.clientY
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  return (
    <div className="heatmap-wrapper">
      <h2 className="heatmap-title">Login Activity</h2>

      <div 
        className="heatmap-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <CalendarHeatmap
          startDate={new Date(currentYear, 0, 1)}
          endDate={new Date(currentYear, 11, 31)}
          values={data}
          gutterSize={2}
          showWeekdayLabels={true}
          showMonthLabels={true}
          classForValue={(value) => {
            if (!value) return "color-empty";
            return "color-scale-1";
          }}
          titleForValue={(value) => {
            if (!value) return "No activity";
            return value.date;
          }}
        />
      </div>

      {hoveredDate && (
        <div 
          className="heatmap-tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 40}px`
          }}
        >
          {new Date(hoveredDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      )}
    </div>
  );
}