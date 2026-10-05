const API_BASE = 'https://interntrack-week6.onrender.com/api';

function getToken() { return localStorage.getItem('interntrackToken'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('interntrackUser') || 'null'); }
  catch { return null; }
}
function setSession(data) {
  localStorage.setItem('interntrackToken', data.token);
  localStorage.setItem('interntrackUser', JSON.stringify(data.user));
}
function clearSession() {
  localStorage.removeItem('interntrackToken');
  localStorage.removeItem('interntrackUser');
}
function redirectToLogin() {
  if (!getToken()) location.href = 'index.html#account';
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the API. Start the backend on port 8087.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearSession();
    const error = new Error(body.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return body;
}
function showMessage(id, message, isError = false) {
  const el = document.getElementById(id);
  if (el) { el.textContent = message; el.classList.toggle('error-message', isError); }
}
async function handleRegister(event) {
  event.preventDefault();
  const body = {
    name: document.getElementById('registerName').value.trim(),
    email: document.getElementById('registerEmail').value.trim(),
    password: document.getElementById('registerPassword').value
  };
  try {
    const out = await api('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    setSession(out.data);
    showMessage('registerMessage', 'Account created. Opening your dashboard…');
    setTimeout(() => location.href = 'dashboard.html', 500);
  } catch (e) { showMessage('registerMessage', e.message, true); }
}
async function handleLogin(event) {
  event.preventDefault();
  const body = {
    email: document.getElementById('loginEmail').value.trim(),
    password: document.getElementById('loginPassword').value
  };
  try {
    const out = await api('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    setSession(out.data);
    showMessage('loginMessage', 'Login successful. Opening your dashboard…');
    setTimeout(() => location.href = 'dashboard.html', 500);
  } catch (e) { showMessage('loginMessage', e.message, true); }
}
function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  if (!list) return;
  if (!tasks.length) {
    list.innerHTML = '<div class="empty-state"><strong>No tasks found.</strong><p>Create a task using the form, or change the status filter.</p></div>';
    return;
  }
  list.innerHTML = tasks.map(t => `<div class="task-row ${t.status === 'Completed' ? 'done' : ''}">
    <span class="check" aria-hidden="true">${t.status === 'Completed' ? '✓' : ''}</span>
    <a href="task.html?id=${encodeURIComponent(t._id)}" class="task-link"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.category || 'General')} · ${escapeHtml(t.status)} · ${Number(t.progress || 0)}%</small></a>
    <span class="task-date">${t.dueDate ? new Date(t.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : '—'}</span>
  </div>`).join('');
}
async function loadDashboard() {
  const list = document.getElementById('taskList');
  if (!list) return;
  const user = getUser();
  if (!getToken()) { list.innerHTML = '<div class="empty-state"><strong>Please sign in.</strong><p>Use the Home page to register or login before opening your dashboard.</p><a class="btn" href="index.html#account">Go to login</a></div>'; return; }
  if (user) {
    document.getElementById('welcomeTitle').innerHTML = `Good morning, ${escapeHtml(user.name)} <span>👋</span>`;
    document.getElementById('accountSummary').textContent = `${user.email} · Authenticated intern workspace`;
  }
  try {
    const status = document.getElementById('filterStatus')?.value || '';
    const out = await api('/tasks' + (status ? `?status=${encodeURIComponent(status)}` : ''));
    renderTasks(out.data);
    const total = out.data.length;
    const completed = out.data.filter(t => t.status === 'Completed').length;
    const pct = total ? Math.round(completed / total * 100) : 0;
    document.getElementById('completionStat').textContent = `${pct}%`;
    document.getElementById('completionBar').style.width = `${pct}%`;
    document.getElementById('completionText').textContent = `${completed} of ${total} tasks completed`;
    document.getElementById('totalStat').textContent = total;
    document.getElementById('dueStat').textContent = total ? 'Persisted in MongoDB' : 'Create your first task';
  } catch (e) {
    list.innerHTML = `<div class="empty-state"><strong>Could not load tasks.</strong><p>${escapeHtml(e.message)}</p></div>`;
  }
}
async function checkHealth() {
  const el = document.getElementById('apiStat');
  if (!el) return;
  try {
    const out = await api('/health');
    el.textContent = 'Online';
    document.getElementById('apiDetail').textContent = out.message;
  } catch {
    el.textContent = 'Offline';
    document.getElementById('apiDetail').textContent = 'Start backend on port 8087';
  }
}
async function createTask(event) {
  event.preventDefault();
  const body = {
    title: document.getElementById('taskTitleInput').value.trim(),
    description: document.getElementById('taskDescriptionInput').value.trim(),
    category: document.getElementById('taskCategoryInput').value.trim() || 'General',
    dueDate: document.getElementById('taskDueDateInput').value || undefined,
    priority: document.getElementById('taskPriorityInput').value
  };
  try {
    await api('/tasks', { method: 'POST', body: JSON.stringify(body) });
    event.target.reset();
    showMessage('createMessage', 'Task created and saved to MongoDB.');
    await loadDashboard();
  } catch (e) { showMessage('createMessage', e.message, true); }
}
async function loadTask() {
  const title = document.getElementById('taskTitle');
  if (!title) return;
  if (!getToken()) { title.textContent = 'Authentication required'; showMessage('saveMessage', 'Sign in first, then open a task from your dashboard.', true); return; }
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { title.textContent = 'No task selected'; showMessage('saveMessage', 'Open a task from the dashboard.', true); return; }
  try {
    const t = (await api(`/tasks/${encodeURIComponent(id)}`)).data;
    title.textContent = t.title;
    document.getElementById('taskCategory').textContent = (t.category || 'GENERAL').toUpperCase();
    document.getElementById('taskDescription').textContent = t.description;
    document.getElementById('taskStatusPill').textContent = t.status;
    document.getElementById('status').value = t.status;
    document.getElementById('progressInput').value = t.progress ?? 0;
    updateProgressUI(t.progress ?? 0);
    document.getElementById('taskPriority').textContent = t.priority;
    document.getElementById('taskHours').textContent = t.estimatedHours ?? 'Not specified';
    document.getElementById('taskDue').textContent = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Not specified';
    document.getElementById('taskMeta').textContent = `Created ${new Date(t.createdAt).toLocaleDateString()}`;
    document.getElementById('saveBtn').dataset.id = t._id;
    document.getElementById('deleteBtn').dataset.id = t._id;
  } catch (e) { title.textContent = 'Task unavailable'; showMessage('saveMessage', e.message, true); }
}
function updateProgressUI(value) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressValue');
  if (bar) bar.style.width = `${progress}%`;
  if (text) text.textContent = `${progress}%`;
}
async function saveTask() {
  const id = document.getElementById('saveBtn')?.dataset.id;
  if (!id) return;
  const status = document.getElementById('status').value;
  const progress = Number(document.getElementById('progressInput').value);
  try {
    const out = await api(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status, progress }) });
    updateProgressUI(out.data.progress);
    document.getElementById('taskStatusPill').textContent = out.data.status;
    showMessage('saveMessage', 'Changes saved to MongoDB.');
  } catch (e) { showMessage('saveMessage', e.message, true); }
}
async function deleteTask() {
  const id = document.getElementById('deleteBtn')?.dataset.id;
  if (!id) return;
  if (!confirm('Delete this task permanently?')) return;
  try {
    await api(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
    location.href = 'dashboard.html';
  } catch (e) { showMessage('saveMessage', e.message, true); }
}
function logout() { clearSession(); location.href = 'index.html#account'; }

// Export selected pure/testable helpers for Node/Jest without affecting browser execution.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getToken, getUser, setSession, clearSession, escapeHtml,
    showMessage, renderTasks, updateProgressUI
  };
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('createTaskForm')?.addEventListener('submit', createTask);
  document.getElementById('filterStatus')?.addEventListener('change', loadDashboard);
  document.getElementById('refreshBtn')?.addEventListener('click', loadDashboard);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('saveBtn')?.addEventListener('click', saveTask);
  document.getElementById('deleteBtn')?.addEventListener('click', deleteTask);
  document.getElementById('progressInput')?.addEventListener('input', e => updateProgressUI(e.target.value));
  loadDashboard(); loadTask(); checkHealth();
});