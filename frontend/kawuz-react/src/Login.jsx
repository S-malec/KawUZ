import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./css/Login.css";
import { useTranslation } from "react-i18next";
const BASE = "http://localhost:8080/api";

export default function Login({ onSwitchToRegister, onLoginSuccess, onCancel, isModal = false, onClose }) {
    const [formData, setFormData] = useState({ username: '', password: '' });

    const [captchaToken, setCaptchaToken] = useState(null);

    const [msg, setMsg] = useState('');
    const { t } = useTranslation();
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
                setMsg(t("login.success"));
                setTimeout(() => onLoginSuccess({
                    username: data.username,
                    isAdmin: data.isAdmin
                }), 500);
            } else {
                setMsg("⚠️ " + (data.message || t("login.error")));
                setCaptchaToken(null);
            }
        } catch (err) {
            setMsg("Błąd połączenia z serwerem.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    const handleOverlayClick = (e) => {
        if (isModal && e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

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

// Komponent wewnętrzny dla czystości kodu, zawierający sam formularz (BEZ ZMIAN)   
function LoginFormContent({ handleSubmit, setFormData, formData, onCancel, msg, onSwitchToRegister, setCaptchaToken }) {
    const { t } = useTranslation();
    return (
        <form onSubmit={handleSubmit} className="auth-card">
            <h3>{t("login.title")}</h3>
            <input
                placeholder={t("login.username")}
                onChange={e => setFormData({...formData, username: e.target.value})}
                value={formData.username}
                required
            />
            <br/>
            <input
                type="password"
                placeholder={t("login.password")}
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

            <button type="submit">{t("login.submit")}</button>
            <button type="button" onClick={onCancel}>{t("common.cancel")}</button>
            <p>{msg}</p>
            <button onClick={onSwitchToRegister} type="button" className="switch-register">
                {t("login.noAccount")}
            </button>
        </form>
    );
}