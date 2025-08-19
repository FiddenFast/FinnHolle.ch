// Initialize Feather icons and set up event listeners after window is fully loaded
window.onload = () => {
	feather.replace();

	// Laufzeit-Korrektur der EmailJS-Konfiguration
	if (typeof EMAILJS_CONFIG !== 'undefined') {
		if (EMAILJS_CONFIG.SERVICE_ID !== 'service_i80dt1w') {
			console.warn('SERVICE_ID abweichend, korrigiere auf erwarteten Wert.', EMAILJS_CONFIG.SERVICE_ID);
			EMAILJS_CONFIG.SERVICE_ID = 'service_i80dt1w';
		}
		if (EMAILJS_CONFIG.TEMPLATE_ID !== 'template_1m58do8') {
			console.warn('TEMPLATE_ID abweichend, korrigiere auf erwarteten Wert.', EMAILJS_CONFIG.TEMPLATE_ID);
			EMAILJS_CONFIG.TEMPLATE_ID = 'template_1m58do8';
		}
	}

	// Initialize EmailJS
	console.log('Initialisiere EmailJS...');
	try {
		initEmailJS();
		console.log('EmailJS erfolgreich initialisiert');
	} catch (error) {
		console.error('Fehler beim Initialisieren von EmailJS:', error);
	}

	// Mobile menu functionality
	const mobileMenuButton = document.getElementById('mobile-menu-button');
	const navLinks = document.querySelector('.md\\:flex');

	if (mobileMenuButton && navLinks) {
		mobileMenuButton.addEventListener('click', () => {
			navLinks.classList.toggle('hidden');
			navLinks.classList.toggle('flex');
			navLinks.classList.toggle('flex-col');
			navLinks.classList.toggle('absolute');
			navLinks.classList.toggle('top-16');
			navLinks.classList.toggle('right-0');
			navLinks.classList.toggle('bg-white');
			navLinks.classList.toggle('w-full');
			navLinks.classList.toggle('p-4');
			navLinks.classList.toggle('shadow-lg');
		});
	}

	// Smooth scrolling for anchor links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth'
				});
				// Close mobile menu if open
				if (navLinks && !navLinks.classList.contains('hidden')) {
					navLinks.classList.add('hidden');
				}
			}
		});
	});

	// Kontaktformular Handler
	const contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			
			// Formular-Daten sammeln
			const formData = {
				name: document.getElementById('name').value.trim(),
				email: document.getElementById('email').value.trim(),
				subject: document.getElementById('subject').value.trim(),
				message: document.getElementById('message').value.trim()
			};

			// Validierung
			if (!formData.name || !formData.email || !formData.subject || !formData.message) {
				showNotification('Bitte füllen Sie alle Felder aus.', 'error');
				return;
			}

			if (!isValidEmail(formData.email)) {
				showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
				return;
			}

			// Submit-Button deaktivieren und Loading-State anzeigen
			const submitButton = contactForm.querySelector('button[type="submit"]');
			const originalButtonText = submitButton.textContent;
			submitButton.disabled = true;
			submitButton.textContent = 'Wird gesendet...';
			submitButton.classList.add('opacity-50', 'cursor-not-allowed');

			try {
				// EmailJS senden
				const serviceId = (typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.SERVICE_ID) ? EMAILJS_CONFIG.SERVICE_ID : 'service_i80dt1w';
				const templateId = (typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.TEMPLATE_ID) ? EMAILJS_CONFIG.TEMPLATE_ID : 'template_1m58do8';
				console.log('Sende E-Mail mit EmailJS...');
				console.log('Service ID:', serviceId);
				console.log('Template ID:', templateId);
				console.log('Formular-Daten:', formData);
				
				const result = await emailjs.send(
					serviceId,
					templateId,
					{
						from_name: formData.name,
						from_email: formData.email,
						subject: formData.subject,
						message: formData.message,
						to_name: "Finn Holle",
						reply_to: formData.email,
						to_email: formData.email,
						user_email: formData.email,
						to: formData.email,
						email: formData.email
					}
				);
				
				console.log('EmailJS Antwort:', result);
				
				if (result.status === 200) {
					showNotification('Vielen Dank für Ihre Nachricht! Ich werde mich so schnell wie möglich bei Ihnen melden.', 'success');
					contactForm.reset();
				} else {
					throw new Error('EmailJS returned non-200 status');
				}
			} catch (error) {
				console.error('Form submission error:', error);
				console.error('Error details:', {
					message: error.message,
					stack: error.stack,
					config: typeof EMAILJS_CONFIG !== 'undefined' ? EMAILJS_CONFIG : null
				});
				showNotification('Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie mich direkt per E-Mail.', 'error');
			} finally {
				// Submit-Button wieder aktivieren
				submitButton.disabled = false;
				submitButton.textContent = originalButtonText;
				submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
			}
		});
	}
};

// Hilfsfunktionen
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Bestehende Benachrichtigung entfernen, falls vorhanden
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Neue Benachrichtigung erstellen
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Styling basierend auf Typ
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.textContent = message;
    
    // Benachrichtigung zum DOM hinzufügen
    document.body.appendChild(notification);
    
    // Animation starten
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Benachrichtigung nach 5 Sekunden ausblenden
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
} 