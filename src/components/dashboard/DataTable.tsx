import React from 'react';
import { MetricTooltip } from '../ui/MetricTooltip';

interface Column {
    key: string;
    label: string;
    tooltip?: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
    return (
        <div className="bg-white border text-gray-900 border-gray-200 shadow-sm rounded-xl overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {columns.map((col, index) => (
                            <th
                                key={col.key}
                                className={`p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider ${index > 0 ? 'text-right' : ''}`}
                            >
                                <span className="inline-flex items-center justify-end gap-0">
                                    {col.label}
                                    {col.tooltip && <MetricTooltip metric={col.tooltip} />}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            {columns.map((col, colIndex) => {
                                const isGrowth = col.key.toLowerCase().includes('crescimento') || col.key.toLowerCase().includes('engajamento');
                                const cellValue = row[col.key];
                                const isPositive = typeof cellValue === 'number' ? cellValue > 0 : String(cellValue).includes('+');

                                return (
                                    <td
                                        key={`${rowIndex}-${col.key}`}
                                        className={`p-4 font-medium text-sm ${colIndex > 0 ? 'text-right' : ''}`}
                                    >
                                        {isGrowth && cellValue !== '-' ? (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {cellValue}{typeof cellValue === 'number' ? '%' : ''}
                                            </span>
                                        ) : (
                                            <span className="text-gray-900">{cellValue}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
