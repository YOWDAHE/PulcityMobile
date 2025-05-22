// app/(tabs)/profile/components/SearchComponent.tsx
import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Keyboard,
  Platform,
  Text
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  externalValue?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  placeholder = "Search by date, name...",
  externalValue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Effect to sync with external value if provided
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== searchQuery) {
      setSearchQuery(externalValue);
    }
  }, [externalValue]);

  // Send search terms to parent as user types
  const handleSearchChange = (text: string) => {
    console.log("SearchComponent: text changed to:", text);
    setSearchQuery(text);
    
    // Directly call onSearch with minimal delay to ensure it reaches parent
    onSearch(text);
  };

  const handleFocus = () => {
    console.log("SearchComponent: focused");
    setIsFocused(true);
    
    // Start animations when focus is gained
    Animated.parallel([
      Animated.timing(animatedWidth, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    console.log("SearchComponent: blurred");
    
    setTimeout(() => {
      if (inputRef.current && !inputRef.current.isFocused()) {
        setIsFocused(false);
        
        if (searchQuery.length === 0) {
          Animated.parallel([
            Animated.timing(animatedWidth, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(animatedOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      }
    }, 100);
  };

  const clearSearch = () => {
    console.log("SearchComponent: clearing search");
    setSearchQuery("");
    // Explicitly call onSearch with empty string
    onSearch("");
    
    // Ensure we retain focus after clearing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const handleSubmit = () => {
    console.log("SearchComponent: submitting query:", searchQuery);
    // Explicitly call onSearch when user presses enter/return
    onSearch(searchQuery);
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const animatedStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    }),
    opacity: animatedOpacity,
  };

  // Testing if component props are working
  useEffect(() => {
    console.log("SearchComponent mounted with onSearch prop:", !!onSearch);
    return () => console.log("SearchComponent unmounted");
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1}
        style={[
          styles.searchContainer, 
          isFocused && styles.searchContainerFocused
        ]}
        onPress={focusInput}
      >
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? "#3B82F6" : "#9CA3AF"}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={clearSearch}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {/* Add a debug text to show current query */}
      {__DEV__ && searchQuery.length > 0 && (
        <Text style={styles.debugText}>
          Current search: "{searchQuery}"
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchContainerFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 2,
    marginLeft: 8,
    fontWeight: "400",
  },
  searchIcon: {
    marginRight: 4,
  },
  clearButton: {
    padding: 4,
  },
  suggestionContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 4,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxHeight: 200,
  },
  debugText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  }
});

export default SearchComponent;
