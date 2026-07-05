import { useState, useEffect, useMemo } from "react";
import API, { authAPI } from "./api";
import toast from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  MdDone,
  MdEdit,
  MdDelete
} from "react-icons/md";
import Swal from "sweetalert2";

import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";


function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const handleAuth = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(authForm.email)) {
    toast.error("Please enter a valid email");
    return;
  }

  setAuthLoading(true);

  try {
    let response;

    if (authMode === "register") {
      response = await authAPI.post("/register", authForm);
    } else {
      response = await authAPI.post("/login", {
        email: authForm.email,
        password: authForm.password,
      });
    }

    localStorage.setItem("user", JSON.stringify(response.data));
    setUser(response.data);

    setAuthForm({
      name: "",
      email: "",
      password: "",
    });

    toast.success(
      authMode === "login"
        ? "Login successful"
        : "Account created successfully"
    );
  } catch (error) {
  console.log(error);

  alert(
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message
  );
} finally {
    setAuthLoading(false);
  }
};
  const toggleDarkMode = () => {
  setDarkMode(!darkMode);
  localStorage.setItem("theme", !darkMode ? "dark" : "light");
};
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
  };

 const getTasks = async () => {
  try {
    setLoading(true);
    const response = await API.get("/");
    setTasks(response.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (user) {
      getTasks();
    }
  }, [user]);

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    });
  };
  const saveTask = async () => {
    if (
      form.title.trim() === "" ||
      form.description.trim() === ""
    ) {
     toast.error("Please fill all fields");
      return;
    }

    try {
      if (editId) {
        await API.put(`/${editId}`, form);
      } else {
        await API.post("/", form);
      }

      resetForm();
      getTasks();
    } catch (err) {
     toast.error(err.response?.data?.message || "Authentication failed"); 
    }
  };

  const deleteTask = async (id) => {
  const result = await Swal.fire({
    title: "Delete task?",
    text: "This task will be removed permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
  });

  if (!result.isConfirmed) return;

  try {
    await API.delete(`/${id}`);
    getTasks();

    Swal.fire({
      title: "Deleted!",
      text: "Task deleted successfully.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire("Error", "Delete failed", "error");
  }
};

  const editTask = (task) => {
    setEditId(task._id);

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleTask = async (task) => {
    try {
      await API.put(`/${task._id}`, {
        completed: !task.completed,
      });

      getTasks();
    } catch (err) {
     toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchMatch =
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const filterMatch =
        filter === "All" ||
        (filter === "Completed" && task.completed) ||
        (filter === "Pending" && !task.completed) ||
        task.priority === filter;

      return searchMatch && filterMatch;
    });
  }, [tasks, search, filter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriority = tasks.filter(
    (t) => t.priority === "High"
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>
            {authMode === "login"
              ? "Login"
              : "Register"}
          </h1>

          <p>Welcome to To Do List Dashboard</p>

                {authMode === "register" && (
                <div className="float-input">
       <FiUser className="float-icon" />

<input
  type="text"
  required
  value={authForm.name}
  onChange={(e) =>
    setAuthForm({
      ...authForm,
      name: e.target.value,
    })
  }
/>

        <label>Name</label>
      </div>
                )}

  <div className="float-input">
  <FiMail className="float-icon" />

  <input
    type="email"
    required
    value={authForm.email}
    onChange={(e) =>
      setAuthForm({
        ...authForm,
        email: e.target.value,
      })
    }
  />

  <label>Email</label>
</div>

<div className="float-input">
  <FiLock className="float-icon" />

  <input
    type={showPassword ? "text" : "password"}
    required
    value={authForm.password}
    onChange={(e) =>
      setAuthForm({
        ...authForm,
        password: e.target.value,
      })
    }
  />

  <label>Password</label>

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
  </button>
</div>

         <button onClick={handleAuth} disabled={authLoading}>
  {authLoading ? (
    <>
      <span className="spinner-border spinner-border-sm"></span>
      Logging in...
    </>
  ) : (
    authMode === "login" ? "Login" : "Create Account"
  )}
</button>

          <button
            className="link-btn"
            onClick={() =>
              setAuthMode(
                authMode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {authMode === "login"
              ? "Create new account"
              : "Back to Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "app-shell dark" : "app-shell"}>
      <aside className="sidebar">
       <div className="brand">
  <div className="brand-icon">✓</div>

  <div>
    <h2>To Do List</h2>
   
  </div>

  <button
    className="theme-toggle"
    onClick={toggleDarkMode}
  >
    {darkMode ? "☀️" : "🌙"}
  </button>
</div>

        <div className="menu">
          {["All", "Completed", "Pending", "High", "Medium", "Low"].map(
            (item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            )
          )}
        </div>
         
        <div className="profile-card">
          <div className="avatar">
            {user.name?.charAt(0) || "U"}
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-header">
          <div>
            <span className="page-label">
              Productivity Dashboard
            </span>

            <h1>Manage your tasks easily</h1>

            <p>
              Track your progress and organize your daily work.
            </p>
          </div>

          <div className="search-card">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-box purple">
            <span>📋</span>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="stat-box green">
            <span>✅</span>
            <h3>{completedTasks}</h3>
            <p>Completed</p>
          </div>

          <div className="stat-box orange">
            <span>⏳</span>
            <h3>{pendingTasks}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-box red">
            <span>🚩</span>
            <h3>{highPriority}</h3>
            <p>High Priority</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>{editId ? "Edit Task" : "Add New Task"}</h2>
              <p>Create and organize your daily work.</p>
            </div>

            <div className="progress-box">
              <span>Productivity</span>

              <div className="progress">
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            </div>
          </div>

          <div className="task-form">
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value,
                })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
            />

            <button className="btn-reset" onClick={resetForm}>
              Reset
            </button>

            <button className="btn-main" onClick={saveTask}>
              {editId ? "Update Task" : "Add Task"}
            </button>
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>My Tasks</h2>
              <p>
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <h3>No Tasks Found</h3>
                <p>Add your first task to get started.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-card" key={task._id}>
                  <div className="task-info">
                    <button
                      className={`task-check ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={() => toggleTask(task)}
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div>
                      <h4 className={task.completed ? "completed" : ""}>
                        {task.title}
                      </h4>

                      <p>{task.description}</p>

                      <div className="task-details">
                        <span
                          className={`priority ${task.priority?.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                        <span>📅 {task.dueDate || "No date"}</span>
                      </div>
                    </div>
                  </div>

                 <div className="task-actions">
  
    <button className="success" onClick={() => toggleTask(task)}>
    <MdDone size={24} />
</button>

<button className="warning" onClick={() => editTask(task)}>
    <MdEdit size={24} />
</button>

<button className="danger" onClick={() => deleteTask(task._id)}>
    <MdDelete size={24} />
</button>
</div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="footer">
          <h4>Kawkab Ali AL-Shorman</h4>
          
        </footer>
      </main>
    </div>
  );
}

export default App;