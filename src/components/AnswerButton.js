import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ANSWER_COLORS = ['#E056FD', '#56D2FB', '#FEA55F', '#26DE81'];

export default function AnswerButton({ answer, index, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: ANSWER_COLORS[index] },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{answer}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});