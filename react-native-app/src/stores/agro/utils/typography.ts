import { TextStyle } from 'react-native';

export const Typography: { [key: string]: TextStyle } = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
  },
  button: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  }
};

export default Typography;
