import { createContext, useContext } from 'react';

// Product Context singleton for HMR stability
export const ProductContext = createContext(null);

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
