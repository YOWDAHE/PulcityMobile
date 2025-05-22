import { router } from "expo-router";

/**
 * Navigate to the explore page with a hashtag search
 * @param hashtagName - The name of the hashtag without the # symbol
 */
export const navigateToHashtagSearch = (hashtagName: string): void => {
  const formattedHashtag = hashtagName.trim().replace(/^#/, "");
  if (!formattedHashtag) return;
  
  router.push({
    pathname: "/(tabs)/explore",
    params: { 
      hashtag: formattedHashtag,
    }
  });
}; 