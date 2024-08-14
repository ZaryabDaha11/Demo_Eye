import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import requestCameraPermission from './src/permissions/CameraPermission';
import CameraView from './src/cameraView';

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);

  //to get permission for camera usage
  useEffect(() => {
    async function prepareCamera() {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return <Text>No access to camera</Text>;
        // Handle the permission denial appropriately, maybe update the UI or show a message
      } else {
        setHasPermission(true);
        // Perform any necessary setup or initialization when the camera permission is granted
        // detectionResult.loadModel(); // Load the TensorFlow Lite model for object detection
      }
    }

    prepareCamera();
  }, []);
  return (
    <View style={{flex: 1}}>
      {hasPermission ? (
        <>
          <CameraView />
        </>
      ) : (
        <Text>No access to camera</Text>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
