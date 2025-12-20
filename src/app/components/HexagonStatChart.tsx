
import { useTranslation } from "@/hooks/useTranslation";

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
  const t = useTranslation();
  const size = 300;
  const center = size / 2;
  const radius = 100;
  
  const maxStatValue = Math.max(
    stats.serve,
    stats.attack,
    stats.set,
    stats.receive,
    stats.block,
    stats.defense
  );
  
  const maxStat = maxStatValue > 0 ? maxStatValue : 100;
  
  const statConfig = [
    { key: 'serve', label: t.modal.stats.serve, value: stats.serve },
    { key: 'attack', label: t.modal.stats.attack, value: stats.attack },
    { key: 'set', label: t.modal.stats.set, value: stats.set },
    { key: 'receive', label: t.modal.stats.receive, value: stats.receive },
    { key: 'block', label: t.modal.stats.block, value: stats.block },
    { key: 'defense', label: t.modal.stats.defense, value: stats.defense },
  ];

  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const normalizedValue = Math.min(value / maxStat, 1);
    const r = normalizedValue * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getLabelPoint = (index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const labelRadius = radius + 35;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  
  const dataPoints = statConfig.map((stat, i) => getPoint(stat.value, i, statConfig.length));
  const dataPath = dataPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ') + ' Z';

  return (
    <div className="hexagon-chart-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '300px' }}>
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

        <path
          d={dataPath}
          fill="rgba(6, 182, 212, 0.2)"
          stroke="#06b6d4"
          strokeWidth="2"
        />

        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#06b6d4"
          />
        ))}

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
                fill="#a1a1aa"
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
