import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDocuments, getUsers, getAuditLogs } from '../api'
import { Link } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, archived: 0, deleted: 0, users: 0 })
  const [recent, setRecent] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDocuments(),
      getDocuments({ is_archived: '1' }),
      getDocuments({ is_deleted: '1' }),
      user?.role === 'ADMIN' ? getUsers() : Promise.resolve({ data: { results: [] } }),
      user?.role === 'ADMIN' ? getAuditLogs({ page_size: 5 }) : Promise.resolve({ data: { results: [] } }),
    ]).then(([all, arch, del, users, audit]) => {
      setStats({
        total: all.data.count ?? all.data.length ?? 0,
        archived: arch.data.count ?? arch.data.length ?? 0,
        deleted: del.data.count ?? del.data.length ?? 0,
        users: users.data.count ?? users.data.results?.length ?? 0,
      })
      const docs = all.data.results ?? all.data
      setRecent(docs.slice(0, 5))
      setLogs((audit.data.results ?? audit.data).slice(0, 5))
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="fullpage-loader"><div className="spinner" /></div>

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const statCards = [
    { label: 'Total Documents', value: stats.total, icon: '📁', color: 'green' },
    { label: 'Archived', value: stats.archived, icon: '🗄️', color: 'gold' },
    { label: 'Soft Deleted', value: stats.deleted, icon: '🗑️', color: 'red' },
    ...(user?.role === 'ADMIN' ? [{ label: 'System Users', value: stats.users, icon: '👥', color: 'blue' }] : []),
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.username}</h1>
          <p className="page-subtitle">Here is what is happening in the JSC Commercial Court system today.</p>
        </div>
        <Link to="/documents" className="btn btn-primary">+ New Document</Link>
      </div>

      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className={'stat-card stat-' + s.color}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Documents</h3>
            <Link to="/documents" className="card-link">View all</Link>
          </div>
          {recent.length === 0 ? <p className="empty-msg">No documents yet.</p> : (
            <div className="recent-list">
              {recent.map(doc => (
                <div key={doc.id} className="recent-item">
                  <div className="recent-icon">📄</div>
                  <div className="recent-info">
                    <div className="recent-title">{doc.title}</div>
                    <div className="recent-meta">{doc.case_number || 'No case number'} · {doc.marker || 'No marker'}</div>
                  </div>
                  <span className={'badge ' + (doc.is_archived ? 'badge-gold' : 'badge-green')}>
                    {doc.is_archived ? 'Archived' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <Link to="/audit" className="card-link">Full log</Link>
            </div>
            {logs.length === 0 ? <p className="empty-msg">No activity yet.</p> : (
              <div className="recent-list">
                {logs.map((log, i) => (
                  <div key={i} className="recent-item">
                    <div className="audit-dot" />
                    <div className="recent-info">
                      <div className="recent-title">{log.action} on {log.model}</div>
                      <div className="recent-meta">{log.user} · {new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
