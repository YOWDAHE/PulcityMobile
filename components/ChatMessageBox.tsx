import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import {
  IMessage as GiftedIMessage,
  Message,
  MessageProps,
} from "react-native-gifted-chat";

interface IMessage extends GiftedIMessage {
  error?: boolean;
}
import { isSameDay, isSameUser } from "react-native-gifted-chat/lib/utils";
import { Colors } from "@/constants/Colors";

type ChatMessageBoxProps = {
  setReplyOnSwipeOpen: (message: IMessage) => void;
  updateRowRef: (ref: any) => void;
  currentTheme: {
    text: string;
    gray: string;
    primary: string;
    background: string;
  };
} & MessageProps<IMessage>;

const ChatMessageBox = ({
  setReplyOnSwipeOpen,
  updateRowRef,
  currentTheme,
  ...props
}: ChatMessageBoxProps) => {
  const isNextMyMessage =
    props.currentMessage &&
    props.nextMessage &&
    isSameUser(props.currentMessage, props.nextMessage) &&
    isSameDay(props.currentMessage, props.nextMessage);

  const renderRightAction = (
    progressAnimatedValue: Animated.AnimatedInterpolation<any>
  ) => {
    const size = progressAnimatedValue.interpolate({
      inputRange: [0, 1, 100],
      outputRange: [0, 1, 1],
    });
    const trans = progressAnimatedValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 12, 20],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: size }, { translateX: trans }] },
          isNextMyMessage
            ? styles.defaultBottomOffset
            : styles.bottomOffsetNext,
          props.position === "right" && styles.leftOffsetValue,
        ]}
      >
        <View style={styles.replyImageWrapper}>
          <MaterialCommunityIcons
            name="reply-circle"
            size={26}
            color={currentTheme.gray}
          />
        </View>
      </Animated.View>
    );
  };

  const onSwipeOpenAction = () => {
    if (props.currentMessage) {
      setReplyOnSwipeOpen({ ...props.currentMessage });
    }
  };

  const renderMessageStatus = () => {
    if (props.currentMessage?.pending) {
      return (
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: currentTheme.background },
          ]}
        >
          {props.currentMessage.progress ? (
            <>
              <Text style={[styles.statusText, { color: currentTheme.text }]}>
                Uploading{" "}
                {Math.round((props.currentMessage.progress || 0) * 100)}%
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(props.currentMessage.progress || 0) * 100}%`,
                      backgroundColor: currentTheme.primary,
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={[styles.statusText, { color: currentTheme.text }]}>
              Sending...
            </Text>
          )}
        </View>
      );
    }

    if (props.currentMessage?.error) {
      return (
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color="#ff5252"
          />
          <Text style={[styles.statusText, { color: "#ff5252" }]}>
            Failed to send
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Swipeable
        ref={updateRowRef}
        friction={2}
        rightThreshold={40}
        renderLeftActions={renderRightAction}
        onSwipeableWillOpen={onSwipeOpenAction}
      >
        <View>
          <Message {...props} />
          {renderMessageStatus()}
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  replyImageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultBottomOffset: {
    marginBottom: 2,
  },
  bottomOffsetNext: {
    marginBottom: 10,
  },
  leftOffsetValue: {
    marginLeft: 16,
  },
  statusContainer: {
    padding: 8,
    paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 4,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
});

export default ChatMessageBox;
