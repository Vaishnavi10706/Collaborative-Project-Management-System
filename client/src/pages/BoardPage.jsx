// src/pages/BoardPage.jsx
// THE MAIN PAGE - The Kanban Board!
// This shows 3 columns: To Do | In Progress | Done
// Users can drag task cards between columns
// Uses: react-beautiful-dnd for drag & drop

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  getTasks,
  updateTask,
  deleteTask,
  getProject,
  getActivity,
  addMember,
  getTaskStats,
} from "../services/api";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import ActivityPanel from "../components/ActivityPanel";
import StatsBar from "../components/StatsBar";
import { FiPlus, FiArrowLeft, FiUserPlus, FiFilter } from "react-icons/fi";

// Connect to Socket.io server for real-time updates
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

// The 3 columns of our Kanban board
const COLUMNS = [
  { id: "todo",       label: "📋 To Do",      color: "linear-gradient(135deg, #334155, #1e293b)", accent: "#6366f1" },
  { id: "inprogress", label: "⚡ In Progress", color: "linear-gradient(135deg, #1e3a5f, #0f2744)", accent: "#f59e0b" },
  { id: "done",       label: "✅ Done",        color: "linear-gradient(135deg, #14532d, #052e16)", accent: "#10b981" },
];

function BoardPage() {
  const { projectId } = useParams(); // get projectId from URL
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [filterPriority, setFilterPriority] = useState(""); // "" = show all
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [showMemberInput, setShowMemberInput] = useState(false);

  // Load data when page opens
  useEffect(() => {
    loadAll();
  }, [projectId]);

  // Socket.io: listen for real-time task updates from other users
  useEffect(() => {
    socket.on("task_updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      toast("🔄 A team member updated a task");
    });

    socket.on("task_created", (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
      toast("➕ A team member added a new task");
    });

    socket.on("task_deleted", ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    return () => {
      socket.off("task_updated");
      socket.off("task_created");
      socket.off("task_deleted");
    };
  }, []);

  const loadAll = async () => {
    try {
      const [projRes, taskRes, actRes, statRes] = await Promise.all([
        getProject(projectId),
        getTasks(projectId),
        getActivity(projectId),
        getTaskStats(projectId),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setActivity(actRes.data);
      setStats(statRes.data);
    } catch (err) {
      toast.error("Could not load board");
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by priority if filter is set
  const getFilteredTasks = (status) => {
    return tasks.filter(
      (t) => t.status === status && (filterPriority === "" || t.priority === filterPriority)
    );
  };

  // DRAG AND DROP HANDLER
  // This is called when a card is dropped in a new column
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside any column, do nothing
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId; // the column ID it was dropped on

    // Optimistically update UI immediately (don't wait for server)
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      // Tell the server about the change
      const res = await updateTask(draggableId, { status: newStatus });

      // Emit to other users via Socket.io
      socket.emit("task_updated", res.data);

      // Refresh stats
      const statRes = await getTaskStats(projectId);
      setStats(statRes.data);

      // Refresh activity
      const actRes = await getActivity(projectId);
      setActivity(actRes.data);

      toast.success("Task moved!");
    } catch (err) {
      toast.error("Failed to move task");
      loadAll(); // revert by reloading
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      socket.emit("task_deleted", { taskId });
      toast.success("Task deleted");
      // refresh stats
      const statRes = await getTaskStats(projectId);
      setStats(statRes.data);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleTaskCreated = async (newTask) => {
    setTasks([newTask, ...tasks]);
    socket.emit("task_created", newTask);
    const statRes = await getTaskStats(projectId);
    setStats(statRes.data);
    const actRes = await getActivity(projectId);
    setActivity(actRes.data);
  };

  const handleAddMember = async () => {
    if (!addMemberEmail) return;
    try {
      await addMember(projectId, addMemberEmail);
      toast.success("Member added!");
      setAddMemberEmail("");
      setShowMemberInput(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  if (loading) return <div className="spinner">Loading board...</div>;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/projects")} style={{ padding: "6px 12px" }}>
            <FiArrowLeft />
          </button>
          <span className="navbar-brand" style={{ fontSize: "16px" }}>
            ⚡ {project?.name}
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Priority Filter */}
          <select
            className="input"
            style={{ width: "140px", padding: "6px 10px" }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Add Member */}
          <button className="btn btn-secondary" onClick={() => setShowMemberInput(!showMemberInput)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiUserPlus /> Add Member
          </button>

          {/* Activity toggle */}
          <button className="btn btn-secondary" onClick={() => setShowActivity(!showActivity)}>
            {showActivity ? "Hide Activity" : "📋 Activity"}
          </button>

          {/* Create task */}
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiPlus /> Add Task
          </button>
        </div>
      </nav>

      {/* Add member input row */}
      {showMemberInput && (
        <div style={{ background: "#1e293b", padding: "12px 24px", borderBottom: "1px solid #334155", display: "flex", gap: "10px" }}>
          <input
            className="input"
            placeholder="Enter member's email..."
            value={addMemberEmail}
            onChange={(e) => setAddMemberEmail(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <button className="btn btn-primary" onClick={handleAddMember}>Add</button>
        </div>
      )}

      {/* Stats bar */}
      {stats && <StatsBar stats={stats} />}

      {/* Body: Kanban Board + optional Activity Panel */}
      <div style={{ display: "flex", height: "calc(100vh - 130px)" }}>
        
        {/* KANBAN BOARD */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={styles.board}>
            {COLUMNS.map((col) => {
              const colTasks = getFilteredTasks(col.id);
              return (
                <div key={col.id} style={styles.column}>
                  {/* Column Header */}
                  <div style={{ ...styles.colHeader, background: col.color, borderBottom: `2px solid ${col.accent}` }}>
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>{col.label}</span>
                    <span style={styles.count}>{colTasks.length}</span>
                  </div>

                  {/* Droppable area (where cards can be dropped) */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          ...styles.cardList,
                          background: snapshot.isDraggingOver ? "#1a2744" : "transparent",
                        }}
                      >
                        {colTasks.length === 0 && (
                          <p style={styles.emptyCol}>No tasks here</p>
                        )}

                        {colTasks.map((task, index) => (
                          // Draggable wraps each task card
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={handleDeleteTask}
                                  onUpdate={async (id, data) => {
                                    const res = await updateTask(id, data);
                                    setTasks((prev) =>
                                      prev.map((t) => (t._id === id ? res.data : t))
                                    );
                                    socket.emit("task_updated", res.data);
                                  }}
                                  projectMembers={project?.members || []}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* ACTIVITY PANEL (slides in from right) */}
        {showActivity && (
          <ActivityPanel activity={activity} />
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          projectMembers={project?.members || []}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}

const styles = {
  board: {
    display: "flex",
    gap: "20px",
    padding: "24px 28px",
    overflowX: "auto",
    flex: 1,
  },
  column: {
    minWidth: "300px",
    maxWidth: "300px",
    display: "flex",
    flexDirection: "column",
  },
  colHeader: {
    padding: "12px 16px",
    borderRadius: "12px 12px 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  count: {
    background: "rgba(255,255,255,0.15)",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  cardList: {
    flex: 1,
    padding: "10px",
    borderRadius: "0 0 12px 12px",
    border: "1px solid rgba(139,92,246,0.15)",
    borderTop: "none",
    overflowY: "auto",
    minHeight: "100px",
    transition: "background 0.2s",
    background: "rgba(18,18,42,0.6)",
    backdropFilter: "blur(10px)",
  },
  emptyCol: {
    textAlign: "center",
    color: "#334155",
    fontSize: "13px",
    marginTop: "24px",
    padding: "20px",
    border: "2px dashed rgba(139,92,246,0.15)",
    borderRadius: "10px",
  },
};

export default BoardPage;
