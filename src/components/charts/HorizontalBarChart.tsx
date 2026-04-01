import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DataItem {
    name: string;
    value: number;
    color?: string;
}

interface HorizontalBarChartProps {
    data: DataItem[];
    metricLabel?: string;
}

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B'];

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, metricLabel = 'interações' }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border text-gray-900 border-gray-200 p-3 shadow-md rounded-lg">
                    <p className="font-bold text-sm uppercase">{payload[0].payload.name}</p>
                    <p className="font-medium text-blue-600">
                        {payload[0].value.toLocaleString('pt-BR')} {metricLabel}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HorizontalBarChart;
