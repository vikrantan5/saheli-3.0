import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllProducts } from '@/services/productService';
import { getCartItemCount } from '@/services/cartService';
import { auth } from '@/config/firebaseConfig';
import { getUserDetails } from '@/services/userService';
import ProductCard from '@/components/ProductCard';
import TopNavbar from '@/components/TopNavbar';
import { ShoppingCart, ShoppingBag, Shield } from 'lucide-react-native';

export default function StoreScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Alarms', value: 'alarm' },
    { label: 'Pepper Spray', value: 'pepper-spray' },
    { label: 'GPS Wearables', value: 'gps-wearable' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    fetchProducts();
    checkAdminStatus();
    fetchCartCount();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDetails = await getUserDetails(user.uid);
        setIsAdmin(userDetails?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const count = await getCartItemCount(user.uid);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCartCount()]);
    setRefreshing(false);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.value}
          style={[
            styles.categoryChip,
            selectedCategory === cat.value && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(cat.value)}
          data-testid={`filter-${cat.value}`}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === cat.value && styles.categoryChipTextActive,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => router.push({
        pathname: '/store/product-detail',
        params: { productId: item.id },
      })}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navbar with Cart Button */}
      <View style={{ backgroundColor: '#fff' }}>
        <TopNavbar title="Saheli Store" />
        
        {/* Action Buttons Row */}
        <View style={{ 
          flexDirection: 'row', 
          paddingHorizontal: 24, 
          paddingBottom: 12,
          paddingTop: 8,
          gap: 12,
        }}>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.iconButton, { flex: 1 }]}
              onPress={() => router.push('/(admin)/products')}
              data-testid="admin-panel-button"
            >
              <Shield color="#ec4899" size={20} />
              <Text style={styles.adminText}>Admin</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { flex: 1 }]}
            onPress={() => router.push('/store/orders')}
            data-testid="my-orders-button"
          >
            <ShoppingBag color="#8b5cf6" size={20} />
            <Text style={styles.actionButtonText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.cartButton, { position: 'relative' }]}
            onPress={() => router.push('/store/cart')}
            data-testid="cart-button"
          >
            <ShoppingCart color="#ec4899" size={24} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(admin)/add-product')}
              >
                <Text style={styles.addButtonText}>Add Products</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    alignItems: 'center',
  },
  adminText: {
    fontSize: 10,
    color: '#ec4899',
    marginTop: 2,
    fontWeight: '600',
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  categoryChipActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
