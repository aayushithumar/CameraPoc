import React, { ReactNode, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Text, View, ViewStyle } from "react-native";
import { Camera, CameraDevice, CameraPosition, CameraRuntimeError, PhotoFile, VideoFile, useCameraDevice } from "react-native-vision-camera";
import { usePreferredCameraDevice } from "./hooks/usePreferredCameraDevice";
import { useIsForeground } from "./hooks/useIsForeground";

interface IRNCamera {
    cameraFacing?: CameraPosition
    style?: ViewStyle
    uri?: string
    setRef?: Function;
    recordVideo?: (video:any)=>void;
    stopRecording?: (error:any)=>void;
}
// // Define the props interface with forwardRef
// interface IRNCameraWithRef<T> extends IRNCamera<T> {
//     // Forwarded ref
//     forwardedRef?: any;
// }
const RNCamera = (props: IRNCamera) => {

    const camera = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const hasMicrophonePermission = useMemo(() => Camera.getMicrophonePermissionStatus() === 'granted', [])

    // check if camera page is active
    const isForeground = useIsForeground()
    const isActive = isForeground

    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front')
    const [preferredDevice] = usePreferredCameraDevice()
    const [isRecording, setIsRecording] = useState(false)

    let device = useCameraDevice(cameraPosition)
    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    } else {
        const availableDevices = Camera.getAvailableCameraDevices()
        device = availableDevices.find((d)=> d.position === 'back');
    }

    async function record(){
            console.log('record...')
    }
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
        return true;
    }, [])
    const onInitialized = useCallback(() => {
        console.log('Camera initialized!')
        setIsCameraInitialized(true)
    }, [])

    //   const onMediaCaptured = useCallback(
    //     (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
    //       console.log(`Media captured! ${JSON.stringify(media)}`)

    //     },
    //     [navigation],
    //   )

    const [state, setState] = useState({
        permissionGranted: false
    })

    useEffect(() => {
        const setupCamera = async () => {
            try {
                const hasCameraPermission = await Camera.getCameraPermissionStatus();
                if (hasCameraPermission === 'granted') {
                    setState({ ...state, permissionGranted: true });
                } else {
                    const requestPermissionResult = await Camera.requestCameraPermission();
                    if (requestPermissionResult === 'granted') {
                        setState({ ...state, permissionGranted: true });
                    } else {
                        console.error('Camera permission denied');
                        setState({ ...state, permissionGranted: false });
                    }
                }
            } catch (error) {
                console.error('Failed to setup camera:', error);
                setState({ ...state, permissionGranted: false });
            }
        };
        setupCamera();

        return () => {
            // Clean up any resources if necessary
        };
    }, []);


    const toggleFacing = async () => {
        try {
            if (camera.current) {
                const currentCamera = camera.current.props.device.position
                const newCamera = currentCamera === 'front' ? 'back' : 'front';
                camera.current.props.device.position = newCamera;
            }
        } catch (error) {
            console.error('Failed to toggle camera:', error);
        }
    };

    const recordVideo = async (): Promise<any> => {
        return await new Promise((resolve, reject) => {
            if (camera.current && !isRecording) {
                console.log("recording....")
                setIsRecording(true)
                camera.current.startRecording({
                    onRecordingFinished: (video) => {
                        resolve(video)
                        setIsRecording(false)
                    },
                    onRecordingError: (error) => {
                        console.log(error)
                        reject(error)
                        setIsRecording(false)
                    },
                })
                // setState({ ...state, isRecording: true });
                console.log("recording....2")
                // camera.current.startRecording({onRecordingFinished,onRecordingError}); // Specify recording options if needed
            } else {
                reject(isRecording ? "Camera is in recording mode" : "Camera not ready")
                // setState({ ...state, isRecording: false });
                console.log("recording....3")
            }
        });
    };

    const stopRecording = async () => {
        try {
            console.log("recording.... stoping...")
            if (camera.current && isRecording) {
                setIsRecording(false)
                camera.current.stopRecording();
                // setState({ ...state, isRecording: false });
                console.log("recording.... stopped")
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };
    const takePhoto = async () => {
        try {
            if (camera.current) {
                return await camera.current.takePhoto();
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
        return undefined;
    };

    const RenderCamera = () => {
        return <View style={{flex:1}}>
            {
                (state.permissionGranted && device) ? <Camera
                    ref={camera}
                    style={{...props.style && props.style, flex:1}}
                    device={device}
                    isActive={true}
                    video={true}
                    photo={true}
                    onInitialized={onInitialized}
                    onError={onError}
                /> : <RenderAwaiting />
            }
        </View>
    }
    const RenderAwaiting = () => {
        return <View>
            <Text>Error Loading Camera...</Text>
        </View>
    }

    return (
        <>
            <RenderCamera />
        </>
    )
};
export default RNCamera;