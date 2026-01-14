import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export const Input = (props: TextInputProps) => {
  return (
    <TextInput style={styles.input} placeholderTextColor="#999" autoCapitalize="none" {...props} />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
});
