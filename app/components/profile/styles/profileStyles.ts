// app/(tabs)/profile/styles/profileStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 4,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  profileName: {
    fontSize: 24,
    fontFamily: "Poppins_500Medium",
    color: "#111827",
    marginBottom: 10,
  },
  editButton: {
    paddingHorizontal: 24,
    // paddingVertical: 2,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: 10,
    marginTop: -10,
  },
  editButtonText: {
    color: "#374151",
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },

  // Stats Tabs

  statNumber: {
    fontSize: 20,
    fontFamily: "Poppins_400Regular",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_200Regular",
    color: "#6B7280",
  },
  statLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // activeStatLabel: {
  //   color: "#3B82F6",
  //   fontFamily: "Poppins_500Medium",
  //   marginLeft: 4,
  // },

  // Content Tabs

  activeContentTabText: {
    color: "#111",
    marginLeft: 4,
    fontFamily: "Poppins_600SemiBold",
  },

  // Stats Tabs
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    // paddingHorizontal: 16,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
    marginTop: -20,
    marginBottom: 10
  },
  // activeStatTab: {
  //   borderBottomWidth: 2,
  //   borderBottomColor: "#3B82F6",
  // },
  statContent: {
    alignItems: "center",
  },

  // Content Tabs

  activeContentTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 100,
  },
  activeHistoryContentTab: {
    backgroundColor: "#3B82F6",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 100,
  },
  historyContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  contentTabText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#111",
    marginLeft: 4,
  },

  tabContent: {
    paddingBottom: 60,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },

  tabsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 6,
    marginEnd: 16,
  },
  contentTabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    display: "flex",
    justifyContent: "space-evenly",
    borderColor: "#E5E7EB",
    alignItems: "center",
    width: "95%",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingVertical: 4,
  },
  contentTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginHorizontal: 2,
  },
  iconOnlyTab: {
    paddingHorizontal: 8,
  },

  activeHistoryTabText: {
    color: "black",
    fontWeight: "600",
  },
  historyTabsContainer: {
    flexDirection: "row",
    position: "relative", // For absolute positioning of sub-tabs
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 100,
    width: "70%",
    marginTop: 8,
  },
  historySubTabsContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 8,
    marginEnd: 16,
    justifyContent: "space-around",
    paddingHorizontal: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
    flexWrap: "wrap",
  },
  historySubTab: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    flex: 1,
    alignItems: "center",
    maxWidth: "50%",
  },
  activeHistorySubTab: {
    backgroundColor: "white",
    borderBottomColor: "#3B82F6",
    borderBottomWidth: 3,
  },
  historySubTabText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#111111",
  },
  activeHistorySubTabText: {
    color: "#111",
    fontFamily: "Poppins_600SemiBold",
  },
  // Reviews
  reviewsContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  reviewCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  eventDetails: {
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#111827",
    marginBottom: 0,
  },

  organizer: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
    // marginLeft: 16,
    fontFamily: "Poppins_400Regular",
  },
  savedEventsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: "100%",
  },
  // Empty State
  // emptyState: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   paddingVertical: 48,
  //   paddingHorizontal: 16,
  //   backgroundColor: "#F3F4F6",
  //   borderRadius: 12,
  //   marginHorizontal: 16,
  //   marginTop: 16,
  //   borderWidth: 1,
  //   borderColor: "#E5E7EB",
  //   height: 200,
  // },
  // emptyText: {
  //   fontSize: 16,
  //   fontFamily: "Poppins_500Medium",
  //   color: "#9CA3AF",
  //   textAlign: "center",
  //   marginTop: 16,
  // },
  // emptySubText: {
  //   fontSize: 14,
  //   fontFamily: "Poppins_400Regular",
  //   color: "#9CA3AF",
  //   marginTop: 8,
  // },
  // History Sub Tabs
  subTabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  historyTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeHistoryTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTabText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111111",
  },

  historyContent: {
    padding: 16,
    paddingBottom: 60,
    width: "100%",
  },
  // Tickets
  ticketCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ticketName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#374151",
  },
  ticketType: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  section: {
    marginBottom: 12,
  },
  locationLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  linkText: {
    color: "#3B82F6",
    fontSize: 12,
    marginLeft: 4,
  },
  eventPostButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins_500Medium",
  },

  // Events
  eventCard: {
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  attendeesContainer: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendees: {
    fontSize: 12,
    color: "#374151",
  },
  totalContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#111827",
    paddingVertical: 4,
    marginLeft: 8,
  },
  searchIcon: {
    marginLeft: 4,
  },
  clearIcon: {
    marginLeft: 8,
  },
  // noResultsText: {
  //   textAlign: "center",
  //   marginTop: 20,
  //   fontFamily: "Poppins_400Regular",
  //   color: "#9CA3AF",
  // },
});

export default {};
