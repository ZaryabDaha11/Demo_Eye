import { Platform } from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

  async function requestCameraPermission() {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      return result === RESULTS.GRANTED;
    } else {
      const result = await check(PERMISSIONS.IOS.CAMERA);
      if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);
        return requestResult === RESULTS.GRANTED;
      }
      return result === RESULTS.GRANTED;
    }

  }

export default requestCameraPermission;
