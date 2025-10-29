import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/config/firebaseConfig';
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/services/cartService';
import { getProductById } from '@/services/productService';
import CartItem from '@/components/CartItem';
import { formatAmount } from '@/services/razorpayService';

export default function CartScreen() {
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please login');
        router.replace('/(auth)/login');
        return;
      }

      const cartData = await getCart(user.uid);
      setCart(cartData);

      // Fetch product details for each cart item
      const productPromises = cartData.items.map((item) =>
        getProductById(item.productId)
      );
      const productsData = await Promise.all(productPromises);

      const productsMap = {};
      productsData.forEach((product) => {
        if (product) {
          productsMap[product.id] = product;
        }
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (newQuantity <= 0) {
        await handleRemoveItem(productId);
        return;
      }

      // Check stock
      const product = products[productId];
      if (product && newQuantity > product.stock) {
        Alert.alert('Error', 'Insufficient stock');
        return;
      }

      await updateCartItem(user.uid, productId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      Alert.alert('Error', 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await removeFromCart(user.uid, productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;

            await clearCart(user.uid);
            await fetchCart();
          } catch (error) {
            console.error('Error clearing cart:', error);
            Alert.alert('Error', 'Failed to clear cart');
          }
        },
      },
    ]);
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      const product = products[item.productId];
      if (product) {
        return total + product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const renderCartItem = ({ item }) => (
    <CartItem
      item={item}
      product={products[item.productId]}
      onUpdateQuantity={handleUpdateQuantity}
      onRemove={handleRemoveItem}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/store')}
          data-testid="continue-shopping-button"
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = calculateTotal();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{cart.items.length} Items</Text>
        <TouchableOpacity onPress={handleClearCart} data-testid="clear-cart-button">
          <Text style={styles.clearText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount} data-testid="cart-total">
            {formatAmount(total)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/store/checkout')}
          data-testid="proceed-to-checkout-button"
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  checkoutButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
