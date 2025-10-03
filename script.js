// Smart Study Planner - script.js
// Save tasks in localStorage under key 'ssp_tasks'

const taskTitle = document.getElementById('taskTitle');
const taskDate = document.getElementById('taskDate');
const taskNotes = document.getElementById('taskNotes');
const taskPriority = document.getElementById('taskPriority');

const addTaskBtn = document.getElementById('addTaskBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const sortSelect = document.getElementById('sortSelect');

const taskList = document.getElementById('taskList');
const emptyMsg = document.getElementById('emptyMsg');

const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');

const STORAGE_KEY = 'ssp_tasks';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Utility: format date
function formatDate(dateStr){
  if(!dateStr) return 'No due date';
  const d = new Date(dateStr + 'T00:00:00'); // avoid timezone shift
  if(isNaN(d)) return 'Invalid date';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleDateString(undefined, opts);
}

// Save to localStorage
function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

// Add new task
addTaskBtn.addEventListener('click', ()=>{
  const title = taskTitle.value.trim();
  if(!title){ alert('Please enter a study goal.'); taskTitle.focus(); return; }

  const newTask = {
    id: Date.now().toString(),
    title,
    notes: taskNotes.value.trim(),
    date: taskDate.value || null,
    priority: taskPriority.value || 'medium',
    completed: false,
    createdAt: Date.now()
  };

  tasks.push(newTask);
  taskTitle.value = '';
  taskNotes.value = '';
  taskDate.value = '';
  taskPriority.value = 'medium';
  saveTasks();
});

// Clear all with confirmation
clearAllBtn.addEventListener('click', ()=>{
  if(tasks.length === 0) return;
  if(confirm('Are you sure you want to delete ALL tasks?')){
    tasks = [];
    saveTasks();
  }
});

// Sorting
sortSelect.addEventListener('change', renderTasks);

// Toggle complete
function toggleComplete(id){
  const idx = tasks.findIndex(t => t.id === id);
  if(idx === -1) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks();
}

// Delete
function deleteTask(id){
  const idx = tasks.findIndex(t => t.id === id);
  if(idx === -1) return;
  if(confirm('Delete this task?')) {
    tasks.splice(idx, 1);
    saveTasks();
  }
}

// Edit (simple prompt-based edit)
function editTask(id){
  const idx = tasks.findIndex(t => t.id === id);
  if(idx === -1) return;
  const t = tasks[idx];
  const newTitle = prompt('Edit task title:', t.title);
  if(newTitle === null) return; // cancelled
  t.title = newTitle.trim() || t.title;

  const newNotes = prompt('Edit notes (leave blank to keep):', t.notes || '');
  if(newNotes !== null) t.notes = newNotes.trim();

  const newDate = prompt('Edit due date (YYYY-MM-DD) or leave blank to clear:', t.date || '');
  if(newDate !== null) t.date = newDate.trim() || null;

  const newPriority = prompt('Priority (low / medium / high):', t.priority);
  if(newPriority !== null){
    const val = newPriority.trim().toLowerCase();
    t.priority = (val === 'low' || val === 'high') ? val : 'medium';
  }
  saveTasks();
}

// Progress update
function updateProgress(){
  const total = tasks.length;
  if(total === 0){
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    return;
  }
  const completed = tasks.filter(t => t.completed).length;
  const pct = Math.round((completed / total) * 100);
  progressFill.style.width = pct + '%';
  progressPercent.textContent = pct + '%';
}

// Render tasks
function renderTasks(){
  // Sort according to select
  const sortBy = sortSelect.value;
  let list = [...tasks];
  if(sortBy === 'dateAsc'){
    list.sort((a,b)=>{
      if(!a.date) return 1;
      if(!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
  } else if(sortBy === 'dateDesc'){
    list.sort((a,b)=>{
      if(!a.date) return 1;
      if(!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
  } else if(sortBy === 'priority'){
    const order = {high:0, medium:1, low:2};
    list.sort((a,b) => (order[a.priority] - order[b.priority]));
  } else { // createdDesc
    list.sort((a,b) => b.createdAt - a.createdAt);
  }

  taskList.innerHTML = '';
  if(list.length === 0){
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
  }

  list.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '') + ` priority-${task.priority}`;

    // Left area: checkbox + meta
    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox' + (task.completed ? ' checked' : '');
    checkbox.innerHTML = task.completed ? '✔' : '';
    checkbox.title = task.completed ? 'Mark as incomplete' : 'Mark as complete';
    checkbox.onclick = ()=> toggleComplete(task.id);

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.gap = '8px';
    row2.style.alignItems = 'center';

    const due = document.createElement('div');
    due.className = 'task-due';
    due.textContent = task.date ? `Due: ${formatDate(task.date)}` : '';

    const notes = document.createElement('div');
    notes.className = 'task-notes';
    notes.textContent = task.notes || '';

    row2.appendChild(due);
    if(task.notes) row2.appendChild(notes);

    meta.appendChild(title);
    meta.appendChild(row2);

    left.appendChild(checkbox);
    left.appendChild(meta);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'controls';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = ()=> editTask(task.id);

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = ()=> deleteTask(task.id);

    controls.appendChild(editBtn);
    controls.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(controls);
    taskList.appendChild(li);
  });

  updateProgress();
}

// Initial render
renderTasks();

// Optionally: save on unload
window.addEventListener('beforeunload', ()=>{
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
});
