import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import OrganiserInfo from "./OrganizerInfo";
import { Ionicons } from "@expo/vector-icons";

interface EventCardProps {
  coverImage: ImageSourcePropType;
  organiserName: string;
  organiserImage: ImageSourcePropType;
  date: string;
  title: string;
  description: string;
  likesCount: string;
  commentsCount: string;
  hashtags: string;
  showDots?: boolean;
}

const { width, height } = Dimensions.get("window");

const EventCard = ({
  coverImage,
  organiserName,
  organiserImage,
  date,
  title,
  description,
  likesCount,
  commentsCount,
  hashtags,
  showDots = true,
}: EventCardProps) => {
  return (
    <View style={styles.container}>
      {/* <View style={styles.imageContainer}>
				<Image source={coverImage} style={styles.coverImage} resizeMode="cover" />
			</View> */}

      {/* <OrganiserInfo
				name={organiserName}
				profileImage={organiserImage}
				date={date}
				likesCount={likesCount}
				commentsCount={commentsCount}
				coverPhoto={coverImage}
			/> */}

      <ImageBackground
        source={coverImage}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <View style={styles.insideImage}>
          <View style={styles.headerContainer}>
            <View style={styles.profileContainer}>
              <Image source={organiserImage} style={styles.profileImage} />
              <Text style={styles.nameText}>{organiserName}</Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
              <Ionicons name="notifications-outline" size={20} color="white" />
            </View>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={15} color="white" />
                <Text style={styles.statText}>{likesCount}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="bookmark-outline" size={15} color="white" />
                <Text style={styles.statText}>{commentsCount}</Text>
              </View>
            </View>

            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity style={styles.ticketButton}>
          <Text style={styles.ticketButtonText}>Get Your Tickets here</Text>
          <Ionicons name="chevron-forward" />
        </TouchableOpacity>

        <Text style={styles.hashtags}>{hashtags}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: 192,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#374151",
    marginBottom: 12,
  },
  ticketButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  ticketButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  ticketIcon: {
    width: 20,
    height: 20,
  },
  hashtags: {
    color: "#60A5FA",
    marginBottom: 8,
  },

  imageBackground: {
    flex: 1,
    width: "100%",
    height: 500,
    resizeMode: "cover",
    borderRadius: 10,
    overflow: "hidden",
  },
  insideImage: {
    padding: 20,
    height: "100%",
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  nameText: {
    fontWeight: "500",
    fontSize: 16,
    color: "#ffffff",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#3b82f6",
    // borderColor: "#3b82f6",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followButton: {
    marginRight: 8,
  },
  followButtonText: {
    color: "#ffffff",
  },
  icon: {
    width: 20,
    height: 20,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
    color: "#ffffff",
  },
  dateText: {
    fontSize: 14,
    color: "#ffffff",
  },
});

export default EventCard;
