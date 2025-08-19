// EmailJS Konfiguration
// Ersetzen Sie diese Werte mit Ihren eigenen EmailJS-Daten

const EMAILJS_CONFIG = {
    // Ihre EmailJS Public Key
    PUBLIC_KEY: "B3_4Gvd1us9ci7ZfM",
    
    // Ihre EmailJS Service ID
    SERVICE_ID: "service_i80dt1w",
    
    // Ihre EmailJS Template ID
    TEMPLATE_ID: "template_1234567",
    
    // Template-Variablen, die an EmailJS gesendet werden
    TEMPLATE_PARAMS: {
        to_name: "Finn Holle",
        reply_to: "", // Wird dynamisch gesetzt
        from_name: "", // Wird dynamisch gesetzt
        from_email: "", // Wird dynamisch gesetzt
        subject: "", // Wird dynamisch gesetzt
        message: "" // Wird dynamisch gesetzt
    }
};

// EmailJS initialisieren
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('EmailJS erfolgreich initialisiert');
    } else {
        console.error('EmailJS nicht geladen');
    }
}

// EmailJS senden
async function sendEmailJS(formData) {
    if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS nicht geladen');
    }

    const templateParams = {
        ...EMAILJS_CONFIG.TEMPLATE_PARAMS,
        from_name: formData.name,
        from_email: formData.email,
        reply_to: formData.email,
        subject: formData.subject,
        message: formData.message
    };

    return await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
    );
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EMAILJS_CONFIG, initEmailJS, sendEmailJS };
}
