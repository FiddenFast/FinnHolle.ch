(() => {
    const weekLength = 7;
    const minutesInDay = 24 * 60;

    function formatDate(year, month, day) {
        if (!Number.isInteger(year) || year < 0 || year > 9999) {
            throw new RangeError("Das Datum liegt ausserhalb des unterstützten Bereichs.");
        }

        return [
            String(year).padStart(4, "0"),
            String(month).padStart(2, "0"),
            String(day).padStart(2, "0"),
        ].join("-");
    }

    function parseCalendarDate(iso) {
        if (typeof iso !== "string" || iso.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            return null;
        }

        const [year, month, day] = iso.split("-").map(Number);
        const date = new Date(0);
        date.setUTCFullYear(year, month - 1, day);

        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            return null;
        }

        return date;
    }

    function isValidDate(iso) {
        return parseCalendarDate(iso) !== null;
    }

    function isoDate(date) {
        if (!(date instanceof Date)) {
            throw new TypeError("Ein Date-Objekt ist erforderlich.");
        }

        return formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    function addDays(iso, delta) {
        const date = parseCalendarDate(iso);
        if (!date || !Number.isSafeInteger(delta)) {
            throw new RangeError("Ein gültiges Datum und ganze Tage sind erforderlich.");
        }

        // ISO dates are calendar days, so UTC arithmetic here avoids DST offsets.
        date.setUTCDate(date.getUTCDate() + delta);
        return formatDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }

    function makePlan(tasks, startDate, dailyMinutes) {
        if (!Array.isArray(tasks)) {
            throw new TypeError("Aufgaben müssen als Liste vorliegen.");
        }
        if (!isValidDate(startDate) || !Number.isSafeInteger(dailyMinutes) ||
            dailyMinutes < 0 || dailyMinutes > minutesInDay) {
            throw new RangeError("Ein gültiger Starttag und ein Tagesbudget von 0 bis 1440 Minuten sind erforderlich.");
        }

        let totalMinutes = 0;
        for (const task of tasks) {
            if (!task || task.id == null || typeof task.title !== "string" ||
                !Number.isSafeInteger(task.minutes) || task.minutes <= 0 || !isValidDate(task.deadline)) {
                throw new RangeError("Jede Aufgabe braucht eine ID, einen Titel, positive Minuten und einen gültigen Termin.");
            }
            totalMinutes += task.minutes;
        }
        if (!Number.isSafeInteger(totalMinutes)) {
            throw new RangeError("Die Summe der Aufgabenminuten ist zu gross.");
        }

        const days = Array.from({ length: weekLength }, (_, index) => ({
            date: addDays(startDate, index),
            used: 0,
            slots: [],
        }));
        const unplanned = [];
        let plannedMinutes = 0;

        // Sorting a copy preserves the caller's list and keeps equal deadlines in input order.
        const orderedTasks = [...tasks].sort((first, second) => first.deadline.localeCompare(second.deadline));
        for (const { id: taskId, title, minutes, deadline } of orderedTasks) {
            if (deadline < startDate) {
                unplanned.push({ taskId, title, minutes, deadline, reason: "overdue" });
                continue;
            }

            let remaining = minutes;
            for (const day of days) {
                if (remaining === 0 || day.date > deadline) break;

                const slotMinutes = Math.min(remaining, dailyMinutes - day.used);
                if (slotMinutes === 0) continue;

                day.slots.push({ taskId, title, minutes: slotMinutes });
                day.used += slotMinutes;
                remaining -= slotMinutes;
                plannedMinutes += slotMinutes;
            }

            if (remaining > 0) {
                unplanned.push({ taskId, title, minutes: remaining, deadline, reason: "capacity" });
            }
        }

        return { days, unplanned, totalMinutes, plannedMinutes };
    }

    globalThis.LernplanerPlan = Object.freeze({ makePlan, isoDate, addDays, isValidDate });
})();
