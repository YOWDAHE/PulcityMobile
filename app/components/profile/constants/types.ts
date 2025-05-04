import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ImageSourcePropType } from "react-native";

export type TabName = "following" | "events" | "posts" | "followers";
export type ContentTabName = "reviews" | "saved" | "history";
export type HistoryTabName = "events" | "tickets";

export interface ProfileData {
  name: string;
  // image: ImageSourcePropType;
  stats: {
    // followers: number;
    following: number;
    // events: number;
    // posts: number;
  };
}
export type TicketType = "Standard" | "VIP" | "VVIP" | "Premium" | "Student";

export interface Ticket {
  id: string;
  name: string[];
  date: string;
  time: string;
  type: TicketType;
  idNumber: string;
  place: string;
  price: string;
  avatars: ImageSourcePropType[];
  eventName?: string;
  eventId: string;
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  action: string;
  review: string;
  attendees: string;
  time?: string;
  type?: string;
  idNumber?: string;
  place?: string;
  price?: string;
  venue?: string;
  image?: ImageSourcePropType;
  avatars?: ImageSourcePropType[];
  count?: number;
  rating?: number;
  reviewedBy?: string;
}

export interface SavedEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  action: string;
  review: string;
  rating: number;
  attendees: string;
  image: ImageSourcePropType;
  description: string;
  hashtags: string;
  likesCount: string;
  commentsCount: string;
  coverImage: ImageSourcePropType;
  organiserImage: ImageSourcePropType;
  eventType: string;
  eventId: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
  eventPrice: string;
}

export interface StatTabProps {
  label: string;
  value?: string;
  icon: typeof FontAwesome | typeof MaterialIcons | typeof Ionicons;
  iconName:
    | keyof typeof FontAwesome.glyphMap
    | keyof typeof MaterialIcons.glyphMap
    | keyof typeof Ionicons.glyphMap;
  tabName: TabName;
  isActive: boolean;
  onPress: () => void;
}

export interface HistoryTabProps {
  label: string;
  tabName: HistoryTabName;
  isActive: boolean;
  onPress: () => void;
}

export interface ContentTabProps {
  label: string;
  activeContentTab: string;
  tabName: ContentTabName;
  iconName: keyof typeof MaterialIcons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

export default {};
