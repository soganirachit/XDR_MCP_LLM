import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ThesysComponent } from '../types';

interface ThesysRendererProps {
  component: ThesysComponent;
}

const ThesysRenderer: React.FC<ThesysRendererProps> = ({ component }) => {
  switch (component.type) {
    case 'text':
      return (
        <div className="prose prose-invert max-w-none">
          <p>{component.data.text}</p>
        </div>
      );

    case 'alert-cards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {component.data.alerts?.map((alert: any, index: number) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-4 border-l-4"
              style={{
                borderLeftColor: component.config?.severityColors?.[alert.severity] || '#3b82f6'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: component.config?.severityColors?.[alert.severity] || '#3b82f6',
                        color: 'white'
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-400">Rule: {alert.rule_id}</span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">{alert.description}</p>
                  <p className="text-xs text-slate-400">Agent: {alert.agent}</p>
                </div>
              </div>
              {alert.timestamp && (
                <div className="mt-2 text-xs text-slate-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'agent-dashboard':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {component.data.agents?.map((agent: any, index: number) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{agent.name}</span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: component.config?.statusColors?.[agent.status] || '#64748b'
                  }}
                />
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <p>Status: {agent.status}</p>
                <p>IP: {agent.ip}</p>
                {agent.os && <p>OS: {agent.os}</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  {component.data.columns?.map((col: string, index: number) => (
                    <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {component.data.rows?.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-slate-700/50">
                    {Object.values(row).map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-slate-300">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className="bg-slate-800 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={component.data.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'metrics':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(component.data).map(([key, value]: [string, any], index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{value}</div>
              <div className="text-sm text-slate-400">{key}</div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

export default ThesysRenderer;
