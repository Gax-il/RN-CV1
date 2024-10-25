import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  value: boolean;
  setValue: (value: boolean) => void;
  text: string;
}

const ToggleView = ({ value, setValue, text }: Props) => {
  return (
    <TouchableOpacity
      style={{
        height: 60,
        flex: 1,
        backgroundColor: value ? "#00f0b3" : "#e3e3e3",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={() => {
        setValue(!value);
      }}
    >
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};

export default ToggleView;
