import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Users,
  Plus,
  MessageCircle,
  AlertTriangle,
  Heart,
  MapPin,
  Clock,
  Search,
  Shield,
  Eye,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import LoadingScreen from "@/components/LoadingScreen";
import ActionButton from "@/components/ActionButton";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const categories = [
    { id: "all", label: "All Posts", icon: Users },
    { id: "alert", label: "Safety Alerts", icon: AlertTriangle },
    { id: "support", label: "Support", icon: Heart },
    { id: "general", label: "General", icon: MessageCircle },
  ];

  useEffect(() => {
    loadCommunityPosts();
  }, [selectedCategory]);

  const loadCommunityPosts = async () => {
    try {
      const response = await fetch(`/api/community/posts?category=${selectedCategory}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        // Fallback to mock data
        setPosts([
          {
            id: 1,
            title: "Safe Walking Routes at Night",
            content: "I wanted to share some well-lit routes I use when walking home from work. The main street has good lighting and regular police patrols.",
            author: "Sarah J.",
            postType: "general",
            isAnonymous: false,
            location: "Downtown District",
            timestamp: "2 hours ago",
            likes: 12,
            comments: 3,
          },
          {
            id: 2,
            title: "Suspicious Activity Alert",
            content: "Noticed someone following women in the downtown area around 8 PM. Please be cautious and travel in groups if possible.",
            author: "Anonymous",
            postType: "alert",
            isAnonymous: true,
            location: "5th Street & Main",
            timestamp: "4 hours ago",
            likes: 8,
            comments: 5,
          },
          {
            id: 3,
            title: "Support Group Meeting",
            content: "Monthly women's safety support group meeting this Thursday at 7 PM. All are welcome to share experiences and tips.",
            author: "Maria G.",
            postType: "support",
            isAnonymous: false,
            location: "Community Center",
            timestamp: "1 day ago",
            likes: 15,
            comments: 7,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      // Use fallback mock data
      setPosts([
        {
          id: 1,
          title: "Safe Walking Routes at Night",
          content: "I wanted to share some well-lit routes I use when walking home from work. The main street has good lighting and regular police patrols.",
          author: "Sarah J.",
          postType: "general",
          isAnonymous: false,
          location: "Downtown District",
          timestamp: "2 hours ago",
          likes: 12,
          comments: 3,
        },
      ]);
    }
  };

  const handleCreatePost = () => {
    Alert.alert(
      "Create Post",
      "Choose post type",
      [
        { text: "Safety Alert", onPress: () => createPost("alert") },
        { text: "General Post", onPress: () => createPost("general") },
        { text: "Support Request", onPress: () => createPost("support") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const createPost = (type) => {
    Alert.alert(
      "Create Post",
      `Creating a ${type} post. In a real app, this would open a full post creation form.`,
      [{ text: "OK" }]
    );
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch('/api/community/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        // Update local state
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case "alert":
        return AlertTriangle;
      case "support":
        return Heart;
      default:
        return MessageCircle;
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case "alert":
        return theme.colors.warning;
      case "support":
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.postType === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 24,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Community Hub
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Connect, share & support each other
              </Text>
            </View>

            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.success,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleCreatePost}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <Search size={20} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: theme.colors.text,
              }}
              placeholder="Search posts..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      backgroundColor: isSelected ? theme.colors.text : theme.colors.elevated,
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? theme.colors.background : theme.colors.text}
                      strokeWidth={1.5}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: isSelected ? theme.colors.background : theme.colors.text,
                      }}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Posts List */}
        <View style={{ paddingHorizontal: 24 }}>
          {filteredPosts.map((post, index) => {
            const PostTypeIcon = getPostTypeIcon(post.postType);
            return (
              <View key={post.id}>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                  activeOpacity={0.8}
                >
                  {/* Post Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: getPostTypeColor(post.postType),
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <PostTypeIcon size={16} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: theme.colors.text,
                          marginBottom: 2,
                        }}
                      >
                        {post.title}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          by {post.author}
                        </Text>
                        <Clock size={12} color={theme.colors.textTertiary} strokeWidth={1.5} style={{ marginLeft: 8, marginRight: 4 }} />
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            color: theme.colors.textTertiary,
                          }}
                        >
                          {post.timestamp}
                        </Text>
                      </View>
                    </View>
                    {post.isAnonymous && (
                      <View
                        style={{
                          backgroundColor: theme.colors.warning,
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 10,
                            color: "#FFFFFF",
                          }}
                        >
                          Anonymous
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Post Content */}
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.text,
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                  >
                    {post.content}
                  </Text>

                  {/* Location */}
                  {post.location && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <MapPin size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {post.location}
                      </Text>
                    </View>
                  )}

                  {/* Post Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.divider,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() => handleLikePost(post.id)}
                    >
                      <Heart size={16} color={theme.colors.textSecondary} strokeWidth={1.5} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {post.likes}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <MessageCircle size={16} color={theme.colors.textSecondary} strokeWidth={1.5} />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {post.comments}
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={{
                        backgroundColor: theme.colors.buttonBackground,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 10,
                          color: theme.colors.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {post.postType}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}

          {filteredPosts.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 48,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.buttonBackground,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Users size={28} color={theme.colors.textSecondary} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No posts found
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Be the first to share something{"\n"}with the community
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}