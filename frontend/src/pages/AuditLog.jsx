import { useEffect, useState } from 'react'
import { getAuditLogs } from '../api'
import './AuditLog.css'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getAuditLogs(search ? { q: search } : {}).then(r => setLogs(r.data.results ?? r.data)).catch(console.error).finally(() => setLoading(false))
  }, [search])

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Audit Log</h1><p className="page-subtitle">Full trail of all system activity</p></div>
      </div>
      <div className="toolbar">
        <input className="search-input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {loading ? <div style={{textAlign:'center',padding:'40px'}}><div className="spinner" style={{margin:'0 auto'}} /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>Model</th><th>User</th><th>Details</th><th>Time</th></tr></thead>
              <tbody>
                {logs.length === 0 ? <tr><td colSpan={5} className="empty-msg">No logs found.</td></tr>
                : logs.map((log, i) => (
                  <tr key={i}>
                    <td><span className={'badge ' + getActionBadge(log.action)}>{log.action}</span></td>
                    <td>{log.model}</td>
                    <td>{log.user}</td>
                    <td><span className="log-detail">{JSON.stringify(log.details ?? {})}</span></td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function getActionBadge(action) {
  if (['DELETE','HARD_DELETE','SOFT_DELETE'].includes(action)) return 'badge-red'
  if (['ARCHIVE'].includes(action)) return 'badge-gold'
  if (['RESTORE','UNARCHIVE'].includes(action)) return 'badge-green'
  return 'badge-gray'
}
