# EmailJS Einrichtung für das Kontaktformular

## Übersicht
Ihr Kontaktformular ist jetzt vollständig für EmailJS vorbereitet. EmailJS ermöglicht es, E-Mails direkt aus dem Browser zu senden, ohne dass ein Backend-Server erforderlich ist.

## Was wurde implementiert

### 1. Verbessertes Kontaktformular
- ✅ Vollständige Formular-Validierung
- ✅ Loading-States während des Sendens
- ✅ Schöne Benachrichtigungen (Success/Error)
- ✅ Responsive Design mit Tailwind CSS
- ✅ Barrierefreiheit (Labels, Placeholder, Pflichtfelder)

### 2. EmailJS Integration
- ✅ EmailJS CDN eingebunden
- ✅ Konfigurationsdatei (`emailjs-config.js`)
- ✅ Fehlerbehandlung und Logging
- ✅ Template-Parameter korrekt konfiguriert

## Einrichtungsschritte

### Schritt 1: EmailJS Account erstellen
1. Gehen Sie zu [EmailJS.com](https://www.emailjs.com/)
2. Erstellen Sie ein kostenloses Konto
3. Bestätigen Sie Ihre E-Mail-Adresse

### Schritt 2: E-Mail-Service einrichten
1. Gehen Sie zu "Email Services" in Ihrem Dashboard
2. Klicken Sie auf "Add New Service"
3. Wählen Sie Ihren E-Mail-Provider (Gmail, Outlook, etc.)
4. Folgen Sie den Anweisungen zur Authentifizierung
5. Notieren Sie sich die **Service ID** (z.B. `service_abc123`)

### Schritt 3: E-Mail-Template erstellen
1. Gehen Sie zu "Email Templates"
2. Klicken Sie auf "Create New Template"
3. Erstellen Sie ein Template mit folgendem Inhalt:

```html
Neue Kontaktanfrage von {{from_name}}

E-Mail: {{from_email}}
Betreff: {{subject}}

Nachricht:
{{message}}

---
Diese Nachricht wurde über Ihr Kontaktformular gesendet.
```

4. Speichern Sie das Template und notieren Sie sich die **Template ID** (z.B. `template_xyz789`)

### Schritt 4: Konfiguration aktualisieren
Öffnen Sie die Datei `emailjs-config.js` und aktualisieren Sie folgende Werte:

```javascript
const EMAILJS_CONFIG = {
    // Ihre EmailJS Public Key (aus dem Dashboard)
    PUBLIC_KEY: "IHRE_PUBLIC_KEY_HIER",
    
    // Ihre Service ID (aus Schritt 2)
    SERVICE_ID: "IHRE_SERVICE_ID_HIER",
    
    // Ihre Template ID (aus Schritt 3)
    TEMPLATE_ID: "IHRE_TEMPLATE_ID_HIER",
    
    // ... Rest der Konfiguration bleibt gleich
};
```

### Schritt 5: Testen
1. Öffnen Sie `contact.html` in Ihrem Browser
2. Füllen Sie das Formular aus
3. Klicken Sie auf "Nachricht senden"
4. Überprüfen Sie, ob die E-Mail ankommt

## Konfigurationsdateien

### `emailjs-config.js`
Enthält alle EmailJS-Einstellungen und kann einfach angepasst werden.

### `script.js`
Enthält die Formular-Logik, Validierung und EmailJS-Integration.

### `contact.html`
Das HTML-Formular mit verbesserter UX und Validierung.

## Wichtige Hinweise

### Kosten
- EmailJS bietet 200 kostenlose E-Mails pro Monat
- Für mehr E-Mails fallen Kosten an (siehe [Preise](https://www.emailjs.com/pricing))

### Sicherheit
- Die Public Key ist sicher und kann öffentlich geteilt werden
- E-Mail-Validierung erfolgt sowohl client- als auch serverseitig
- Spam-Schutz ist integriert

### Anpassungen
- Sie können das E-Mail-Template nach Ihren Wünschen anpassen
- Das Formular-Design kann über Tailwind CSS angepasst werden
- Benachrichtigungen können in der `script.js` angepasst werden

## Fehlerbehebung

### Häufige Probleme

**"EmailJS nicht geladen"**
- Überprüfen Sie, ob die EmailJS CDN korrekt geladen wird
- Prüfen Sie die Browser-Konsole auf Fehler

**"Service nicht gefunden"**
- Überprüfen Sie die Service ID in der Konfiguration
- Stellen Sie sicher, dass der Service aktiviert ist

**"Template nicht gefunden"**
- Überprüfen Sie die Template ID in der Konfiguration
- Stellen Sie sicher, dass das Template veröffentlicht ist

**E-Mails kommen nicht an**
- Überprüfen Sie den Spam-Ordner
- Testen Sie mit einer anderen E-Mail-Adresse
- Überprüfen Sie die E-Mail-Service-Konfiguration

## Support
Bei Problemen können Sie:
1. Die Browser-Konsole auf Fehler überprüfen
2. Die EmailJS-Dokumentation konsultieren
3. Den EmailJS-Support kontaktieren

## Nächste Schritte
Nach der erfolgreichen Einrichtung können Sie:
- Das E-Mail-Template weiter anpassen
- Zusätzliche Formularfelder hinzufügen
- Das Design nach Ihren Wünschen verändern
- Analytics und Tracking hinzufügen
