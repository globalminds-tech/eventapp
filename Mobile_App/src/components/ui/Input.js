import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../../styles/theme";

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  icon: Icon,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.req}>*</Text>}
        </Text>
      )}

      <View style={[styles.inputWrap, error && styles.inputError]}>
        {Icon && <Icon size={18} color={COLORS.subText} style={{ marginRight: 8 }} />}
        <TextInput
          style={[
            styles.input,
            multiline && { height: 80, textAlignVertical: "top" },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.subText}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 4,
  },
  req: {
    color: "#ef4444",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    fontWeight: "700",
    marginTop: 3,
  },
});
