(() => {
    const { makePlan, isoDate, addDays, isValidDate } = globalThis.LernplanerPlan;
    const storageKey = "finnholle:lernplaner:v1";
    const form = document.getElementById("task-form");
    const titleInput = document.getElementById("task-title");
    const minutesInput = document.getElementById("task-minutes");
    const deadlineInput = document.getElementById("task-deadline");
    const submit = document.getElementById("task-submit");
    const budget = document.getElementById("daily-budget");
    const exampleButton = document.querySelector("[data-load-example]");
    const taskList = document.getElementById("task-list");
    const taskEmpty = document.getElementById("task-empty");
    const taskCount = document.getElementById("task-count");
    const weekList = document.getElementById("week-list");
    const unplanned = document.getElementById("planner-unplanned");
    const unplannedList = document.getElementById("unplanned-list");
    const range = document.getElementById("plan-range");
    const plannedTime = document.getElementById("planned-minutes");
    const openTime = document.getElementById("open-minutes");
    const message = document.getElementById("planner-message");
    const storageNotice = document.getElementById("storage-notice");
    const dayFormat = new Intl.DateTimeFormat("de-CH", { weekday: "short", timeZone: "UTC" });
    const dateFormat = new Intl.DateTimeFormat("de-CH", { day: "numeric", month: "short", timeZone: "UTC" });
    const formats = { day: dayFormat, date: dateFormat };
    const allowedBudgets = [...budget.options].map(option => Number(option.value));
    let today = isoDate(new Date());
    let state = readState();

    function validTask(task) {
        return task && typeof task.id === "string" && typeof task.title === "string" &&
            task.title.trim().length > 0 && task.title.length <= titleInput.maxLength &&
            Number.isInteger(task.minutes) && task.minutes > 0 && task.minutes <= Number(minutesInput.max) &&
            isValidDate(task.deadline);
    }

    function readState() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            if (!saved) return { dailyMinutes: 90, tasks: [] };
            const tasks = new Map();
            if (Array.isArray(saved.tasks)) {
                for (const task of saved.tasks.filter(validTask)) {
                    const { id, title, minutes, deadline } = task;
                    tasks.set(id, { id, title, minutes, deadline, done: task.done === true });
                }
            }
            return {
                dailyMinutes: allowedBudgets.includes(saved.dailyMinutes) ? saved.dailyMinutes : 90,
                tasks: [...tasks.values()],
            };
        } catch {
            storageNotice.hidden = false;
            return { dailyMinutes: 90, tasks: [] };
        }
    }

    function saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
            storageNotice.hidden = true;
        } catch {
            storageNotice.hidden = false;
        }
    }

    function element(tagName, className, content) {
        const node = document.createElement(tagName);
        if (className) node.className = className;
        if (content !== undefined) node.textContent = content;
        return node;
    }

    function dateText(iso, format = "date") {
        return formats[format].format(new Date(iso + "T12:00:00Z"));
    }

    function duration(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainder = minutes % 60;
        if (!hours) return minutes + " Min.";
        return hours + " Std." + (remainder ? " " + remainder + " Min." : "");
    }

    function taskRow(task) {
        const row = element("li", "task-item");
        row.dataset.id = task.id;
        row.classList.toggle("task-done", task.done);
        const itemLabel = element("label", "task-check");
        const check = element("input");
        check.type = "checkbox";
        check.dataset.complete = task.id;
        check.checked = task.done;
        check.setAttribute("aria-label", task.title + " als erledigt markieren");
        const description = element("span", "task-description");
        const deadlineText = task.deadline < today ? "Überfällig seit " : "Abgabe ";
        description.append(element("strong", "task-name", task.title),
            element("span", "task-meta", duration(task.minutes) + " · " + deadlineText + dateText(task.deadline)));
        itemLabel.append(check, description);

        const remove = element("button", "task-remove");
        remove.type = "button";
        remove.dataset.remove = task.id;
        remove.setAttribute("aria-label", task.title + " entfernen");
        const symbol = element("span", "", "×");
        symbol.setAttribute("aria-hidden", "true");
        remove.append(symbol);
        row.append(itemLabel, remove);
        return row;
    }

    function weekDay(day) {
        const row = element("li", "week-day");
        row.dataset.date = day.date;
        row.classList.toggle("current-day", day.date === today);
        const date = element("time", "week-date");
        date.dateTime = day.date;
        date.append(element("strong", "", day.date === today ? "Heute" : dateText(day.date, "day")),
            element("span", "", dateText(day.date)));
        const content = element("div", "week-content");
        const slots = element("ul", "day-slots");
        for (const slot of day.slots) {
            const item = element("li", "day-slot");
            item.dataset.taskId = slot.taskId;
            item.dataset.minutes = String(slot.minutes);
            item.append(element("span", "slot-name", slot.title), element("strong", "", duration(slot.minutes)));
            slots.append(item);
        }
        if (day.used) content.append(slots);
        else content.append(element("p", "week-empty", "Keine Aufgaben geplant"));

        const capacity = element("div", "week-capacity");
        const meter = element("meter");
        meter.min = 0;
        meter.max = state.dailyMinutes;
        meter.value = day.used;
        meter.setAttribute("aria-label", "Verplante Lernzeit in Minuten");
        capacity.append(meter, element("span", "", day.used + " / " + state.dailyMinutes + " Min."));
        row.append(date, content, capacity);
        return row;
    }

    function unplannedRow(task) {
        const row = element("li", "unplanned-item");
        const reason = task.reason === "overdue" ? "Abgabe vorbei" : "Noch nicht eingeplant";
        row.append(element("strong", "", task.title), element("span", "", duration(task.minutes) + " · " + reason));
        return row;
    }

    function renderPlan() {
        const pending = state.tasks.filter(task => !task.done);
        const plan = makePlan(pending, today, state.dailyMinutes);
        plannedTime.textContent = duration(plan.plannedMinutes);
        openTime.textContent = duration(plan.totalMinutes - plan.plannedMinutes);
        range.textContent = dateText(today) + " – " + dateText(plan.days.at(-1).date);
        weekList.replaceChildren(...plan.days.map(weekDay));
        unplanned.hidden = !plan.unplanned.length;
        unplannedList.replaceChildren(...plan.unplanned.map(unplannedRow));
    }

    function render() {
        const newDay = isoDate(new Date());
        if (newDay !== today) {
            today = newDay;
            deadlineInput.min = today;
            if (deadlineInput.value < today) deadlineInput.value = today;
        }
        budget.value = String(state.dailyMinutes);
        taskCount.textContent = String(state.tasks.length);
        taskEmpty.hidden = state.tasks.length > 0;
        exampleButton.hidden = state.tasks.length > 0;
        taskList.replaceChildren(...state.tasks.map(taskRow));
        renderPlan();
    }

    function newTask(title, minutes, deadline) {
        const id = globalThis.crypto?.randomUUID?.() ?? Date.now() + "-" + Math.random();
        return { id, title, minutes, deadline, done: false };
    }

    function applyChange(statusText) {
        saveState();
        render();
        message.textContent = statusText;
    }

    function onSubmit(event) {
        event.preventDefault();
        if (isoDate(new Date()) !== today) render();
        const task = newTask(titleInput.value.trim(), minutesInput.valueAsNumber, deadlineInput.value);
        if (!task.title) {
            message.textContent = "Gib deiner Aufgabe einen Namen.";
            titleInput.focus();
            return;
        }
        if (!validTask(task) || task.deadline < today) {
            message.textContent = "Prüfe den Aufwand und wähle einen Abgabetermin ab heute.";
            return;
        }
        state.tasks.push(task);
        applyChange(task.title + " hinzugefügt.");
        titleInput.value = "";
        titleInput.focus();
    }

    function toggleTask(event) {
        const checkbox = event.target.closest("[data-complete]");
        if (!checkbox) return;
        const index = state.tasks.findIndex(task => task.id === checkbox.dataset.complete);
        if (index === -1) return;
        const task = state.tasks[index];
        task.done = checkbox.checked;
        applyChange(task.title + (task.done ? " erledigt." : " wieder offen."));
        taskList.children[index].querySelector("[data-complete]").focus();
    }

    function removeTask(event) {
        const button = event.target.closest("[data-remove]");
        if (!button) return;
        const index = state.tasks.findIndex(task => task.id === button.dataset.remove);
        if (index === -1) return;
        const [task] = state.tasks.splice(index, 1);
        applyChange(task.title + " entfernt.");
        const nextRow = taskList.children[Math.min(index, taskList.children.length - 1)];
        if (nextRow) nextRow.querySelector("[data-remove]").focus();
        else exampleButton.focus();
    }

    form.addEventListener("submit", onSubmit);
    budget.addEventListener("change", () => {
        state.dailyMinutes = Number(budget.value);
        applyChange("Mit " + duration(state.dailyMinutes) + " pro Tag neu geplant.");
    });
    taskList.addEventListener("change", toggleTask);
    taskList.addEventListener("click", removeTask);
    exampleButton.addEventListener("click", () => {
        if (state.tasks.length) return;
        const start = isoDate(new Date());
        state.tasks = [
            newTask("Matheaufgaben lösen", 45, addDays(start, 1)),
            newTask("Python-Übung abschliessen", 100, addDays(start, 3)),
            newTask("Präsentation vorbereiten", 75, addDays(start, 5)),
        ];
        applyChange("Drei Beispielaufgaben hinzugefügt.");
        titleInput.focus();
    });
    window.addEventListener("focus", () => {
        if (isoDate(new Date()) !== today) render();
    });
    window.addEventListener("storage", event => {
        if (event.key !== storageKey && event.key !== null) return;
        state = readState();
        render();
    });

    deadlineInput.min = today;
    deadlineInput.max = "9999-12-31";
    deadlineInput.value = addDays(today, 2);
    submit.disabled = false;
    budget.disabled = false;
    exampleButton.disabled = false;
    render();
})();
