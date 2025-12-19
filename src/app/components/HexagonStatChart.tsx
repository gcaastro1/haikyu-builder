
type Stat = {
  label: string;
  value: number;
  key: string;
};

type HexagonStatChartProps = {
  stats: {
    serve: number;
    attack: number;
    set: number;
    receive: number;
    block: number;
    defense: number;
  };
};

export function HexagonStatChart({ stats }: HexagonStatChartProps) {
  // Configuration
  const size = 300; // SVG size
  const center = size / 2;
  const radius = 100; // Radius of the chart
  
  // Calculate max stat dynamically
  const maxStatValue = Math.max(
    stats.serve,
    stats.attack,
    stats.set,
    stats.receive,
    stats.block,
    stats.defense
  );
  
  // Ensure we have a valid maxStat (avoid division by zero if all stats are 0)
  // Also add a tiny buffer if desired, but user asked for "closest to corners", so exact max is best.
  // If max is 0, default to something like 100 to avoid issues.
  const maxStat = maxStatValue > 0 ? maxStatValue : 100;
  
  // Order of stats to match the visual reference (Clockwise starting from top)
  // Reference image order seems to be: Serve (Top), Spike (TR), Set (BR), Receive (Bottom), Block (BL), Save (TL)
  // Our stats: Serve, Attack, Set, Receive, Block, Defense
  const statConfig = [
    { key: 'serve', label: 'Serve', value: stats.serve },
    { key: 'attack', label: 'Spike', value: stats.attack },
    { key: 'set', label: 'Set', value: stats.set },
    { key: 'receive', label: 'Receive', value: stats.receive },
    { key: 'block', label: 'Block', value: stats.block },
    { key: 'defense', label: 'Save', value: stats.defense },
  ];

  // Helper to calculate points
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2; // Start at -90deg (top)
    const normalizedValue = Math.min(value / maxStat, 1);
    const r = normalizedValue * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Helper to calculate label points (slightly outside radius)
  const getLabelPoint = (index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const labelRadius = radius + 35; // Distance for labels
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  // Generate grid points (concentric hexagons)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  
  // Generate data polygon points
  const dataPoints = statConfig.map((stat, i) => getPoint(stat.value, i, statConfig.length));
  const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + ' Z';

  return (
    <div className="hexagon-chart-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grids */}
        {gridLevels.map((level, lvlIndex) => {
          const points = statConfig.map((_, i) => {
            const angle = (Math.PI * 2 * i) / statConfig.length - Math.PI / 2;
            const r = radius * level;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <polygon
              key={lvlIndex}
              points={points}
              fill={lvlIndex === gridLevels.length - 1 ? "rgba(24, 24, 27, 0.5)" : "none"}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Lines */}
        {statConfig.map((_, i) => {
          const angle = (Math.PI * 2 * i) / statConfig.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <path
          d={dataPath}
          fill="rgba(6, 182, 212, 0.2)" // Cyan-500 with opacity
          stroke="#06b6d4" // Cyan-500
          strokeWidth="2"
        />

        {/* Data Points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#06b6d4"
          />
        ))}

        {/* Labels and Values */}
        {statConfig.map((stat, i) => {
          const p = getLabelPoint(i, statConfig.length);
          const isLeft = p.x < center;
          const isRight = p.x > center;
          
          return (
            <g key={i} transform={`translate(${p.x}, ${p.y})`}>
              <text
                x="0"
                y="-6"
                textAnchor="middle"
                fill="#a1a1aa" // Zinc-400
                fontSize="12"
                fontWeight="500"
              >
                {stat.label}
              </text>
              <text
                x="0"
                y="8"
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
              >
                {stat.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
