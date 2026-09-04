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
                        productId: item?.productId || item?.id,
                        quantity: Number(item?.quantity) || 1,
                        isUnitSale: Boolean(item?.isUnitSale),
                        unitName: item?.unitName || null,
                        unitPrice: item?.unitPrice !== undefined ? Number(item?.unitPrice) : null,
                        customName: item?.customName || null
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
                .map(item => ({
                    id: item.id,
                    productId: item.productId || item.id,
                    quantity: Number(item.quantity) || 1,
                    isUnitSale: Boolean(item.isUnitSale),
                    unitName: item.unitName || null,
                    unitPrice: item.unitPrice !== undefined ? item.unitPrice : null,
                    customName: item.customName || null
                }));
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
            const targetProductId = cartItem.productId || cartItem.id;
            const productInfo = safeProducts.find(p => p && String(p.id) === String(targetProductId));
            if (!productInfo && !cartItem.customName) return null;

            const baseName = productInfo?.name || 'Producto';
            const displayName = cartItem.customName || (cartItem.isUnitSale && cartItem.unitName
                ? `${baseName} (${cartItem.quantity} ${cartItem.unitName}${cartItem.quantity > 1 ? 's' : ''})`
                : baseName);

            const finalPrice = cartItem.isUnitSale && cartItem.unitPrice !== null && cartItem.unitPrice !== undefined
                ? Number(cartItem.unitPrice)
                : Number(productInfo?.price || 0);

            return {
                ...productInfo,
                ...cartItem,
                name: displayName,
                price: finalPrice,
                quantity: Number(cartItem.quantity) || 1
            };
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
    const addToCart = useCallback((product, quantity = 1, options = null) => {
        if (!product || !product.id) return;

        // Prevent adding if out of stock
        const stock = product.stock !== undefined ? Number(product.stock) : Infinity;
        if (stock <= 0) return;

        const isUnitSale = Boolean(options?.isUnitSale);
        const unitName = options?.unitName || product.unitName || 'unidad';
        const unitPrice = options?.unitPrice !== undefined ? Number(options.unitPrice) : Number(product.unitPrice || product.price);

        const cartItemId = isUnitSale
            ? `${product.id}_unit_${unitName}`
            : String(product.id);

        const customName = isUnitSale
            ? `${product.name} (por ${unitName})`
            : product.name;

        setCart(prev => {
            const current = Array.isArray(prev) ? prev : [];
            const existing = current.find(item => String(item.id) === String(cartItemId));
            if (existing) {
                const currentQty = Number(existing.quantity) || 0;
                const maxAllowed = isUnitSale ? 9999 : stock;
                const newQty = Math.min(currentQty + quantity, maxAllowed);

                return current.map(item =>
                    String(item.id) === String(cartItemId)
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            return [...current, {
                id: cartItemId,
                productId: product.id,
                quantity: Math.min(quantity, isUnitSale ? 9999 : stock),
                isUnitSale,
                unitName: isUnitSale ? unitName : null,
                unitPrice: isUnitSale ? unitPrice : null,
                customName
            }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((id) => {
        setCart(prev => (Array.isArray(prev) ? prev : []).filter(item => String(item.id) !== String(id)));
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        const productInfo = resolvedCart.find(p => String(p.id) === String(id));
        const stock = productInfo?.stock !== undefined ? Number(productInfo.stock) : Infinity;

        const newQty = Math.min(Math.max(1, Number(quantity) || 1), stock);

        setCart(prev => (Array.isArray(prev) ? prev : []).map(item =>
            String(item.id) === String(id) ? { ...item, quantity: newQty } : item
        ));
    }, [resolvedCart]);

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
