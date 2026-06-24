import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ContainerData, HistoryData } from './types';
import './App.css';

const NAME_LOOKUP: Record<string, string> = {
  '/vaqasdev-caddy-1': 'Caddy',
  '/vaqasdev-app-1': 'vaqas.dev',
};

function formatName(name: string): string {
  return NAME_LOOKUP[name] ?? name;
}

const POLL_INTERVAL = 30000;

function App() {
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    function fetchContainers() {
      fetch('https://monitor.vaqas.dev/api/containers')
        .then(res => {
          if (!res.ok) {
            throw new Error('Request failed with status ' + res.status);
          }
          return res.json();
        })
        .then((data: ContainerData[]) => {
          setContainers(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }

    fetchContainers();
    const id = setInterval(fetchContainers, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function fetchHistory() {
      fetch('https://monitor.vaqas.dev/api/history')
        .then(res => {
          if (!res.ok) {
            throw new Error('Request failed with status ' + res.status);
          }
          return res.json();
        })
        .then((data: HistoryData[]) => {
          setHistory(data);
          setHistoryError(null);
        })
        .catch(err => {
          setHistoryError(err.message);
        });
    }

    fetchHistory();
    const id = setInterval(fetchHistory, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const groupedHistory = useMemo(() => {
    const grouped: Record<string, HistoryData[]> = {};
    history.forEach(point => {
      if (!grouped[point.name]) grouped[point.name] = [];
      grouped[point.name].push(point);
    });
    Object.values(grouped).forEach(arr => arr.reverse());
    return grouped;
  }, [history]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page">
      <header className="page-header">
        <p className="label">container health monitor — live client</p>
        <h1><span className="green">dashboard</span>.vaqas.dev</h1>
        <p className="refresh-note">polls every 30s</p>
      </header>

      <div className="dashboard">
        {containers.map(c => {
          const cpuLevel = c.cpu_usage > 80 ? 'danger' : c.cpu_usage > 50 ? 'warning' : 'ok';
          const memLevel = c.memory_usage > 80 ? 'danger' : c.memory_usage > 50 ? 'warning' : 'ok';
          const statusLevel = c.status.toLowerCase().includes('up') ? 'running' : 'stopped';

          return (
            <div key={c.name} className="card">
              <h2>{formatName(c.name)}</h2>
              <p className={`status ${statusLevel}`}>● {c.status}</p>

              <div className="metric">
                <span>CPU</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${cpuLevel}`}
                    style={{ width: `${Math.min(c.cpu_usage, 100)}%` }}
                  />
                </div>
                <span>{c.cpu_usage}%</span>
              </div>

              <div className="metric">
                <span>Memory</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${memLevel}`}
                    style={{ width: `${Math.min(c.memory_usage, 100)}%` }}
                  />
                </div>
                <span>{c.memory_usage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts">
        {historyError && <p className="chart-error">History unavailable: {historyError}</p>}
        {Object.entries(groupedHistory).map(([name, points]) => (
          <div key={name} className="chart-card">
            <h3>{formatName(name)} — Last 30 Minutes</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="timestamp" tick={false} stroke="#888" />
                <YAxis
                  domain={[0, 'auto']}
                  stroke="#888"
                  tick={{ fill: '#ccc' }}
                  label={{ value: 'Usage %', angle: -90, position: 'insideLeft', fill: '#ccc' }}
                />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a' }} />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Line type="monotone" dataKey="cpu_usage" stroke="#3b82f6" strokeWidth={2} name="CPU %" dot={false} />
                <Line type="monotone" dataKey="memory_usage" stroke="#22c55e" strokeWidth={2} name="Memory %" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;