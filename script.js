const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyState = document.getElementById('emptyState');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderTasks() {
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  taskList.innerHTML = '';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.innerHTML = `
      <div class="task-checkbox" data-id="${task.id}"></div>
      <span class="priority-dot ${task.priority}"></span>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <span class="task-date">${formatDate(task.date)}</span>
      <button class="delete-btn" data-id="${task.id}">&times;</button>
    `;
    taskList.appendChild(li);
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  taskCount.textContent = activeCount + (activeCount === 1 ? ' task' : ' tasks') + ' remaining';

  emptyState.classList.toggle('hidden', filtered.length > 0);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.style.borderColor = '#ef4444';
    setTimeout(() => taskInput.style.borderColor = 'transparent', 1000);
    return;
  }

  tasks.unshift({
    id: Date.now().toString(),
    text,
    priority: prioritySelect.value,
    completed: false,
    date: new Date().toISOString()
  });

  taskInput.value = '';
  saveTasks();
  renderTasks();
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

taskList.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('task-checkbox')) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }

  if (e.target.classList.contains('delete-btn')) {
    const li = e.target.closest('.task-item');
    li.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 300);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
