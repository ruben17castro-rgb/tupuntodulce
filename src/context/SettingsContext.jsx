import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeToSettings, saveSettingsFirebase } from '../services/firebaseService';
import { SettingsContext } from './SettingsContextCore';

const DEFAULT_SETTINGS = {
    whatsappNumber: '56912345678',
    bankDetails: {
        bank: 'Banco Estado',
        type: 'Cuenta RUT',
        number: '',
        rut: '',
        name: 'Tu Punto Dulce',
        email: ''
    }
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToSettings((data) => {
            if (data) {
                // Mezclamos con defaults para asegurar que no falten campos
                setSettings({
                    whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
                    bankDetails: { ...DEFAULT_SETTINGS.bankDetails, ...(data.bankDetails || {}) }
                });
            }
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const updateWhatsAppNumber = useCallback(async (number) => {
        try {
            await saveSettingsFirebase({ whatsappNumber: number });
        } catch (err) {
            console.error("Error updating WhatsApp number:", err);
            throw err;
        }
    }, []);

    const updateBankDetails = useCallback(async (details) => {
        try {
            await saveSettingsFirebase({ bankDetails: details });
        } catch (err) {
            console.error("Error updating bank details:", err);
            throw err;
        }
    }, []);

    const contextValue = useMemo(() => ({
        ...settings,
        loading,
        updateWhatsAppNumber,
        updateBankDetails
    }), [settings, loading, updateWhatsAppNumber, updateBankDetails]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};
