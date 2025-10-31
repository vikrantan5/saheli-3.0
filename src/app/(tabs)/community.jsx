import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
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
  ThumbsUp,
  Shield,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import LoadingScreen from "@/components/LoadingScreen";
import TopNavbar from "@/components/TopNavbar";
import PostCreationModal from "@/components/PostCreationModal";
import { 
  subscribeToPosts, 
  upvotePost, 
  hasUserUpvoted, 
  isCriticalPost 
} from "@/services/communityService";
import { formatDistanceToNow } from 'date-fns';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const categories = [
    { id: "all", label: "All Posts", icon: Users },
    { id: "safety-alerts", label: "Safety Alerts", icon: AlertTriangle },
    { id: "support", label: "Support", icon: Heart },
    { id: "general", label: "General", icon: MessageCircle },
  ];

  // Subscribe to real-time posts updates
  useEffect(() => {
    setIsLoading(true);
    console.log('Setting up real-time posts subscription for category:', selectedCategory);
    
    const unsubscribe = subscribeToPosts(selectedCategory, (newPosts) => {
      console.log('Received posts update:', newPosts.length);
      setPosts(newPosts);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount or category change
    return () => {
      console.log('Unsubscribing from posts');
      unsubscribe();
    };
  }, [selectedCategory]);

  const handleCreatePost = () => {
    setShowPostModal(true);
  };

  const handleUpvote = async (postId) => {
    try {
      await upvotePost(postId);
      // No need to update local state - real-time listener will handle it
    } catch (error) {
      console.error('Failed to upvote post:', error);
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case "safety-alerts":
        return AlertTriangle;
      case "support":
        return Heart;
      default:
        return MessageCircle;
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case "safety-alerts":
        return "#EF4444";
      case "support":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Just now';
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBar} />

      {/* Top Navbar */}
      <TopNavbar title="Community" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
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
              data-testid="create-post-button"
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
                    data-testid={`category-${category.id}`}
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

        {/* Loading State */}
        {isLoading && (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center',
            paddingVertical: 48,
          }}>
            <ActivityIndicator size="large" color={theme.colors.success} />
            <Text style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginTop: 12,
            }}>
              Loading posts...
            </Text>
          </View>
        )}

        {/* Posts List */}
        {!isLoading && (
          <View style={{ paddingHorizontal: 24 }}>
            {filteredPosts.map((post) => {
              const PostTypeIcon = getPostTypeIcon(post.category);
              const isCritical = isCriticalPost(post.upvotes);
              const userHasUpvoted = hasUserUpvoted(post.upvoters);

              return (
                <View key={post.id}>
                  <View
                    style={{
                      backgroundColor: isCritical ? '#FEF2F2' : theme.colors.elevated,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: isCritical ? 2 : 0,
                      borderColor: isCritical ? '#EF4444' : 'transparent',
                    }}
                    data-testid={`post-${post.id}`}
                  >
                    {/* Critical Alert Badge */}
                    {isCritical && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#EF4444',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        marginBottom: 12,
                        alignSelf: 'flex-start',
                      }}>
                        <Shield size={14} color="#FFFFFF" strokeWidth={2} />
                        <Text style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 12,
                          color: '#FFFFFF',
                          marginLeft: 6,
                        }}>
                          CRITICAL ALERT - Needs Attention
                        </Text>
                      </View>
                    )}

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
                          backgroundColor: getPostTypeColor(post.category),
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <PostTypeIcon size={16} color="#FFFFFF" strokeWidth={2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text
                            style={{
                              fontFamily: "Inter_600SemiBold",
                              fontSize: 16,
                              color: theme.colors.text,
                            }}
                          >
                            {post.username}
                          </Text>
                          {post.isAnonymous && (
                            <View
                              style={{
                                backgroundColor: '#F59E0B',
                                borderRadius: 8,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                marginLeft: 8,
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
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                          <Clock size={12} color={theme.colors.textTertiary} strokeWidth={1.5} />
                          <Text
                            style={{
                              fontFamily: "Inter_400Regular",
                              fontSize: 12,
                              color: theme.colors.textTertiary,
                              marginLeft: 4,
                            }}
                          >
                            {formatTimestamp(post.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: getPostTypeColor(post.category) + '20',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 10,
                            color: getPostTypeColor(post.category),
                            textTransform: "capitalize",
                          }}
                        >
                          {post.category.replace('-', ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Post Content */}
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: theme.colors.text,
                        lineHeight: 20,
                        marginBottom: post.imageUrl ? 12 : 0,
                      }}
                    >
                      {post.content}
                    </Text>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={{
                          width: '100%',
                          height: 200,
                          borderRadius: 12,
                          marginBottom: 12,
                        }}
                        resizeMode="cover"
                      />
                    )}

                    {/* Post Actions */}
                    <View
                      style={{
                        flexDirection: "row",
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
                          backgroundColor: userHasUpvoted ? '#10B981' : theme.colors.buttonBackground,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                        onPress={() => handleUpvote(post.id)}
                        data-testid={`upvote-${post.id}`}
                      >
                        <ThumbsUp 
                          size={16} 
                          color={userHasUpvoted ? '#FFFFFF' : theme.colors.text} 
                          strokeWidth={1.5}
                          fill={userHasUpvoted ? '#FFFFFF' : 'transparent'}
                        />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 14,
                            color: userHasUpvoted ? '#FFFFFF' : theme.colors.text,
                            marginLeft: 6,
                          }}
                        >
                          {post.upvotes} {post.upvotes === 1 ? 'Upvote' : 'Upvotes'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredPosts.length === 0 && !isLoading && (
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
        )}
      </ScrollView>

      {/* Post Creation Modal */}
      <PostCreationModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostCreated={() => {
          // Posts will update automatically via real-time listener
          console.log('Post created successfully');
        }}
      />
    </View>
  );
}
