// app/(tabs)/profile/components/SearchComponent.tsx
import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles/profileStyles";

interface SearchComponentProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  placeholder = "Search by date, name...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch}>
          <MaterialIcons
            name="close"
            size={20}
            color="#9CA3AF"
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      )}{" "}
      <MaterialIcons
        name="search"
        size={20}
        color="#9CA3AF"
        style={styles.searchIcon}
      />
    </View>
  );
};

export default SearchComponent;
