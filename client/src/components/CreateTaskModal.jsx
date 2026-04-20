import { useState } from 'react'
import { createTask } from '../services/api.js'
import toast from 'react-hot-toast'
import { FiX } from 'react-icons/fi'

function CreateTaskModal({ projectId, projectMembers, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: '',
    dueDate: '',
    labels: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        project: projectId,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
        labels: form.labels ? form.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      }
      const res = await createTask(payload)
      onCreated(res.data)
      toast.success('Task created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Create Task</h2>
          <button style={styles.closeBtn} onClick={onClose}><FiX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input className="input" placeholder="Task title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="input" placeholder="What needs to be done?" rows={3}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Priority</label>
              <select className="input" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="todo">📋 To Do</option>
                <option value="inprogress">⚡ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Assign To</label>
            <select className="input" value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Labels (comma separated)</label>
              <input className="input" placeholder="bug, frontend" value={form.labels}
                onChange={(e) => setForm({ ...form, labels: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' },
}

export default CreateTaskModal
