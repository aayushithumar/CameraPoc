import React, { useState, useEffect, useRef, Ref, createRef } from 'react';
import { Camera, CameraCaptureError, VideoFile } from 'react-native-vision-camera';

export interface ICameraUpdate {
  video?: VideoFile,
  error?: CameraCaptureError,
  isPermissionAvailable?: boolean,
}
function useCamera() {
  const cameraRef = useRef<Camera | null>(null);// LeagaruseRef<Camera>(null);
  const [state, setState] =  useState<ICameraUpdate>({
    isPermissionAvailable: false,
    video: undefined,
    error: undefined
  })
  const isRecord = useRef(false)
  console.log("RnHook Update")
  
  const isCameraReady = () => {
    return state.isPermissionAvailable;
  }
  const isRecording = () => {
    return isRecord.current;
  }
  const setIsRecording = () => {
    console.log('fake - just to avoid conflict')
  }
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const hasCameraPermission = await Camera.getCameraPermissionStatus();
        if (hasCameraPermission === 'granted') {
          setState({ ...state, isPermissionAvailable: true });
        } else {
          const requestPermissionResult = await Camera.requestCameraPermission();
          if (requestPermissionResult === 'granted') {
            setState({ ...state, isPermissionAvailable: false });
          } else {
            console.error('Camera permission denied');
            setState({ ...state, isPermissionAvailable: false });
          }
        }
      } catch (error) {
        console.error('Failed to setup camera:', error);
        setState({ ...state, isPermissionAvailable: false });
      }
    };
    setupCamera();

    return () => {
      // Clean up any resources if necessary
    };
  }, []);

  const toggleFacing = async () => {
    try {
      if (cameraRef.current) {
        const currentCamera = cameraRef.current.props.device.position
        const newCamera = currentCamera === 'front' ? 'back' : 'front';
        cameraRef.current.props.device.position = newCamera;
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  const recordVideo = async (): Promise<any> => {
    return await new Promise((resolve, reject) => {
      if (cameraRef.current && !isRecord.current) {
        console.log("recording....")
        isRecord.current = true;
        cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            resolve(video)
            isRecord.current = false;
          },
          onRecordingError: (error) => {
            console.log(error)
            reject(error)
            isRecord.current = false;
          },
        })
        // setState({ ...state, isRecording: true });
        console.log("recording....2")
        // cameraRef.current.startRecording({onRecordingFinished,onRecordingError}); // Specify recording options if needed
      } else {
        reject(isRecord.current ? "Camera is in recording mode" : "Camera not ready")
        // setState({ ...state, isRecording: false });
        console.log("recording....3")
      }
    });
  };

  const stopRecording = async () => {
    try {
      console.log("recording.... stoping...")
      if (cameraRef.current &&  isRecord) {
        isRecord.current =false
        cameraRef.current.stopRecording();
        // setState({ ...state, isRecording: false });
        console.log("recording.... stopped")
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };
  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        return await cameraRef.current.takePhoto();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
    return undefined;
  };

  const setCameraRef = (ref: Camera | null) => {
    if (ref !== cameraRef.current) {
      console.log("Ref Set ")
      cameraRef.current = ref
    }
  }
  return { isCameraReady, isRecord, cameraRef, setCameraRef, setIsRecording, toggleFacing, recordVideo, stopRecording };
};

export default useCamera;