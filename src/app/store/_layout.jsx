import { Stack } from 'expo-router';

export default function StoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ec4899',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="product-detail"
        options={{
          title: 'Product Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          title: 'Shopping Cart',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'My Orders',
          headerShown: true,
        }}
      />
    </Stack>
  );
}