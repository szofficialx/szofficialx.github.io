document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();

    if (taskText === "") return;

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (tasks.some(task => task.toLowerCase() === taskText.toLowerCase())) {
        alert("Task already exists!");
        return;
    }

    let li = document.createElement("li");
    li.innerHTML = `
        <i class="fa fa-bars drag-handle"></i>
        <span class="task-text" onclick="editTask(this)">${taskText}</span>
        <button class="delete" onclick="removeTask(this)">
            <i class="fa fa-close"></i>
        </button>
    `;

    let dragHandle = li.querySelector(".drag-handle");
    dragHandle.style.cursor = "grab";

    dragHandle.addEventListener("mousedown", () => {
        li.draggable = true;
    });

    dragHandle.addEventListener("mouseup", () => {
        li.draggable = false;
    });

    applyTaskEvents(li);

    let taskList = document.getElementById("taskList");
    taskList.insertBefore(li, taskList.firstChild);

    saveTask(taskText);
    taskInput.value = "";

    emptyMessage.style.display = "none";
}

function editTask(span) {
    let taskText = span.innerText;
    let input = document.createElement("input");
    input.type = "text";
    input.value = taskText;
    input.classList.add("edit-input");

    span.replaceWith(input);
    input.focus();

    input.addEventListener("blur", function() {
        saveEditedTask(input, taskText);
    });

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            saveEditedTask(input, taskText);
        }
    });
}

function saveEditedTask(input, oldTaskText) {
    let newTaskText = input.value.trim();
    if (newTaskText === "") {
        alert("Task cannot be empty!");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskIndex = tasks.indexOf(oldTaskText);

    if (taskIndex !== -1) {
        tasks[taskIndex] = newTaskText;
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    let span = document.createElement("span");
    span.classList.add("task-text");
    span.onclick = function() { editTask(span); };
    span.textContent = newTaskText;

    input.replaceWith(span);
}

function removeTask(button) {
    let li = button.parentElement;
    let taskText = li.querySelector(".task-text").textContent.trim();
    li.remove();
    deleteTask(taskText);
}

function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.unshift(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(t => t !== task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    let emptyMessage = document.getElementById("emptyMessage");
    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
    }
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.innerHTML = `
            <i class="fa fa-bars drag-handle"></i>
            <span class="task-text" onclick="editTask(this)">${task}</span>
            <button class="delete" onclick="removeTask(this)">
                <i class="fa fa-close"></i>
            </button>
        `;

        let dragHandle = li.querySelector(".drag-handle");
        dragHandle.style.cursor = "grab";

        dragHandle.addEventListener("mousedown", () => {
            li.draggable = true;
        });

        dragHandle.addEventListener("mouseup", () => {
            li.draggable = false;
        });

        applyTaskEvents(li);

        taskList.appendChild(li);
    });
}

// Drag-and-Drop Handlers (Desktop)
function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.innerHTML);
    event.target.classList.add("dragging");

    event.target.addEventListener("dragend", () => {
        event.target.classList.remove("dragging");
    }, { once: true });
}

function dragOver(event) {
    event.preventDefault(); 
    let draggingItem = document.querySelector(".dragging");
    let taskList = document.getElementById("taskList");
    let items = [...taskList.querySelectorAll("li:not(.dragging)")];

    let nextItem = items.find(item => event.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2);
    if (nextItem) {
        taskList.insertBefore(draggingItem, nextItem);
    } else {
        taskList.appendChild(draggingItem);
    }
}

function drop(event) {
    event.preventDefault();
    let draggingItem = document.querySelector(".dragging");
    draggingItem.classList.remove("dragging");

    let newOrder = [...document.querySelectorAll("#taskList li")].map(li => 
        li.querySelector(".task-text").textContent.trim()
    );

    localStorage.setItem("tasks", JSON.stringify(newOrder));
}

// Mobile Touch Support
let touchStartY = 0;
let draggingElement = null;

function touchStart(event) {
    let dragHandle = event.target.closest(".drag-handle");
    if (!dragHandle) return;

    draggingElement = event.target.closest("li");
    touchStartY = event.touches[0].clientY;
    draggingElement.classList.add("dragging");
}

function touchMove(event) {
    event.preventDefault();
    let touchY = event.touches[0].clientY;
    let taskList = document.getElementById("taskList");
    let items = [...taskList.querySelectorAll("li:not(.dragging)")];

    let nextItem = items.find(item => touchY < item.getBoundingClientRect().top + item.offsetHeight / 2);
    if (nextItem) {
        taskList.insertBefore(draggingElement, nextItem);
    } else {
        taskList.appendChild(draggingElement);
    }
}

function touchEnd() {
    if (draggingElement) {
        draggingElement.classList.remove("dragging");
        draggingElement = null;

        let newOrder = [...document.querySelectorAll("#taskList li")].map(li => 
            li.querySelector(".task-text").textContent.trim()
        );
        localStorage.setItem("tasks", JSON.stringify(newOrder));
    }
}

function applyTaskEvents(li) {
    // Drag-and-drop (Desktop)
    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);

    // Touch support (Mobile)
    li.addEventListener("touchstart", touchStart);
    li.addEventListener("touchmove", touchMove);
    li.addEventListener("touchend", touchEnd);
}
