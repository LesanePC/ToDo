const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const filterButtons = document.querySelectorAll('.filter-buttons button');

const todayList = document.querySelector('#today .task-list');
const tomorrowList = document.querySelector('#tomorrow .task-list');
const weekList = document.querySelector('#week .task-list');
const mainTaskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Theme switcher
document.getElementById('toggleTheme').onclick = function() {
    document.body.classList.toggle("dark");
    this.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

// Add task on Enter
taskInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") addBtn.click();
});

// Save to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create task card
function createTaskElement(task, index) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    // Animation
    li.style.opacity = '0';
    li.style.transform = 'translateY(26px)';
    setTimeout(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
    }, 30);

    const taskMain = document.createElement('div');
    taskMain.className = 'task-main';

    // Priority indicator
    const prioritySpan = document.createElement('span');
    prioritySpan.textContent = task.completed ? '✓' : '●';
    prioritySpan.className = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high'
    } [task.priority] || 'priority-low';
    prioritySpan.style.marginRight = '10px';
    prioritySpan.style.fontSize = '19px';
    if (task.completed) prioritySpan.style.color = '#43c978';

    // Task text
    const spanText = document.createElement('span');
    spanText.className = 'task-text';
    spanText.textContent = task.text;
    if (task.completed) spanText.style.textDecoration = 'line-through';

    // Deadline
    const deadline = document.createElement('span');
    deadline.className = 'task-deadline';
    deadline.textContent = task.deadline ? `Сделать до: ${task.deadline}` : '';

    taskMain.appendChild(prioritySpan);
    taskMain.appendChild(spanText);
    taskMain.appendChild(deadline);

    // Toggle completed state
    taskMain.addEventListener('click', () => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(currentFilter);
    });

    // Delete button with fade out
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute("aria-label", "Удалить задачу");

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        li.style.opacity = "0";
        li.style.transform = "translateY(20px)";
        setTimeout(() => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(currentFilter);
        }, 350);
    });

    li.appendChild(taskMain);
    li.appendChild(deleteBtn);

    return li;
}

// Main render function
function renderTasks(filter = 'all') {
    mainTaskList.innerHTML = '';
    todayList.innerHTML = '';
    tomorrowList.innerHTML = '';
    weekList.innerHTML = '';

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    tasks.forEach((task, index) => {
        if (
            filter === 'all' ||
            (filter === 'active' && !task.completed) ||
            (filter === 'completed' && task.completed)
        ) {
            const li = createTaskElement(task, index);
            mainTaskList.appendChild(li);

            if (task.deadline) {
                const taskDate = new Date(task.deadline + 'T00:00:00');
                const columnTask = createTaskElement(task, index);

                if (taskDate >= now && taskDate < tomorrow) {
                    todayList.appendChild(columnTask);
                } else if (taskDate.toDateString() === tomorrow.toDateString()) {
                    tomorrowList.appendChild(columnTask);
                } else if (taskDate >= tomorrow && taskDate <= weekEnd) {
                    weekList.appendChild(columnTask);
                }
            }
        }
    });
}

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks(currentFilter);
    });
});

// Add task
addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const deadline = deadlineInput.value;
    const priority = prioritySelect.value;

    if (!text) {
        alert('Введите задачу!');
        return;
    }

    tasks.push({
        text,
        deadline,
        priority,
        completed: false,
    });

    saveTasks();
    renderTasks(currentFilter);

    taskInput.value = '';
    deadlineInput.value = '';
    prioritySelect.value = 'low';
    taskInput.focus();
});

// Initial render
renderTasks();