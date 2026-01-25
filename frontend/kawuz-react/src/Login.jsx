import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./css/Login.css";

/**
 * @constant BASE
 * @brief Adres bazowy dla endpointów uwierzytelniania.
 */
const BASE = "http://localhost:8080/api";

/**
 * @component Login
 * @brief Komponent zarządzający procesem logowania użytkownika.
 * * Obsługuje:
 * - Przechowywanie poświadczeń (login, hasło).
 * - Integrację z ReCAPTCHA v2.
 * - Wyświetlanie jako samodzielna strona lub modal (overlay).
 * - Komunikację z backendem przez endpoint /auth/login.
 * * @param {Object} props
 * @param {Function} props.onSwitchToRegister Przełącza widok na rejestrację.
 * @param {Function} props.onLoginSuccess Callback po pomyślnym logowaniu.
 * @param {Function} props.onCancel Funkcja wywoływana przy rezygnacji.
 * @param {boolean} props.isModal Czy komponent ma być renderowany wewnątrz modalu.
 * @param {Function} props.onClose Zamyka modal.
 */
export default function Login({ onSwitchToRegister, onLoginSuccess, onCancel, isModal = false, onClose }) {
    /** @brief Dane formularza logowania. */
    const [formData, setFormData] = useState({ username: '', password: '' });

    /** @brief Token otrzymany po pomyślnym rozwiązaniu testu reCAPTCHA. */
    const [captchaToken, setCaptchaToken] = useState(null);

    /** @brief Komunikaty błędów lub statusu dla użytkownika. */
    const [msg, setMsg] = useState('');

    /**
     * @brief Wykonuje żądanie logowania do serwera.
     * Wymaga obecności tokena reCAPTCHA. Po sukcesie przekazuje dane użytkownika
     * (username, role) do wyższego komponentu.
     */
    const handleLogin = async () => {
        if (!captchaToken) {
            setMsg("Potwierdź, że nie jesteś robotem!");
            return;
        }

        try {
            const requestBody = {
                ...formData,
                recaptchaToken: captchaToken
            };

            const res = await fetch(`${BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("✅ Zalogowano!");
                setTimeout(() => onLoginSuccess({
                    username: data.username,
                    isAdmin: data.isAdmin
                }), 500);
            } else {
                setMsg("⚠️ " + (data.message || "Błąd logowania."));
                setCaptchaToken(null);
            }
        } catch (err) {
            setMsg("Błąd połączenia z serwerem.");
        }
    };

    /** @brief Obsługuje wysłanie formularza (Enter lub przycisk). */
    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    /** @brief Zamyka modal po kliknięciu w tło (overlay). */
    const handleOverlayClick = (e) => {
        if (isModal && e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    /** @brief Zawartość formularza wyekstrahowana do spójnego renderowania. */
    const formContent = (
        <LoginFormContent
            handleSubmit={handleSubmit}
            setFormData={setFormData}
            formData={formData}
            onCancel={isModal ? onClose : onCancel}
            msg={msg}
            onSwitchToRegister={onSwitchToRegister}
            setCaptchaToken={setCaptchaToken}
        />
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

/**
 * @component LoginFormContent
 * @brief Prezentacyjny komponent formularza logowania.
 * Wyodrębniony w celu uniknięcia duplikacji kodu przy renderowaniu modalnym/zwykłym.
 */
function LoginFormContent({ handleSubmit, setFormData, formData, onCancel, msg, onSwitchToRegister, setCaptchaToken }) {
    return (
        <form onSubmit={handleSubmit} className="auth-card">
            <h3>Logowanie</h3>
            <input
                placeholder="Login"
                onChange={e => setFormData({...formData, username: e.target.value})}
                value={formData.username}
                required
            />
            <br/>
            <input
                type="password"
                placeholder="Hasło"
                onChange={e => setFormData({...formData, password: e.target.value})}
                value={formData.password}
                required
            />
            <br/>

            <div className="captcha-container" style={{ margin: "15px 0", display: "flex", justifyContent: "center" }}>
                <ReCAPTCHA
                    sitekey="6LeAQ1UsAAAAAGShPV_wIXF5Zg2V61XgtHl3qslz"
                    onChange={(token) => setCaptchaToken(token)}
                />
            </div>

            <button type="submit">Zaloguj się</button>
            <button type="button" onClick={onCancel}>Anuluj</button>
            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" className="switch-register">
                Nie mam konta
            </button>
        </form>
    );
}