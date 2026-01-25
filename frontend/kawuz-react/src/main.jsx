/**
 * @file index.js / main.jsx
 * @brief Główny punkt wejścia aplikacji React.
 * * Ten plik inicjalizuje renderowanie aplikacji wewnątrz elementu DOM o id 'root'.
 * Konfiguruje również podstawowe kontenery systemowe, takie jak StrictMode
 * oraz BrowserRouter dla obsługi ścieżek URL.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './css/index.css'
import App from './App.jsx'
import './i18n';

/**
 * @brief Inicjalizacja i renderowanie głównego drzewa komponentów.
 * * - **createRoot**: Nowy sposób inicjalizacji aplikacji w React 18,
 * optymalizujący proces renderowania.
 * - **StrictMode**: Narzędzie deweloperskie do wykrywania potencjalnych
 * problemów w aplikacji (np. niebezpiecznych metod cyklu życia).
 * - **BrowserRouter**: Komponent wyższego rzędu (HOC) z biblioteki react-router-dom,
 * który umożliwia korzystanie z nawigacji bez przeładowywania strony (SPA).
 */
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)