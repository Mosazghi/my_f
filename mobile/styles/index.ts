import { colors, fontSize } from "@/constants/tokens";
import { StyleSheet } from "react-native";
export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.text,
  },
});

export const utilsStyles = StyleSheet.create({
  centeredRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  slider: {
    height: 7,
    borderRadius: 16,
  },
  itemSeparator: {
    borderColor: colors.textMuted,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
});
