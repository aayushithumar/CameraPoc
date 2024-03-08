import React, {PureComponent} from "react"
import { Text, View, ViewStyle } from "react-native";
import { Camera, CameraDevice, CameraPosition, CameraRuntimeError } from "react-native-vision-camera";
interface IRNCamera<T> {
    cameraFacing?: CameraPosition
    style?: ViewStyle
    uri?: string
    setRef?: any;
    isCameraInitialized?: boolean;
    isRecording?: boolean;
    cameraPosition?: 'front' | 'back';
    permissionGranted?:boolean
}
interface IRNCameraWithRef extends IRNCamera<Camera> {
    // Forwarded ref
    forwardedRef?: any;
}
interface IRNCameraState {
    isCameraInitialized?: boolean;
    isRecording?: boolean;
    cameraPosition?: 'front' | 'back';
    permissionGranted?:boolean
}
class RNCamera extends PureComponent<IRNCameraWithRef, IRNCameraState> {
    constructor(props: IRNCameraWithRef) {
        super(props);
        this.state = {
            permissionGranted: false,
            isRecording: false,
            isCameraInitialized: false
        };
        
        this.availableDevices = Camera.getAvailableCameraDevices()
        this.camera = React.createRef<Camera>();
        this.device = this.availableDevices.find((d) => d.position === 'back') as CameraDevice;
        console.log('constructor')
    }
    // Destructure props
    // let { forwardedRef, ...rest } = props;
    private camera: React.RefObject<Camera>;

    // private hasMicrophonePermission = useMemo(() => Camera.getMicrophonePermissionStatus() === 'granted', [])
    // check if camera page is active
    // private isForeground = useIsForeground()
    private availableDevices : CameraDevice[];
    private device : CameraDevice
    
    componentDidMount(): void {
        console.log('did mount')
        this.setupCamera()
    }

    record() {
        console.log('record...')
    }

    onError = (error: CameraRuntimeError) => {
        console.error(error)
        return true;
    }

    onInitialized = () => {
        console.log('Camera initialized!')
        this.setState({ ...this.state, isCameraInitialized: true })
    }

    async setupCamera() {
        try {
            const hasCameraPermission = await Camera.getCameraPermissionStatus();
            if (hasCameraPermission === 'granted') {
                this.setState({ ...this.state, permissionGranted: true });
            } else {
                const requestPermissionResult = await Camera.requestCameraPermission();
                if (requestPermissionResult === 'granted') {
                    this.setState({ ...this.state, permissionGranted: true });
                } else {
                    console.error('Camera permission denied');
                    this.setState({ ...this.state, permissionGranted: false });
                }
            }
        } catch (error) {
            console.error('Failed to setup camera:', error);
            this.setState({ ...this.state, permissionGranted: false });
        }
    };

    toggleFacing = async () => {
        try {
            if (this.camera.current) {
                const currentCamera = this.camera.current.props.device.position
                const newCamera = currentCamera === 'front' ? 'back' : 'front';
                this.camera.current.props.device.position = newCamera;
            }
        } catch (error) {
            console.error('Failed to toggle camera:', error);
        }
    };

    recordVideo = async (camera: Camera): Promise<any> => {
        return await new Promise((resolve, reject) => {
            if (camera && !this.state.isRecording) {
                console.log("recording....")
                this.setState({ ...this.state, isRecording: true })
                camera.startRecording({
                    onRecordingFinished: (video) => {
                        resolve(video)
                        this.setState({ ...this.state, isRecording: false })
                    },
                    onRecordingError: (error) => {
                        console.log(error)
                        reject(error)
                        this.setState({ ...this.state, isRecording: false })
                    },
                })
                // this.setState({ ...this.state, isRecording: true });
                console.log("recording....2")
                // this.camera.current.startRecording({onRecordingFinished,onRecordingError}); // Specify recording options if needed
            } else {
                reject(this.state.isRecording ? "Camera is in recording mode" : "Camera not ready")
                // this.setState({ ...this.state, isRecording: false });
                console.log("recording....3")
            }
        });
    };

    stopRecording = async () => {
        try {
            console.log("recording.... stoping...")
            if (this.camera.current && this.state.isRecording) {
                this.setState({ ...this.state, isRecording: false })
                this.camera.current.stopRecording();
                // this.setState({ ...this.state, isRecording: false });
                console.log("recording.... stopped")
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };
    takePhoto = async () => {
        try {
            if (this.camera.current) {
                return await this.camera.current.takePhoto();
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
        return undefined;
    };
    RenderCamera = () => {
        return (
            <View style={{ flex: 1 }}>
            {
                (this.state.permissionGranted && this.device) ? <Camera
                    ref={this.props.forwardedRef || this.camera}
                    style={{ ...(this.props.style && this.props.style), flex: 1 }}
                    device={this.device}
                    isActive={true}
                    video={true}
                    photo={true}
                    onInitialized={this.onInitialized}
                    onError={this.onError}
                /> : <View>
                <Text>Error Loading Camera...</Text>
            </View>
            }
            {/* <RenderRecordButton /> */}
        </View>
        )
    }

    // const RenderRecordButton = () => {

    //     return <>
    //         <TouchableOpacity style={{
    //             width: 100, height: 50, position: 'absolute',
    //             bottom: 0,
    //             left: '50%', // Centers the view horizontally
    //             transform: [{ translateX: -50 }], // Adjusts for half of the width of the view
    //         }} onPress={async () => {
    //             if (!isRecording) {
    //                 let video = await recordVideo().catch((error) => onVideoError(error))
    //                 if (video) {
    //                     onVideo(video);
    //                 }
    //             } else {
    //                 await stopRecording()
    //             }


    //         }}>{isRecording ? <StopRecordButton /> : <RecordButton />}</TouchableOpacity>
    //     </>

    // }
    render() {
        return (
            <>
                {this.RenderCamera() }
            </>
        )
    }

};
export default RNCamera;