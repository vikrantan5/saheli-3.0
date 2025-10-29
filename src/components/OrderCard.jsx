import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatAmount } from '../services/razorpayService';

export default function OrderCard({ order, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'shipped':
        return '#3b82f6';
      case 'packed':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      data-testid={`order-card-${order.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor(order.paymentStatus) }]}
          />
          <Text style={styles.statusText}>
            Payment: {order.paymentStatus.toUpperCase()}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getDeliveryStatusColor(order.deliveryStatus) },
            ]}
          />
          <Text style={styles.statusText}>
            Delivery: {order.deliveryStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsLabel}>
          {order.items.length} item{order.items.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.amount}>{formatAmount(order.totalAmount)}</Text>
      </View>

      {order.items.slice(0, 2).map((item, index) => (
        <Text key={index} style={styles.itemName} numberOfLines={1}>
          • {item.title} (x{item.quantity})
        </Text>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  itemName: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
});