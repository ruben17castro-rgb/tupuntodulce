import { createContext, useContext } from 'react';

// Create context in a separate file to ensure it's a singleton during HMR
export const CartContext = createContext(null);

/**
 * Custom hook to use the cart context
 */
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
