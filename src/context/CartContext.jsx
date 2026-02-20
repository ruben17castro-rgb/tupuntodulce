import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from './ProductContextCore';
import { CartContext } from './CartContextCore';

/**
 * Cart Provider Component
 */
export const CartProvider = ({ children }) => {
    const { products } = useProducts();

    // Initial state from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem('tpd_cart');
            if (stored && stored !== 'null') {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => ({
                        id: item?.id,
                        quantity: Number(item?.quantity) || 1
                    })).filter(item => item.id !== undefined && item.id !== null);
                }
            }
        } catch (e) {
            console.error("Error loading cart from storage:", e);
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Save to localStorage safely
    useEffect(() => {
        try {
            const thinCart = (Array.isArray(cart) ? cart : [])
                .filter(item => item && item.id)
                .map(item => ({ id: item.id, quantity: Number(item.quantity) || 1 }));
            localStorage.setItem('tpd_cart', JSON.stringify(thinCart));
        } catch (e) {
            console.error("Error saving cart to storage:", e);
        }
    }, [cart]);

    // Derived State: Resolved Cart (full objects)
    const resolvedCart = useMemo(() => {
        const safeCart = Array.isArray(cart) ? cart : [];
        const safeProducts = Array.isArray(products) ? products : [];

        return safeCart.map(cartItem => {
            if (!cartItem?.id) return null;
            // Use loose equality (==) in case IDs are mixed string/number
            const productInfo = safeProducts.find(p => p && String(p.id) === String(cartItem.id));
            if (!productInfo) return null;
            return { ...productInfo, quantity: Number(cartItem.quantity) || 1 };
        }).filter(item => item !== null);
    }, [cart, products]);

    // Derived State: Totals
    const cartTotal = useMemo(() => {
        return resolvedCart.reduce((total, item) =>
            total + ((Number(item?.price) || 0) * (Number(item?.quantity) || 0)), 0);
    }, [resolvedCart]);

    const cartCount = useMemo(() => {
        return (Array.isArray(cart) ? cart : []).reduce((count, item) =>
            count + (Number(item?.quantity) || 0), 0);
    }, [cart]);

    // Memoize actions to prevent unnecessary re-renders of children
    const addToCart = useCallback((product, quantity = 1) => {
        if (!product || !product.id) return;
        setCart(prev => {
            const current = Array.isArray(prev) ? prev : [];
            const existing = current.find(item => String(item.id) === String(product.id));
            if (existing) {
                return current.map(item =>
                    String(item.id) === String(product.id)
                        ? { ...item, quantity: (Number(item.quantity) || 0) + quantity }
                        : item
                );
            }
            return [...current, { id: product.id, quantity }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart(prev => (Array.isArray(prev) ? prev : []).filter(item => String(item.id) !== String(id)));
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        const newQty = Math.max(1, Number(quantity) || 1);
        setCart(prev => (Array.isArray(prev) ? prev : []).map(item =>
            String(item.id) === String(id) ? { ...item, quantity: newQty } : item
        ));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);
    const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
    const openCheckout = useCallback(() => {
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    }, []);
    const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

    const contextValue = useMemo(() => ({
        cart: resolvedCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        cartTotal,
        cartCount
    }), [resolvedCart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, toggleCart, isCheckoutOpen, openCheckout, closeCheckout, cartTotal, cartCount]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
