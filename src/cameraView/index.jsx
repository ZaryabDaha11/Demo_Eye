import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useResizePlugin} from 'vision-camera-resize-plugin';
import {useTensorflowModel} from 'react-native-fast-tflite';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';
import { useRunOnJS} from 'react-native-worklets-core';
import labels from '../models/labelmap';

const CameraView = () => {
  const device = useCameraDevice('back');
  const [boxes, setBoxes] = useState([])

  const getDetections = useRunOnJS((detections) => {
    setBoxes(detections)
  }, [])

  const objectDetection = useTensorflowModel(
    require('../models/detect.tflite'),
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;

  const {resize} = useResizePlugin();

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      try {
        if (model == null) return [];

        const {width: originalWidth, height: originalHeight} = frame; //640 width - 480 height

        // Resize frame
        const resized = resize(frame, {
          scale: {
            width: 300,
            height: 300,
          },
          pixelFormat: 'rgb',
          dataType: 'uint8',
        });

        const outputs = model.runSync([resized]);

        if (!outputs || outputs.length < 3) {
          console.warn('Insufficient outputs from model');
          return;
        }

        const boxes = outputs[0]; // Bounding box coordinates // rawOutput
        const classes = outputs[1]; // Class indices //label
        const scores = outputs[2]; // Confidence scores //confidence

        const detectedBoxes = [];

        for (let i = 0; i < boxes.length / 4; i++) {
          const [yMin, xMin, yMax, xMax] = [
            boxes[i * 4],
            boxes[i * 4 + 1],
            boxes[i * 4 + 2],
            boxes[i * 4 + 3],
          ];
          const confidence = Math.max(0, Math.min(scores[i], 1));

          if (confidence > 0.7) {
            const labelIndex = Math.round(classes[i]);
            
            const scaledBox = [
              xMin * originalWidth,
              yMin * originalHeight,
              xMax * originalWidth,
              yMax * originalHeight,
            ];

            detectedBoxes.push({
              box: scaledBox,
              label: labels[labelIndex] || `Unknown (${labelIndex})`,
              confidence,
            });
          }
        }

        getDetections(detectedBoxes)
      } catch (error) {
        console.error(`Frame processor error: ${error.message}`);
      }
    },
    [model, resize],
  );

  return (
    <View style={{flex: 1}}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <Svg style={StyleSheet.absoluteFill}>
        {boxes.map((det, index) => (
          <React.Fragment key={index} >
            <Rect
              x={det.box[0]}
              y={det.box[1]}
              width={det.box[3] - det.box[1]}
              height={det.box[2] - det.box[0]}
              stroke="green"
              strokeWidth="2"
              fill="none"
            />
            <SvgText
              x={det.box[0]}
              y={det.box[1] - 5}
              fill="green"
              fontSize="12"
              fontWeight="bold">
              {det.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

export default CameraView;

