import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, Server, Activity } from 'lucide-react';
import type { ThesysComponent } from '../types';

interface ThesysRendererProps {
  component: ThesysComponent;
}

// Severity color mapping for light theme
const severityColors: { [key: string]: { bg: string; text: string; border: string } } = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' },
  info: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-400' },
};

// Status color mapping
const statusColors: { [key: string]: string } = {
  active: 'bg-green-500',
  disconnected: 'bg-red-500',
  pending: 'bg-yellow-500',
  never_connected: 'bg-slate-400',
};

const ThesysRenderer: React.FC<ThesysRendererProps> = ({ component }) => {
  switch (component.type) {
    case 'text':
      return (
        <div className="prose max-w-none text-text-primary">
          <p>{component.data.text}</p>
        </div>
      );

    case 'alert-cards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {component.data.alerts?.map((alert: any, index: number) => {
            const severity = (alert.severity || 'info').toLowerCase();
            const colors = severityColors[severity] || severityColors.info;

            return (
              <div
                key={index}
                className={`${colors.bg} rounded-lg p-4 border-l-4 ${colors.border} shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${colors.text} ${colors.bg}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-text-muted">Rule: {alert.rule_id}</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary mb-1">{alert.description}</p>
                    <p className="text-xs text-text-secondary">Agent: {alert.agent}</p>
                  </div>
                </div>
                {alert.timestamp && (
                  <div className="mt-2 text-xs text-text-muted">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case 'agent-dashboard':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {component.data.agents?.map((agent: any, index: number) => {
            const status = (agent.status || 'never_connected').toLowerCase().replace(' ', '_');
            const statusColor = statusColors[status] || statusColors.never_connected;

            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-sidebar-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-text-primary">{agent.name}</span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                </div>
                <div className="text-sm text-text-secondary space-y-1">
                  <p className="flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Status: <span className="capitalize">{agent.status}</span>
                  </p>
                  <p>IP: {agent.ip}</p>
                  {agent.os && <p>OS: {agent.os}</p>}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'table':
      return (
        <div className="bg-white rounded-lg overflow-hidden border border-sidebar-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  {component.data.columns?.map((col: string, index: number) => (
                    <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sidebar-border">
                {component.data.rows?.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-background-secondary transition-colors">
                    {Object.values(row).map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-text-primary">
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
        <div className="bg-white rounded-lg p-6 border border-sidebar-border shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={component.data.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#1E293B' }}
              />
              <Bar dataKey="value" fill="#1ABC9C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );

    case 'metrics':
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(component.data).map(([key, value]: [string, any], index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center border border-sidebar-border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">{value}</div>
              <div className="text-sm text-text-secondary capitalize">{key.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      );

    case 'vulnerability-cards':
      return (
        <div className="space-y-3">
          {component.data.vulnerabilities?.map((vuln: any, index: number) => {
            const severity = (vuln.severity || 'info').toLowerCase();
            const colors = severityColors[severity] || severityColors.info;

            return (
              <div
                key={index}
                className={`${colors.bg} rounded-lg p-4 border-l-4 ${colors.border} shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`w-4 h-4 ${colors.text}`} />
                      <span className="font-mono text-sm font-semibold text-text-primary">
                        {vuln.cve || vuln.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${colors.text}`}
                      >
                        {vuln.severity}
                      </span>
                      {vuln.cvss && (
                        <span className="text-xs text-text-muted">
                          CVSS: {vuln.cvss}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-primary mb-1">{vuln.title || vuln.name}</p>
                    {vuln.package && (
                      <p className="text-xs text-text-secondary">Package: {vuln.package}</p>
                    )}
                    {vuln.agent && (
                      <p className="text-xs text-text-secondary">Agent: {vuln.agent}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );

    default:
      // Fallback for unknown component types - render as JSON
      if (component.data) {
        return (
          <div className="bg-background-secondary rounded-lg p-4 border border-sidebar-border">
            <pre className="text-xs text-text-secondary overflow-x-auto">
              {JSON.stringify(component.data, null, 2)}
            </pre>
          </div>
        );
      }
      return null;
  }
};

export default ThesysRenderer;
