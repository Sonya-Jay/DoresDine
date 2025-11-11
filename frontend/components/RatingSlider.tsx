import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RatingSliderProps {
  value: number;
  onValueChange: (v: number) => void;
}

const RatingSlider: React.FC<RatingSliderProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How was it?</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={0.1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor="#4CAF50"
          maximumTrackTintColor="#F44336"
          thumbTintColor="#333"
        />
      </View>
      <Text style={styles.value}>{value.toFixed(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sliderContainer: {
    width: 260,
    height: 36,
    backgroundColor: "#f0f0f0",
    borderRadius: 18,
    justifyContent: "center",
    marginBottom: 8,
  },
  slider: {
    width: 260,
    height: 36,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default RatingSlider;
