function ActivityPanel({ activity }) {
  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.heading}>📋 Activity</h3>
      <div style={styles.list}>
        {activity.length === 0 && (
          <p style={styles.empty}>No activity yet</p>
        )}
        {activity.map((item) => (
          <div key={item._id} style={styles.item}>
            <div style={styles.avatar}>{item.user?.name?.[0]?.toUpperCase() || '?'}</div>
            <div style={styles.content}>
              <span style={styles.name}>{item.user?.name}</span>
              <span style={styles.action}> {item.action}</span>
              <div style={styles.time}>{timeAgo(item.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    width: '280px',
    flexShrink: 0,
    background: 'rgba(18,18,42,0.85)',
    backdropFilter: 'blur(16px)',
    borderLeft: '1px solid rgba(139,92,246,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  heading: {
    padding: '16px 18px', fontSize: '13px', fontWeight: '700',
    borderBottom: '1px solid rgba(139,92,246,0.15)',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  list: { flex: 1, overflowY: 'auto', padding: '12px' },
  item: { display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'flex-start' },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '12px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
  },
  content: { fontSize: '12px', lineHeight: '1.5' },
  name: { fontWeight: '600', color: '#e2e8f0' },
  action: { color: '#94a3b8' },
  time: { color: '#475569', fontSize: '11px', marginTop: '2px' },
  empty: { color: '#475569', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
}

export default ActivityPanel
