'use client';
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const safeFixed = (val) => (typeof val === 'number' && !isNaN(val) ? val.toFixed(2) : '0.00');

    return (
      <div className="bg-white p-3 shadow-lg rounded border border-gray-200">
        <p className="font-bold text-gray-800">{data.ticker}</p>
        <div className="text-xs text-gray-600 space-y-1">
          {data.userHoldings && data.userHoldings.map((uh, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span>{uh.user}:</span>
              <span className="font-medium">{safeFixed(uh.value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 font-bold text-gray-900">
          Total: ${safeFixed(data.value)}
        </div>
      </div>
    );
  }
  return null;
};

const RenderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const PortfolioPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleMouseEnter = (event, index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 40;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="currentColor" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium hidden lg:block"
      >
        {`${payload.ticker} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  return (
    <div className="w-full h-[600px] rounded-lg shadow p-6 mb-8 transition-colors duration-300 overflow-hidden relative" style={{ backgroundColor: 'var(--table-bg)', color: 'var(--foreground)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={RenderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            label={renderCustomizedLabel}
            animationBegin={0}
            animationDuration={400}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="lg:hidden absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-32 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="truncate">{entry.ticker}</span>
          </div>
        ))}
      </div>
    </div>
  );
  };


export default PortfolioPieChart;
