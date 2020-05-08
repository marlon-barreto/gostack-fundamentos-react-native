import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const data = await AsyncStorage.getItem('@GoMarketplace:basket');

      if (data) {
        const basketProducts: Product[] = JSON.parse(data);

        setProducts(basketProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(proItem => proItem.id === product.id);

      const quantity = productExists ? productExists.quantity + 1 : 1;

      const newProductValue = { ...product, quantity };

      if (productExists) {
        setProducts(
          products.map(proItem =>
            proItem.id === product.id ? newProductValue : proItem,
          ),
        );
      } else {
        setProducts([...products, newProductValue]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:basket',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(proItem =>
          proItem.id === id
            ? { ...proItem, quantity: proItem.quantity + 1 }
            : proItem,
        ),
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:basket',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      setProducts(
        products
          .map(proItem =>
            proItem.id === id
              ? { ...proItem, quantity: proItem.quantity - 1 }
              : proItem,
          )
          .filter(proItem => proItem.quantity > 0),
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:basket',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
