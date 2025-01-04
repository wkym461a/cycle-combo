import { CSSProperties } from 'react';

type Props = {
	value: number,
	style?: CSSProperties,
}

function Progress({ value, style }: Props) {
  // SVGの描画サイズ
  const size = 120;
  // 円の半径
  const radius = 50;
  // 円周
  const circumference = 2 * Math.PI * radius;
  // 表示割合
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div style={style}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }} // そのままだと3時の方向が起点になってしまうので-90°回転させてます
      >
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="#4169e1"
          strokeWidth="5"
          fill="#FFFFFF00"
          // strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};

export default Progress;
