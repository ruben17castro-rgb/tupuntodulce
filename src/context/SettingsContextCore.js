import { createContext, useContext } from 'react';

export const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings debe ser usado dentro de un SettingsProvider');
    }
    return context;
};
