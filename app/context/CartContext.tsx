"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   CART ITEM
========================================================= */

export type CartItem = {
  id: string;
  name: string;
  collection: string;
  price: number;
  quantity: number;

  /*
   * Used by Food by Litre.
   * Example: 1L, 2L, 2.5L, 3L, 4L, 5L
   */
  selectedSize?: string;

  /*
   * Optional image for future use.
   */
  imageUrl?: string | null;
};

/* =========================================================
   CART CONTEXT TYPE
========================================================= */

type CartContextType = {
  items: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (
    id: string,
    selectedSize?: string
  ) => void;

  updateQuantity: (
    id: string,
    quantity: number,
    selectedSize?: string
  ) => void;

  clearCart: () => void;

  totalItems: number;

  subtotal: number;

  isCartOpen: boolean;

  openCart: () => void;

  closeCart: () => void;

  toggleCart: () => void;
};

/* =========================================================
   CREATE CONTEXT
========================================================= */

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE KEY
========================================================= */

const CART_STORAGE_KEY =
  "rhennie-tasty-shack-cart";

/* =========================================================
   CART PROVIDER
========================================================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  /* =======================================================
     LOAD CART FROM LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart =
        window.localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  /* =======================================================
     SAVE CART TO LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Unable to save cart:",
        error
      );
    }
  }, [items, hydrated]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(item: CartItem) {
    setItems((currentItems) => {
      const existingItemIndex =
        currentItems.findIndex(
          (existingItem) =>
            existingItem.id === item.id &&
            existingItem.selectedSize ===
              item.selectedSize
        );

      /*
       * Same meal + same size
       * = increase quantity
       */

      if (existingItemIndex !== -1) {
        return currentItems.map(
          (existingItem, index) =>
            index === existingItemIndex
              ? {
                  ...existingItem,
                  quantity:
                    existingItem.quantity +
                    item.quantity,
                }
              : existingItem
        );
      }

      /*
       * New item
       */

      return [
        ...currentItems,
        {
          ...item,
          quantity:
            item.quantity > 0
              ? item.quantity
              : 1,
        },
      ];
    });

    /*
     * Automatically open cart
     * after adding an item.
     */

    setIsCartOpen(true);
  }

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  function removeFromCart(
    id: string,
    selectedSize?: string
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize ===
              selectedSize
          )
      )
    );
  }

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  function updateQuantity(
    id: string,
    quantity: number,
    selectedSize?: string
  ) {
    /*
     * If quantity reaches zero,
     * remove the item.
     */

    if (quantity <= 0) {
      removeFromCart(
        id,
        selectedSize
      );

      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id &&
        item.selectedSize ===
          selectedSize
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  /* =======================================================
     CLEAR CART
  ======================================================= */

  function clearCart() {
    setItems([]);
  }

  /* =======================================================
     OPEN CART
  ======================================================= */

  function openCart() {
    setIsCartOpen(true);
  }

  /* =======================================================
     CLOSE CART
  ======================================================= */

  function closeCart() {
    setIsCartOpen(false);
  }

  /* =======================================================
     TOGGLE CART
  ======================================================= */

  function toggleCart() {
    setIsCartOpen((current) => !current);
  }

  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [items]);

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );
  }, [items]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      isCartOpen,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   USE CART HOOK
========================================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider."
    );
  }

  return context;
}