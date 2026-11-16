(() => {
    document.documentElement.classList.add("has-js");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-site-menu]");

    if (menuToggle && menu) {
        function setMenu(open) {
            menu.toggleAttribute("data-open", open);
            menuToggle.setAttribute("aria-expanded", String(open));
        }

        menuToggle.addEventListener("click", () => setMenu(!menu.hasAttribute("data-open")));
        menu.addEventListener("click", event => {
            if (event.target.closest("a")) setMenu(false);
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && menu.hasAttribute("data-open")) {
                setMenu(false);
                menuToggle.focus();
            }
        });
        document.addEventListener("pointerdown", event => {
            if (menu.hasAttribute("data-open") && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenu(false);
            }
        });
        window.matchMedia("(min-width: 761px)").addEventListener("change", event => {
            if (event.matches) setMenu(false);
        });
    }

    const form = document.getElementById("contactForm");
    if (!form) return;

    const submitButton = document.getElementById("submitButton");
    const status = document.getElementById("form-status");
    const fields = ["name", "email", "subject", "message"].map(name => form.elements.namedItem(name));
    const buttonLabel = submitButton.textContent.trim();
    submitButton.disabled = false;

    function setStatus(message, state) {
        status.dataset.state = state;
        status.textContent = message;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitButton.disabled) return;

        const emptyField = fields.find(field => !field.value.trim());
        if (emptyField) {
            setStatus("Bitte fülle alle Felder aus.", "error");
            emptyField.focus();
            return;
        }

        const values = fields.map(field => field.value.trim());
        const [name, email, subject, message] = values;
        submitButton.disabled = true;
        submitButton.textContent = "Wird gesendet …";
        setStatus("Deine Nachricht wird gesendet …", "pending");

        try {
            const client = window.emailjs;
            if (!client || typeof EMAILJS_CONFIG === "undefined") throw new Error("EmailJS ist nicht verfügbar.");

            const config = EMAILJS_CONFIG;
            // Keep the site's live template until the placeholder in the config is replaced.
            const templateId = config.TEMPLATE_ID === "template_1234567" ? "template_1m58do8" : config.TEMPLATE_ID;
            client.init(config.PUBLIC_KEY);
            const result = await client.send(config.SERVICE_ID, templateId, {
                ...config.TEMPLATE_PARAMS,
                from_name: name,
                from_email: email,
                reply_to: email,
                subject,
                message,
                to_email: email,
                user_email: email,
                to: email,
                email,
            });

            if (result.status !== 200) throw new Error("EmailJS hat den Versand abgelehnt.");
            if (fields.every((field, index) => field.value.trim() === values[index])) {
                form.reset();
            }
            setStatus("Danke für deine Nachricht. Ich melde mich bei dir.", "success");
        } catch {
            setStatus("Die Nachricht konnte nicht gesendet werden. Du erreichst mich direkt per E-Mail.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = buttonLabel;
        }
    });
})();
