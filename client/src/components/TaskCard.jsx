import { useState } from 'react'
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const PRIORITY_LABELS = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' }

function TaskCard({ task, onDelete, onUpdate, projectMembers }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  const saveEdit = async () => {
    if (!title.trim()) return
    await onUpdate(task._id, { title: title.trim(), description })
    setEditing(false)
  }

  const cancelEdit = () => {
    setTitle(task.title)
    setDescription(task.description || '')
    setEditing(false)
  }

  return (
    <div style={styles.card}>
      {/* Priority bar */}
      <div style={{ ...styles.priorityBar, background: PRIORITY_COLORS[task.priority] }} />

      <div style={styles.body}>
        {editing ? (
          <>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: '8px', fontSize: '13px' }}
              autoFocus
            />
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description..."
              style={{ fontSize: '12px', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={saveEdit}>
                <FiCheck />
              </button>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={cancelEdit}>
                <FiX />
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.titleRow}>
              <span style={styles.title}>{task.title}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={styles.iconBtn} onClick={() => setEditing(true)}><FiEdit2 size={12} /></button>
                <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={() => onDelete(task._id)}><FiTrash2 size={12} /></button>
              </div>
            </div>

            {task.description && (
              <p style={styles.desc}>{task.description}</p>
            )}

            <div style={styles.meta}>
              <span style={{ ...styles.badge, color: PRIORITY_COLORS[task.priority] }}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              {task.assignee && (
                <span style={styles.assignee}>👤 {task.assignee.name}</span>
              )}
            </div>

            {task.dueDate && (
              <div style={{ ...styles.due, color: isOverdue ? '#ef4444' : '#64748b' }}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (overdue)'}
              </div>
            )}

            {task.labels?.length > 0 && (
              <div style={styles.labels}>
                {task.labels.map((l) => (
                  <span key={l} style={styles.label}>{l}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(26,26,53,0.9)',
    border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '10px',
    marginBottom: '8px',
    overflow: 'hidden',
    display: 'flex',
    transition: 'all 0.2s',
    backdropFilter: 'blur(8px)',
  },
  priorityBar: { width: '4px', flexShrink: 0 },
  body: { padding: '10px 12px', flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  title: { fontSize: '13px', fontWeight: '600', lineHeight: '1.4', wordBreak: 'break-word', color: '#f1f5f9' },
  desc: { fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  badge: { fontSize: '11px', fontWeight: '600' },
  assignee: { fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' },
  due: { fontSize: '11px', marginTop: '4px' },
  labels: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' },
  label: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    color: '#a5b4fc', fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
    border: '1px solid rgba(99,102,241,0.2)',
  },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' },
}

export default TaskCard
