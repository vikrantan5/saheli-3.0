import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '@/config/firebaseConfig';
import { getCart, clearCart } from '@/services/cartService';
import { getProductById, updateStock } from '@/services/productService';
import { createOrder, updateOrderPaymentStatus } from '@/services/orderService';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  formatAmount,
  openRazorpayCheckout,
} from '@/services/razorpayService';

export default function CheckoutScreen() {
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchCartAndProducts();
  }, []);

  const fetchCartAndProducts = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please login');
        router.replace('/(auth)/login');
        return;
      }

      const cartData = await getCart(user.uid);
      if (cartData.items.length === 0) {
        Alert.alert('Error', 'Your cart is empty', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      setCart(cartData);

      // Fetch product details
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

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      const product = products[item.productId];
      if (product) {
        return total + product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const validateAddress = () => {
    if (!shippingAddress.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!shippingAddress.phone.trim() || shippingAddress.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!shippingAddress.address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!shippingAddress.pincode.trim() || shippingAddress.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    // Check stock availability
    for (const item of cart.items) {
      const product = products[item.productId];
      if (!product || product.stock < item.quantity) {
        Alert.alert('Error', `Insufficient stock for ${product?.title || 'product'}`);
        return;
      }
    }

    try {
      setProcessing(true);
      const user = auth.currentUser;
      const totalAmount = calculateTotal();

      // Step 1: Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(totalAmount);

      // Step 2: Create order in Firestore
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        title: products[item.productId].title,
        price: products[item.productId].price,
        quantity: item.quantity,
        imageUrl: products[item.productId].imageUrl,
      }));

      const orderId = await createOrder({
        userId: user.uid,
        items: orderItems,
        totalAmount,
        razorpayOrderId: razorpayOrder.id,
        shippingAddress,
      });

      // Step 3: Handle payment based on platform
      if (Platform.OS === 'web') {
        // Web-based checkout
        try {
          const paymentResponse = await openRazorpayCheckout({
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            prefill: {
              name: shippingAddress.fullName,
              contact: shippingAddress.phone,
            },
          });

          await handlePaymentSuccess(paymentResponse, orderId);
        } catch (error) {
          if (error.message === 'Payment cancelled by user') {
            Alert.alert('Cancelled', 'Payment was cancelled');
          } else {
            throw error;
          }
        }
      } else {
        // For Expo Go mobile - Use a simplified approach with WebBrowser
        // In production, you'd create a custom payment page
        Alert.alert(
          'Payment Ready',
          `Order created successfully!\n\nTotal: ${formatAmount(totalAmount)}\n\nIn Expo Go, native payments aren't supported. Please use one of these options:\n\n1. Test on web (npx expo start --web)\n2. Create a custom development build\n\nFor now, we'll mark this as a test order.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setProcessing(false);
              }
            },
            {
              text: 'Simulate Payment (Test)',
              onPress: async () => {
                try {
                  // Simulate payment for testing in Expo Go
                  const mockPaymentId = `pay_test_${Date.now()}`;
                  await updateOrderPaymentStatus(orderId, mockPaymentId, 'paid');
                  
                  // Update stock
                  for (const item of cart.items) {
                    await updateStock(item.productId, -item.quantity);
                  }
                  
                  // Clear cart
                  await clearCart(user.uid);
                  
                  Alert.alert('Test Order Complete', 'Order has been placed (test mode)', [
                    {
                      text: 'View Orders',
                      onPress: () => router.replace('/store/orders'),
                    },
                  ]);
                } catch (error) {
                  console.error('Error completing test order:', error);
                  Alert.alert('Error', 'Failed to complete order');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      if (Platform.OS === 'web') {
        setProcessing(false);
      }
    }
  };

  const handlePaymentSuccess = async (paymentResponse, orderId) => {
    const user = auth.currentUser;
    
    // Verify payment (mock)
    const isVerified = await verifyPaymentSignature(
      paymentResponse.razorpay_order_id,
      paymentResponse.razorpay_payment_id,
      paymentResponse.razorpay_signature
    );

    if (isVerified) {
      // Update order status
      await updateOrderPaymentStatus(
        orderId,
        paymentResponse.razorpay_payment_id,
        'paid'
      );

      // Update product stock
      for (const item of cart.items) {
        await updateStock(item.productId, -item.quantity);
      }

      // Clear cart
      await clearCart(user.uid);

      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'View Orders',
          onPress: () => router.replace('/store/orders'),
        },
      ]);
    } else {
      Alert.alert('Error', 'Payment verification failed');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
       <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  const total = calculateTotal();

  return (
   <>
  <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={shippingAddress.fullName}
        onChangeText={(text) => setShippingAddress({ ...shippingAddress, fullName: text })}
        data-testid="fullname-input"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={shippingAddress.phone}
        onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
        keyboardType="phone-pad"
        maxLength={10}
        data-testid="phone-input"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Address *"
        value={shippingAddress.address}
        onChangeText={(text) => setShippingAddress({ ...shippingAddress, address: text })}
        multiline
        numberOfLines={3}
        data-testid="address-input"
      />

      <TextInput
        style={styles.input}
        placeholder="City *"
        value={shippingAddress.city}
        onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
        data-testid="city-input"
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode *"
        value={shippingAddress.pincode}
        onChangeText={(text) => setShippingAddress({ ...shippingAddress, pincode: text })}
        keyboardType="numeric"
        maxLength={6}
        data-testid="pincode-input"
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {cart.items.map((item) => {
        const product = products[item.productId];
        if (!product) return null;

        return (
          <View key={item.productId} style={styles.orderItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {product.title} × {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              {formatAmount(product.price * item.quantity)}
            </Text>
          </View>
        );
      })}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount} data-testid="checkout-total">
          {formatAmount(total)}
        </Text>
      </View>
    </View>

    <TouchableOpacity
      style={[styles.placeOrderButton, processing && styles.placeOrderButtonDisabled]}
      onPress={handlePlaceOrder}
      disabled={processing}
      data-testid="place-order-button"
    >
      {processing ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.placeOrderButtonText}>Place Order & Pay</Text>
      )}
    </TouchableOpacity>
  </ScrollView>
</>

   
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  placeOrderButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
