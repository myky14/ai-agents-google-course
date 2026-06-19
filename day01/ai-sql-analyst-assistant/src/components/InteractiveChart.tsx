import { useState } from "react";

interface ChartProps {
  visualization: {
    chartType: "bar" | "line" | "pie" | "area";
    title: string;
    labelKey: string;
    valueKey: string;
    data: Array<any>;
  };
}

export default function InteractiveChart({ visualization }: ChartProps) {
  const { chartType, title, labelKey, valueKey, data } = visualization;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No chart data available</p>
      </div>
    );
  }

  // Extract raw values and labels
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const labels = data.map((d) => String(d[labelKey] || ""));
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  // SVG dimensions
  const width = 500;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Render helper functions
  const getX = (index: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxValue - minValue;
    const ratio = (val - minValue) / range;
    return paddingY + chartHeight - ratio * chartHeight;
  };

  // Pre-calculated colors for charts
  const colors = [
    "from-indigo-500 to-indigo-600",
    "from-emerald-500 to-emerald-600",
    "from-sky-500 to-sky-600",
    "from-violet-500 to-violet-600",
    "from-amber-500 to-amber-600",
    "from-rose-500 to-rose-600",
    "from-teal-500 to-teal-600",
    "from-fuchsia-500 to-fuchsia-600",
  ];

  const hexColors = [
    "#6366f1", // indigo-500
    "#10b981", // emerald-500
    "#0ea5e9", // sky-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#f43f5e", // rose-500
    "#14b8a6", // teal-500
    "#d946ef", // fuchsia-500
  ];

  // Draw specific chart types
  const renderBarChart = () => {
    const barWidth = Math.min(chartWidth / data.length * 0.6, 40);
    const spacing = chartWidth / data.length;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans">
        {/* Draw subtle horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minValue + (maxValue - minValue) * p;
          const y = getY(val);
          return (
            <g key={i} className="opacity-30">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-gray-400"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X Axis division labels */}
        {data.map((_, i) => {
          const x = paddingX + i * spacing + spacing / 2;
          const label = labels[i];
          const truncatedLabel = label.length > 8 ? label.slice(0, 7) + ".." : label;
          return (
            <text
              key={i}
              x={x}
              y={height - paddingY + 16}
              textAnchor="middle"
              className="text-[10px] fill-gray-500 font-medium"
            >
              {truncatedLabel}
            </text>
          );
        })}

        {/* Draw Bars */}
        {data.map((item, i) => {
          const x = paddingX + i * spacing + (spacing - barWidth) / 2;
          const yVal = values[i];
          const y = getY(yVal);
          const barHeight = height - paddingY - y;
          const isHovered = hoveredIndex === i;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 3)}
              rx={4}
              ry={4}
              fill={hexColors[i % hexColors.length]}
              className="transition-all duration-200 cursor-pointer origin-bottom"
              style={{
                opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                transform: isHovered ? "scaleY(1.03)" : "none",
                transformOrigin: "bottom",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>
    );
  };

  const renderLineChart = () => {
    // Generate SVG points
    const points = data
      .map((_, i) => `${getX(i)},${getY(values[i])}`)
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans">
        {/* Draw subtle grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minValue + (maxValue - minValue) * p;
          const y = getY(val);
          return (
            <g key={i} className="opacity-30">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-gray-400"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((_, i) => {
          const x = getX(i);
          const label = labels[i];
          const truncatedLabel = label.length > 8 ? label.slice(0, 7) + ".." : label;
          return (
            <text
              key={i}
              x={x}
              y={height - paddingY + 16}
              textAnchor="middle"
              className="text-[10px] fill-gray-500 font-medium"
            >
              {truncatedLabel}
            </text>
          );
        })}

        {/* Simple Polyline representing data */}
        <polyline
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Circular markers on points */}
        {data.map((item, i) => {
          const x = getX(i);
          const y = getY(values[i]);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 8 : 5}
                className="transition-all duration-200 fill-indigo-600 stroke-white stroke-2 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="#4f46e5"
                  className="animate-ping opacity-25 pointer-events-none"
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderAreaChart = () => {
    // Generate path for the line
    const valPoints = data.map((_, i) => ({ x: getX(i), y: getY(values[i]) }));
    if (valPoints.length === 0) return null;

    const linePath = valPoints.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    // Path for the filled area (stretching to the bottom baseline)
    const areaPath = `
      ${linePath} 
      L ${valPoints[valPoints.length - 1].x} ${height - paddingY} 
      L ${valPoints[0].x} ${height - paddingY} 
      Z
    `;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Draw grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minValue + (maxValue - minValue) * p;
          const y = getY(val);
          return (
            <g key={i} className="opacity-30">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-gray-400"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {data.map((_, i) => {
          const x = getX(i);
          const label = labels[i];
          const truncatedLabel = label.length > 8 ? label.slice(0, 7) + ".." : label;
          return (
            <text
              key={i}
              x={x}
              y={height - paddingY + 16}
              textAnchor="middle"
              className="text-[10px] fill-gray-500 font-medium"
            >
              {truncatedLabel}
            </text>
          );
        })}

        {/* Filled gradient area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line separator */}
        <path
          d={linePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circle bullets */}
        {data.map((item, i) => {
          const x = getX(i);
          const y = getY(values[i]);
          const isHovered = hoveredIndex === i;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isHovered ? 7 : 4.5}
              className="transition-all duration-200 fill-emerald-600 stroke-white stroke-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>
    );
  };

  const renderDonutChart = () => {
    const total = values.reduce((sum, v) => sum + v, 0);
    const centerX = width / 2 - 60;
    const centerY = height / 2;
    const outerRadius = 80;
    const innerRadius = 52;

    let accumulatedAngle = 0;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans">
        {total === 0 ? (
          <text x={centerX} y={centerY} textAnchor="middle" className="text-xs fill-gray-400">
            Empty Dataset
          </text>
        ) : (
          data.map((item, i) => {
            const val = values[i];
            const percent = val / total;
            const angle = percent * 360;

            // Compute arc coords
            const startAngle = accumulatedAngle;
            const endAngle = accumulatedAngle + angle;
            accumulatedAngle += angle;

            const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

            const x1_out = centerX + outerRadius * Math.cos(degToRad(startAngle));
            const y1_out = centerY + outerRadius * Math.sin(degToRad(startAngle));
            const x2_out = centerX + outerRadius * Math.cos(degToRad(endAngle));
            const y2_out = centerY + outerRadius * Math.sin(degToRad(endAngle));

            const x1_in = centerX + innerRadius * Math.cos(degToRad(endAngle));
            const y1_in = centerY + innerRadius * Math.sin(degToRad(endAngle));
            const x2_in = centerX + innerRadius * Math.cos(degToRad(startAngle));
            const y2_in = centerY + innerRadius * Math.sin(degToRad(startAngle));

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = `
              M ${x1_out} ${y1_out}
              A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out}
              L ${x1_in} ${y1_in}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2_in} ${y2_in}
              Z
            `;

            const isHovered = hoveredIndex === i;

            return (
              <path
                key={i}
                d={pathData}
                fill={hexColors[i % hexColors.length]}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  transformOrigin: `${centerX}px ${centerY}px`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })
        )}

        {/* Legend Panel on the Right Side of the SVG */}
        <g transform={`translate(${width / 2 + 50}, ${paddingY})`}>
          {data.map((item, i) => {
            const val = values[i];
            const percent = total > 0 ? (val / total) * 100 : 0;
            const label = labels[i];
            const truncatedLabel = label.length > 14 ? label.slice(0, 12) + ".." : label;

            return (
              <g key={i} transform={`translate(0, ${i * 22})`} className="cursor-pointer"
                 onMouseEnter={() => setHoveredIndex(i)}
                 onMouseLeave={() => setHoveredIndex(null)}>
                <rect
                  width="12"
                  height="12"
                  rx="3"
                  fill={hexColors[i % hexColors.length]}
                  style={{ opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6 }}
                />
                <text
                  x="18"
                  y="10"
                  className="text-xs font-medium fill-slate-700 hover:fill-indigo-600 transition-colors"
                >
                  {truncatedLabel}
                </text>
                <text
                  x="130"
                  y="10"
                  textAnchor="end"
                  className="text-xs font-mono fill-slate-400"
                >
                  {percent.toFixed(0)}%
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const getChartRenderer = () => {
    switch (chartType) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "area":
        return renderAreaChart();
      case "pie":
        return renderDonutChart();
      default:
        return renderBarChart();
    }
  };

  const getChartBadgeStyle = () => {
    switch (chartType) {
      case "bar":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "line":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "area":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pie":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex border-b border-slate-50 pb-4 mb-4 items-start justify-between">
        <div>
          <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider mb-1">
            Recomended Visualization
          </span>
          <h4 className="text-base font-semibold text-slate-800 tracking-tight">
            {title}
          </h4>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wide px-2 ${getChartBadgeStyle()}`}
        >
          {chartType === "pie" ? "donut" : chartType} chart
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {/* Render SVG */}
        <div className="relative flex items-center justify-center p-2">
          {getChartRenderer()}

          {/* Floating Tooltip Indicator */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-950/95 backdrop-blur text-white py-2 px-3.5 rounded-xl shadow-lg border border-slate-800/80 pointer-events-none text-xs transition-opacity duration-150 animate-in fade-in-50">
              <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-0.5">
                {String(data[hoveredIndex][labelKey] || "Category")}
              </span>
              <span className="font-semibold text-white tracking-wide">
                {valueKey.replace(/_/g, " ").toUpperCase()}:{" "}
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  {Number(data[hoveredIndex][valueKey] || 0).toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Mini Table Summary of Mock Data */}
        <div className="mt-4 bg-slate-50 rounded-xl p-3">
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-2">
            Simulated Query Output Rows ({data.length})
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {data.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                <span className="text-slate-600 truncate max-w-[100px]" title={String(item[labelKey])}>
                  {String(item[labelKey])}
                </span>
                <span className="text-slate-900 font-semibold text-right">
                  {Number(item[valueKey]).toLocaleString()}
                </span>
              </div>
            ))}
            {data.length > 3 && (
              <div className="col-span-2 text-center text-[10px] text-slate-400 pt-1">
                + {data.length - 3} more rows simulated in viewport
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
