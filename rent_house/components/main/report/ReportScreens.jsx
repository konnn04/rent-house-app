import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../../contexts/ThemeContext";
import { sendReportService } from "../../../services/reportService";

const REPORT_TYPES = [
  { value: "scam", label: "Lừa đảo" },
  { value: "violation", label: "Vi phạm quy định" },
  { value: "offensive", label: "Phản cảm" },
  { value: "hate", label: "Gây thù ghét" },
  { value: "other", label: "Khác" },
];

export const ReportScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { reportedUserId, url_tag } = route.params;
  const [selectedType, setSelectedType] = useState("");
  const [description, setDescription] = useState(""); // New required field

  const handleSubmit = async () => {
    try {
      if (!selectedType || !description.trim()) {
        alert("Vui lòng chọn lý do và mô tả chi tiết.");
        return;
      }

      const reportData = {
        reported_user: reportedUserId,
        type: selectedType,
        reason: description,
      };

      const response = await sendReportService(reportData);

      if (response.success) {
        alert("Báo cáo đã được gửi thành công!");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(
        error.message || "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
    >
      {/* Header with close button */}
      <View style={[styles.header]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Báo cáo người dùng
        </Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
          Chọn lý do báo cáo:
        </Text>

        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              selectedType === type.value && styles.selectedType,
              {
                borderColor: colors.textSecondary,
                backgroundColor:
                  selectedType === type.value
                    ? colors.accentColor
                    : colors.backgroundSecondary,
              },
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text
              style={[
                styles.typeText,
                selectedType === type.value && styles.selectedTypeText,
                { color: colors.textPrimary },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Required description field */}
        <Text style={[styles.subtitle, { color: colors.textPrimary }]}>
          Mô tả chi tiết: 
        </Text>
        <Text style={styles.required}>*</Text>
        <TextInput
          style={styles.input}
          placeholder="Vui lòng mô tả chi tiết vấn đề..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textSecondary}
          color={colors.textPrimary}
        />
      </ScrollView>

      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          {
            backgroundColor:
              !selectedType || !description.trim()
                ? colors.textSecondary
                : colors.accentColor,
            opacity: !selectedType || !description.trim() ? 0.5 : 1,
          },
        ]}
        disabled={!selectedType || !description.trim()}
      >
        <View style={styles.submitButtonContent}>
          <Icon name="send" size={20} color="#fff" style={styles.submitIcon} />
          <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  required: {
    color: "red",
    fontWeight: "bold",
  },
  typeButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedType: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  typeText: {
    fontSize: 16,
  },
  selectedTypeText: {
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 16,
    padding: 15,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
