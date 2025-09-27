// ===== OBJECT CONSTRUCTOR =====
function Task(title, description, priority, category, dueDate, status, tags) {
    this.id = Date.now().toString();
    this.title = title;
    this.description = description || '';
    this.priority = priority;
    this.category = category || 'work';
    this.dueDate = dueDate || null;
    this.status = status || 'pending';
    this.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
}

// ===== ARRAY TO STORE TASKS =====
let tasks = [];

// ===== LOCALSTORAGE FUNCTIONS =====
function loadTasks() {
    const storedTasks = localStorage.getItem('taskmasterTasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
            // Convert date strings back to Date objects if needed
            tasks.forEach(task => {
                if (task.dueDate) {
                    task.dueDate = new Date(task.dueDate);
                }
            });
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            tasks = [];
        }
    } else {
        // Add sample tasks if none exist
        tasks = [
            new Task(
                'Complete project proposal', 
                'Finish the quarterly project proposal document', 
                'high', 
                'work', 
                new Date(Date.now() + 86400000), // Tomorrow
                'in-progress',
                'urgent, project'
            ),
            new Task(
                'Grocery shopping', 
                'Buy ingredients for weekly meals', 
                'medium', 
                'personal', 
                new Date(Date.now() + 172800000), // Day after tomorrow
                'pending',
                'shopping, home'
            ),
            new Task(
                'Morning workout', 
                '30 minutes of cardio and strength training', 
                'low', 
                'health', 
                null,
                'completed',
                'fitness, health'
            )
        ];
        saveTasks();
    }
}

function saveTasks() {
    localStorage.setItem('taskmasterTasks', JSON.stringify(tasks));
}

// ===== DOM MANIPULATION FUNCTIONS =====
function displayTasks(filteredTasks = null) {
    const tasksToDisplay = filteredTasks || tasks;
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasksList) return;
    
    if (tasksToDisplay.length === 0) {
        tasksList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    tasksList.style.display = 'block';
    
    // ===== TEMPLATE LITERALS =====
    tasksList.innerHTML = tasksToDisplay.map(task => `
        <div class="task-item priority-${task.priority}" data-task-id="${task.id}">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${task.title}</h3>
                    ${task.description ? <p class="task-description">${task.description}</p> : ''}
                    <div class="task-meta">
                        <span class="task-status status-${task.status.replace('-', '')}">
                            ${getStatusText(task.status)}
                        </span>
                        <span class="task-priority">Priority: ${task.priority}</span>
                        <span class="task-category">${task.category}</span>
                        ${task.dueDate ? <span class="task-due">Due: ${formatDate(task.dueDate)}</span> : ''}
                    </div>
                    ${task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => <span class="tag">#${tag}</span>).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="action-btn btn-complete" onclick="toggleTaskStatus('${task.id}')">
                        ${task.status === 'completed' ? '↶' : '✓'}
                    </button>
                    <button class="action-btn btn-edit" onclick="editTask('${task.id}')">✏️</button>
                    <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateTaskStats();
}

function updateTaskStats() {
    // Update stats on tasks page
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const pendingTasks = document.getElementById('pendingTasks');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (totalTasks) {
        totalTasks.textContent = tasks.length;
    }
    
    if (completedTasks) {
        const completed = tasks.filter(task => task.status === 'completed').length;
        completedTasks.textContent = completed;
    }
    
    if (pendingTasks) {
        const pending = tasks.filter(task => task.status === 'pending').length;
        pendingTasks.textContent = pending;
    }
    
    if (progressPercentage) {
        const completed = tasks.filter(task => task.status === 'completed').length;
        const percentage = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        progressPercentage.textContent = ${percentage}%;
    }
    
    // Update hero stats on home page
    updateHeroStats();
}

function updateHeroStats() {
    const heroStats = document.getElementById('heroStats');
    if (!heroStats) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => 
        task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date()
    ).length;
    
    // ===== TEMPLATE LITERALS =====
    heroStats.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${totalTasks}</span>
            <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${completedTasks}</span>
            <span class="stat-label">Completed</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${inProgressTasks}</span>
            <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${overdueTasks}</span>
            <span class="stat-label">Overdue</span>
        </div>
    `;
}

// ===== CONDITIONAL BRANCHING FUNCTIONS =====
function getStatusText(status) {
    if (status === 'pending') {
        return 'Pending';
    } else if (status === 'in-progress') {
        return 'In Progress';
    } else if (status === 'completed') {
        return 'Completed';
    } else {
        return 'Unknown';
    }
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // ===== CONDITIONAL BRANCHING =====
        if (task.status === 'completed') {
            task.status = 'pending';
        } else {
            task.status = 'completed';
        }
        task.updatedAt = new Date().toISOString();
        saveTasks();
        displayTasks();
        
        // Show feedback
        showFeedback(Task marked as ${task.status}, 'success');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Pre-fill the form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDueDate').value = task.dueDate ? formatDateForInput(task.dueDate) : '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskTags').value = task.tags.join(', ');
        
        // Change form to edit mode
        const form = document.getElementById('taskForm');
        form.dataset.editMode = taskId;
        form.querySelector('button[type="submit"]').textContent = 'Update Task';
        
        // Scroll to form
        window.location.href = 'add-task.html';
    }
}

function deleteTask(taskId) {
    // ===== CONDITIONAL BRANCHING =====
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        // ===== ARRAY METHOD (filter) =====
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        displayTasks();
        showFeedback('Task deleted successfully', 'success');
    }
}

// ===== SEARCH AND FILTER FUNCTIONS =====
function searchTasks() {
    const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
    
    if (!searchTerm) {
        displayTasks();
        return;
    }
    
    // ===== ARRAY METHODS (filter, some, includes) =====
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    displayTasks(filteredTasks);
}

function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (statusFilter === 'all') {
        displayTasks();
        return;
    }
    
    // ===== ARRAY METHOD (filter) =====
    const filteredTasks = tasks.filter(task => task.status === statusFilter);
    displayTasks(filteredTasks);
}

function clearFilters() {
    document.getElementById('taskSearch').value = '';
    document.getElementById('statusFilter').value = 'all';
    displayTasks();
}

// ===== FORM HANDLING =====
function handleTaskFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form values
    const title = formData.get('taskTitle').trim();
    const description = formData.get('taskDescription').trim();
    const priority = formData.get('taskPriority');
    const category = formData.get('taskCategory');
    const dueDate = formData.get('taskDueDate');
    const status = formData.get('taskStatus');
    const tags = formData.get('taskTags').trim();
    
    // ===== CONDITIONAL BRANCHING (Validation) =====
    if (!title) {
        showFormError('titleError', 'Task title is required');
        return;
    }
    
    if (!priority) {
        showFeedback('Please select a priority level', 'error');
        return;
    }
    
    // Check if we're in edit mode
    const editMode = form.dataset.editMode;
    
    if (editMode) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === editMode);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
            tasks[taskIndex].priority = priority;
            tasks[taskIndex].category = category;
            tasks[taskIndex].dueDate = dueDate ? new Date(dueDate) : null;
            tasks[taskIndex].status = status;
            tasks[taskIndex].tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
            tasks[taskIndex].updatedAt = new Date().toISOString();
            
            saveTasks();
            showFeedback('Task updated successfully!', 'success');
            
            // Reset form and redirect after a delay
            setTimeout(() => {
                window.location.href = 'tasks.html';
            }, 1500);
        }
    } else {
        // Create new task
        const newTask = new Task(title, description, priority, category, dueDate ? new Date(dueDate) : null, status, tags);
        
        // ===== ARRAY METHOD (push) =====
        tasks.push(newTask);
        saveTasks();
        showFeedback('Task added successfully!', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('ratingDisplay').textContent = '3 stars';
        
        // Redirect to tasks page after a delay
        setTimeout(() => {
            window.location.href = 'tasks.html';
        }, 1500);
    }
}

function showFormError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function showFeedback(message, type) {
    const feedbackElement = document.getElementById('formFeedback');
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = form-feedback ${type};
        feedbackElement.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 3000);
    }
}

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    if (!date) return 'No due date';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

function formatDateForInput(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return ${year}-${month}-${day};
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Load tasks from localStorage
    loadTasks();
    
    // Set up form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
    
    // Set up real-time search
    const searchInput = document.getElementById('taskSearch');
    if (searchInput) {
        searchInput.addEventListener('input', searchTasks);
    }
    
    // Initialize the display
    displayTasks();
    
    // Set minimum date for due date to today
    const dueDateInput = document.getElementById('taskDueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
});