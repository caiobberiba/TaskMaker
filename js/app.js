// TaskMaker - To-Do List SPA
// Dados em localStorage, interface responsiva, acessível e intuitiva

const MAX_TASKS = 100;
const TASKS_KEY = 'taskmaker_tasks';
let tasks = [];
let currentSort = 'az'; // az, za, date-near, date-far
let draggedTaskId = null;

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
function loadTasks() {
    const data = localStorage.getItem(TASKS_KEY);
    tasks = data ? JSON.parse(data) : [];
}
function isValidDate(dateStr) {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return date > now;
}
function taskExists(name, date, excludeId = null) {
    return tasks.some(t => t.name.trim().toLowerCase() === name.trim().toLowerCase() && t.date === date && t.id !== excludeId);
}
function sortTasks() {
    if (currentSort === 'az') {
        tasks.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'za') {
        tasks.sort((a, b) => b.name.localeCompare(a.name));
    } else if (currentSort === 'date-near') {
        tasks.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (currentSort === 'date-far') {
        tasks.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
        });
    }
    saveTasks();
}
function filterTasks(type) {
    if (type === 'all') return tasks;
    if (type === 'pending') return tasks.filter(t => !t.completed);
    if (type === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}
function updateTaskCounter() {
    const counter = document.getElementById('task-counter');
    if (counter) counter.textContent = `Tarefa(s): ${tasks.length}/${MAX_TASKS}`;
}
function renderTasks() {
    ['all', 'pending', 'completed'].forEach(type => {
        const list = document.getElementById('list-' + type);
        const msg = document.getElementById('msg-' + type);
        const filtered = filterTasks(type);
        list.innerHTML = '';
        if (filtered.length === 0) {
            msg.style.display = 'block';
        } else {
            msg.style.display = 'none';
            filtered.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item card-${type}`;
                li.setAttribute('draggable', 'true');
                li.setAttribute('data-id', task.id);
                let dateColor = '';
                if (task.date) {
                    const now = new Date();
                    const date = new Date(task.date);
                    const diff = (date - now) / (1000 * 60 * 60 * 24);
                    if (diff < 1) dateColor = 'color:#e53935;';
                    else if (diff < 3) dateColor = 'color:#ff9800;';
                    else dateColor = 'color:#1976d2;';
                }
                li.innerHTML = `
                    <span class="task-name">${task.name}</span>
                    ${task.desc ? `<span class="task-desc" style="display:block;text-align:left;margin-left:0;">${task.desc}</span>` : ''}
                    ${task.date ? `<span class="task-date" style="${dateColor};display:flex;align-items:center;min-width:140px;max-width:95%;background:#e3f2fd;border-radius:8px;padding:1.5rem 1.3rem;margin-top:0.7rem;text-align:left;box-sizing:border-box;line-height:1.35;">${new Date(task.date).toLocaleString()}</span>` : ''}
                `;
                li.setAttribute('tabindex', '0');
                // botão concluir removido
                // botões removidos do card
                li.addEventListener('click', (ev) => {
                    // Evita abrir popup se clicar durante drag
                    if (ev.target.classList.contains('dragging')) return;
                    openViewModal(task.id);
                });
function openViewModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const modal = document.createElement('div');
    modal.className = 'modal-bg';
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <h3 style="color:#1976d2;margin-bottom:1rem;">Detalhes da Tarefa</h3>
            <div style="margin-bottom:1.2rem;">
                <div style="font-size:1.15rem;font-weight:600;color:#222;margin-bottom:0.5rem;">${task.name}</div>
                ${task.desc ? `<div style="font-size:1rem;color:#444;margin-bottom:0.5rem;">${task.desc}</div>` : ''}
                ${task.date ? `<div style="font-size:1rem;color:#1976d2;background:#e3f2fd;border-radius:6px;padding:0.2rem 0.5rem;display:inline-block;">${new Date(task.date).toLocaleString()}</div>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;gap:0.7rem;">
                <button class="btn-editar" style="background:#1976d2;color:#fff;flex:1;" title="Editar">Editar</button>
                <button class="btn-remover" style="background:#e53935;color:#fff;flex:1;" title="Remover">Remover</button>
            </div>
            <button type="button" id="close-view-modal" style="margin-top:1.2rem;background:#e3f2fd;color:#1976d2;border-radius:8px;padding:0.6rem 1.2rem;border:none;cursor:pointer;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-view-modal').onclick = () => modal.remove();
    modal.querySelector('.btn-editar').onclick = () => {
        modal.remove();
        openEditModal(id);
    };
    modal.querySelector('.btn-remover').onclick = () => {
        modal.remove();
        deleteTask(id);
    };
}
                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragend', handleDragEnd);
                list.appendChild(li);
            });
        }
    });
    updateTaskCounter();
}
function addTask(name, desc, date) {
    if (!name || name.trim().length === 0) return alert('Nome da tarefa é obrigatório.');
    if (name.length > 200) return alert('Nome da tarefa deve ter no máximo 200 caracteres.');
    if (tasks.length >= MAX_TASKS) return alert('Limite de 100 tarefas atingido.');
    if (date && !isValidDate(date)) return alert('Data/hora inválida ou não futura.');
    if (taskExists(name, date)) return alert('Já existe uma tarefa com este nome e data/hora.');
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    tasks.push({ id, name: name.trim(), desc: desc.trim(), date, completed: false });
    sortTasks();
    renderTasks();
}
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const modal = document.createElement('div');
    modal.className = 'modal-bg';
    modal.innerHTML = `
        <div class="modal">
            <h3 style="color:#0078d4;margin-bottom:1rem;">Editar Tarefa</h3>
            <form id="edit-form">
                <div class="form-group">
                    <label for="edit-name" class="form-title">Nome da tarefa*</label>
                    <input type="text" id="edit-name" maxlength="200" required value="${task.name}" placeholder="Digite o nome da tarefa">
                </div>
                <div class="form-group">
                    <label for="edit-desc" class="form-title">Descrição</label>
                    <input type="text" id="edit-desc" value="${task.desc}" placeholder="Descreva a tarefa (opcional)">
                </div>
                <div class="form-group">
                    <label for="edit-date" class="form-title">Data/hora de conclusão</label>
                    <input type="datetime-local" id="edit-date" value="${task.date}">
                </div>
                <div style="margin-top:1rem;display:flex;justify-content:space-between;gap:0.5rem;">
                    <button type="submit" style="background:#0078d4;color:#fff;">Salvar</button>
                    <button type="button" id="close-modal" style="background:#e3f2fd;color:#0078d4;">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('edit-name').focus();
    document.getElementById('close-modal').onclick = () => modal.remove();
    document.getElementById('edit-form').onsubmit = function(e) {
    e.preventDefault();
    const newName = document.getElementById('edit-name').value;
    const newDesc = document.getElementById('edit-desc').value;
    const newDate = document.getElementById('edit-date').value;
    if (!newName || newName.trim().length === 0) return alert('Nome da tarefa é obrigatório.');
    if (newName.length > 200) return alert('Nome da tarefa deve ter no máximo 200 caracteres.');
    if (newDate && !isValidDate(newDate)) return alert('Data/hora inválida ou não futura.');
    if (taskExists(newName, newDate, id)) return alert('Já existe uma tarefa com este nome e data/hora.');
    const changed = (task.name !== newName.trim()) || (task.desc !== (newDesc ? newDesc.trim() : '')) || (task.date !== (newDate || ''));
    task.name = newName.trim();
    task.desc = newDesc ? newDesc.trim() : '';
    task.date = newDate || '';
    sortTasks();
    renderTasks();
    modal.remove();
    if (changed) showFeedback('Tarefa salva com sucesso!');
    };
}
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        sortTasks();
        renderTasks();
    }
}
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    sortTasks();
    renderTasks();
        showFeedback('Tarefa removida com sucesso!');
}
function deleteAllTasks() {
    if (confirm('Tem certeza que deseja excluir todas as tarefas?')) {
        tasks = [];
        sortTasks();
        renderTasks();
    }
}
function searchTasks(query) {
    query = query.trim().toLowerCase();
    ['all', 'pending', 'completed'].forEach(type => {
        const list = document.getElementById('list-' + type);
        const msg = document.getElementById('msg-' + type);
        const filtered = filterTasks(type).filter(t => t.name.toLowerCase().includes(query));
        list.innerHTML = '';
        if (filtered.length === 0) {
            msg.style.display = 'block';
        } else {
            msg.style.display = 'none';
            filtered.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item card-${type}`;
                li.setAttribute('draggable', 'true');
                li.setAttribute('data-id', task.id);
                let dateColor = '';
                if (task.date) {
                    const now = new Date();
                    const date = new Date(task.date);
                    const diff = (date - now) / (1000 * 60 * 60 * 24);
                    if (diff < 1) dateColor = 'color:#e53935;';
                    else if (diff < 3) dateColor = 'color:#ff9800;';
                    else dateColor = 'color:#1976d2;';
                }
                li.innerHTML = `
                    <span class="task-name">${task.name}</span>
                    ${task.desc ? `<span class="task-desc">${task.desc}</span>` : ''}
                    ${task.date ? `<span class="task-date" style="${dateColor}">Deadline: ${new Date(task.date).toLocaleString()}</span>` : ''}
                `;
                li.setAttribute('tabindex', '0');
                // Card clicável para abrir modal de detalhes
                li.onclick = () => openTaskDetailsModal(task);
                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragend', handleDragEnd);
                list.appendChild(li);
// Modal de detalhes da tarefa
function openTaskDetailsModal(task) {
    const modalBg = document.createElement('div');
    modalBg.className = 'modal-bg';
    modalBg.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <h3 style="color:#1976d2;margin-bottom:1rem;">Detalhes da Tarefa</h3>
            <div style="margin-bottom:1.2rem;">
                <div style="font-size:1.15rem;font-weight:600;color:#222;margin-bottom:0.5rem;">${task.name}</div>
                ${task.desc ? `<div style="font-size:1rem;color:#444;margin-bottom:0.5rem;">${task.desc}</div>` : ''}
                ${task.date ? `<div style="font-size:1rem;color:#1976d2;background:#e3f2fd;border-radius:6px;padding:0.2rem 0.5rem;display:inline-block;">${new Date(task.date).toLocaleString()}</div>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;gap:0.7rem;">
                <button class="btn-editar" style="background:#1976d2;color:#fff;flex:1;" title="Editar">Editar</button>
                <button class="btn-remover" style="background:#e53935;color:#fff;flex:1;" title="Remover">Remover</button>
            </div>
            <button type="button" id="close-view-modal" style="margin-top:1.2rem;background:#e3f2fd;color:#1976d2;border-radius:8px;padding:0.6rem 1.2rem;border:none;cursor:pointer;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modalBg);
    document.getElementById('close-view-modal').onclick = () => modalBg.remove();
    modalBg.querySelector('.btn-editar').onclick = () => {
        modalBg.remove();
        openEditModal(task.id);
    };
    modalBg.querySelector('.btn-remover').onclick = () => {
        modalBg.remove();
        deleteTask(task.id);
    };
}
// Feedback message (global)
function showFeedback(msg) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-msg';
    feedback.innerHTML = `<span class="feedback-icon">✔️</span> <span>${msg}</span>`;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.classList.add('fadeout');
        setTimeout(() => feedback.remove(), 700);
    }, 1800);
}

// Confirmation modal (global)
function showConfirm(msg, onConfirm) {
    const confirmBg = document.createElement('div');
    confirmBg.className = 'modal-bg';
    confirmBg.innerHTML = `
        <div class="modal" style="max-width:340px;">
            <h3 style="color:#e53935;margin-bottom:1rem;">Confirmação</h3>
            <div style="margin-bottom:1.2rem;text-align:center;">${msg}</div>
            <div style="display:flex;justify-content:center;gap:0.7rem;">
                <button class="btn-remover" style="background:#e53935;color:#fff;" id="confirm-yes">Sim</button>
                <button class="btn-cancelar" style="background:#e3f2fd;color:#1976d2;" id="confirm-no">Não</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmBg);
    confirmBg.querySelector('#confirm-yes').onclick = () => {
        confirmBg.remove();
        onConfirm();
    };
    confirmBg.querySelector('#confirm-no').onclick = () => confirmBg.remove();
}
            });
        }
    });
    updateTaskCounter();
}
function handleDragStart(e) {
    draggedTaskId = e.target.getAttribute('data-id');
    e.target.classList.add('dragging');
    const board = document.querySelector('.kanban-board');
    if (board) board.classList.add('drag-scroll');
}
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedTaskId = null;
    const board = document.querySelector('.kanban-board');
    if (board) board.classList.remove('drag-scroll');
}
['all', 'pending', 'completed'].forEach(type => {
    const col = document.getElementById(type === 'all' ? 'all-tasks' : (type === 'pending' ? 'pending-tasks' : 'completed-tasks'));
    if (col) {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', e => {
            col.classList.remove('drag-over');
        });
        col.addEventListener('drop', e => {
            col.classList.remove('drag-over');
            if (!draggedTaskId) return;
            const task = tasks.find(t => t.id === draggedTaskId);
            if (!task) return;
            if (type === 'pending') task.completed = false;
            if (type === 'completed') task.completed = true;
            sortTasks();
            renderTasks();
        });
    }
});
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    sortTasks();
    renderTasks();
    document.getElementById('task-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('task-name').value;
        const desc = document.getElementById('task-desc').value;
        const date = document.getElementById('task-date').value;
        addTask(name, desc, date);
        document.getElementById('task-form').reset();
    });
    document.getElementById('delete-all').addEventListener('click', deleteAllTasks);
    document.getElementById('sort-select').addEventListener('change', e => {
        currentSort = e.target.value;
        sortTasks();
        renderTasks();
    });
    document.getElementById('search-input').addEventListener('input', e => {
        searchTasks(e.target.value);
    });
});
