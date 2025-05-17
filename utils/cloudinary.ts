import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as VideoThumbnails from "expo-video-thumbnails";

const CLOUD_NAME = "dihzlwmdt";
const UPLOAD_PRESET = "Pulscity";

export const pickMedia = async (
  mediaType: "image" | "video" | "all" = "all"
) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Permission to access media library is required!");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:
      mediaType === "image"
        ? ImagePicker.MediaTypeOptions.Images
        : mediaType === "video"
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    quality: 0.8,
    aspect: [4, 3],
  });

  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: asset.type || mediaType,
      fileName: asset.fileName || `file_${Date.now()}`,
      mimeType:
        asset.mimeType || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
    };
  }

  return null;
};

export const compressImage = async (uri: string) => {
  return await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
};

export const generateVideoThumbnail = async (uri: string) => {
  const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 1000,
    quality: 0.8,
  });
  return thumbnailUri;
};

export const uploadToCloudinary = async (
  uri: string,
  type: "image" | "video",
  onProgress?: (progress: number) => void
) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error("File does not exist");

    const fieldName = "file";
    const name = `upload_${Date.now()}.${type === "image" ? "jpg" : "mp4"}`;
    const fileType = type === "image" ? "image/jpeg" : "video/mp4";

    const response = await FileSystem.createUploadTask(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
      uri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName,
        parameters: {
          upload_preset: UPLOAD_PRESET,
          transformation: "w_500,h_500,c_fill,q_auto:good",
        },
      },
      (progressEvent) => {
        const progress =
          progressEvent.totalBytesSent / progressEvent.totalBytesExpectedToSend;
        onProgress?.(progress);
      }
    ).uploadAsync();

    if (!response) throw new Error("Upload failed");

    const result = JSON.parse(response.body);
    if (result.error) throw new Error(result.error.message);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
