function StatsBar({ stats }) {
  const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div style={styles.bar}>
      <div style={styles.stat}>
        <span style={styles.num}>{stats.total}</span>
        <span style={styles.label}>Total</span>
      </div>
      <div style={styles.stat}>
        <span style={{ ...styles.num, color: '#94a3b8' }}>{stats.todo}</span>
        <span style={styles.label}>To Do</span>
      </div>
      <div style={styles.stat}>
        <span style={{ ...styles.num, color: '#f59e0b' }}>{stats.inprogress}</span>
        <span style={styles.label}>In Progress</span>
      </div>
      <div style={styles.stat}>
        <span style={{ ...styles.num, color: '#22c55e' }}>{stats.done}</span>
        <span style={styles.label}>Done</span>
      </div>
      <div style={styles.stat}>
        <span style={{ ...styles.num, color: '#ef4444' }}>{stats.highPriority}</span>
        <span style={styles.label}>High Priority</span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressFill, width: `${percent}%` }} />
      </div>
      <span style={styles.percent}>{percent}% done</span>
    </div>
  )
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px 28px',
    background: 'rgba(18,18,42,0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(139,92,246,0.15)',
    flexWrap: 'wrap',
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  num: { fontSize: '20px', fontWeight: '800', color: '#6366f1' },
  label: { fontSize: '10px', color: '#64748b', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  progressWrap: { flex: 1, minWidth: '80px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)', borderRadius: '3px', transition: 'width 0.5s ease' },
  percent: { fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', fontWeight: '600' },
}

export default StatsBar
