import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha"; //
import "./css/Login.css";
import { useTranslation } from "react-i18next";

/** * @constant BASE
 * @brief Adres bazowy dla endpointów uwierzytelniania i rejestracji.
 */

const BASE = "http://localhost:8080/api";

/**
 * @component Register
 * @brief Komponent obsługujący formularz rejestracji nowego użytkownika.
 * * Funkcjonalności:
 * - Zbieranie danych (login, email, hasło).
 * - Integracja z Google reCAPTCHA w celu weryfikacji botów.
 * - Wyświetlanie komunikatu o sukcesie/błędzie.
 * - Obsługa renderowania w modalu z zamykaniem przez overlay.
 * * @param {Object} props
 * @param {Function} props.onSwitchToLogin Funkcja przełączająca na widok logowania.
 * @param {Function} props.onCancel Funkcja anulująca proces rejestracji.
 * @param {boolean} props.isModal Flaga określająca tryb wyświetlania (pełny ekran vs modal).
 * @param {Function} props.onClose Funkcja zamykająca modal.
 */
export default function Register({ onSwitchToLogin, onCancel, isModal = false, onClose }) {
    /** @brief Stan przechowujący dane wejściowe formularza. */
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });

    /** @brief Token weryfikacyjny od Google reCAPTCHA. */
    const [captchaToken, setCaptchaToken] = useState(null);

    /** @brief Wiadomość zwrotna dla użytkownika (sukces/błąd). */
    const [msg, setMsg] = useState('');


    /** @brief Funkcja służąca do tłumaczenia kluczy tekstowych na aktualny język. */
    const { t } = useTranslation();

    /**
     * @brief Obsługuje proces przesyłania danych rejestracyjnych.
     * * Weryfikuje obecność tokena Captcha, tworzy obiekt żądania
     * i wysyła go do endpointu /auth/register.
     * * @param {Event} e Obiekt zdarzenia formularza.
     */
    

    const handleRegister = async (e) => {
        e.preventDefault();

        // 3. Sprawdzamy, czy użytkownik kliknął w Captchę
        if (!captchaToken) {
            setMsg("Potwierdź, że nie jesteś robotem!");
            return;
        }

        try {
            // 4. Tworzymy obiekt do wysłania: dane użytkownika + token captchy
            const requestBody = {
                ...formData,
                recaptchaToken: captchaToken // To pole musi odebrać Java
            };

            const res = await fetch(`${BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody) // Wysyłamy nowy obiekt
            });

            // Obsługa odpowiedzi (czasem backend zwraca tekst, czasem JSON)
            let data;
            try {
                data = await res.json();
            } catch (err) {
                data = { message: "Błąd serwera (brak JSON)" };
            }

            if (res.ok) {
                setMsg(t("register.success"));
                setTimeout(() => onSwitchToLogin(), 1500);
            } else {
                setMsg("⚠️ " + (data.message || t("register.error")));
                // Opcjonalnie: Resetujemy captchę przy błędzie (wymuszenie ponownego kliknięcia)
                setCaptchaToken(null);
            }
        } catch (err) {
            console.error(err);
            setMsg(t("register.connectionError"));
        }
    };

    /**
     * @brief Obsługuje kliknięcie w tło modalu.
     * @param {Event} e Obiekt zdarzenia kliknięcia.
     */
    const handleOverlayClick = (e) => {
        if (isModal && e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    /** @brief Treść formularza wyekstrahowana do spójnego renderowania w różnych trybach. */
    const formContent = (
        <form onSubmit={handleRegister} className="auth-card">
            <h3>{t("register.title")}</h3>
            <input
                placeholder={t("register.username")}
                required
                onChange={e => setFormData({...formData, username: e.target.value})}
                value={formData.username}
            />
            <input
                type="email"
                placeholder="Email"
                required
                onChange={e => setFormData({...formData, email: e.target.value})}
                value={formData.email}
            />
            <input
                type="password"
                placeholder={t("register.password")}
                required
                onChange={e => setFormData({...formData, password: e.target.value})}
                value={formData.password}
            />

            <div className="captcha-container" style={{ margin: "15px 0", display: "flex", justifyContent: "center" }}>
                <ReCAPTCHA
                    sitekey="6LeAQ1UsAAAAAGShPV_wIXF5Zg2V61XgtHl3qslz"
                    onChange={(token) => setCaptchaToken(token)}
                />
            </div>

            <button type="submit">{t("register.submit")}</button>
            <button type="button" onClick={isModal ? onClose : onCancel}>{t("common.cancel")}</button>

            <p>{msg}</p>

            <button type="button" onClick={onSwitchToLogin} className="switch-login">
                {t("register.haveAccount")}
            </button>
        </form>
    );

    if (isModal) {
        return (
            <div className="modal-overlay" onClick={handleOverlayClick}>
                {formContent}
            </div>
        );
    }

    return formContent;
}