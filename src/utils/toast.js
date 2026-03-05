import { Platform, ToastAndroid } from 'react-native';

let _showToastFn = null;

export function registerToast(fn) {
  _showToastFn = fn;
}

export function showToast(message, opts) {
  if (Platform.OS === 'android' && _showToastFn) {
    _showToastFn(message, opts);
  } else if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (_showToastFn) {
    _showToastFn(message, opts);
  }
}
