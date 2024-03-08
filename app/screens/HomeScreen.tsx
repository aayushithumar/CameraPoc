import React, { useRef, useState } from "react"
import { Button, View } from "react-native"
import { Camera } from "react-native-vision-camera"
import useCamera from "../Components/RNHooks"
import RNCamera from "../Components/RNCamera"
export const HomeScreen = () => {
    const [state, setState] = useState({
        openCamera: false
    })
    const rnRef = React.createRef<Camera>();
    // const [isRecording, setRecording] = useState(false);
    const {isRecording, recordVideo, stopRecording, setIsRecording, setCameraRef} = useCamera()
    return <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>

            <Button title="OpenCamera" onPress={() => setState({ ...state, openCamera: true })} />

            {state.openCamera && !isRecording && <Button title="Record" onPress={async () => {
                if(!isRecording){
                    setIsRecording(true)
                    let video = await recordVideo().catch((error)=>{
                        console.log(error)
                    })
                    console.log('video ',video);
                    // let video = await  new Promise((resolve, reject) => {
                    //         rnRef.current?.startRecording({
                    //         onRecordingFinished: (video) => {
                    //             resolve(video)
                    //             setIsRecording(false)
                    //         },
                    //         onRecordingError: (error) => {
                    //             console.log(error)
                    //             reject(error)
                    //             setIsRecording(false)
                    //         },
                    //     })
                    // });
                }
                
            }} />}
            
            {isRecording && <Button title="Stop" onPress={async () => {
                await stopRecording()
            }} />}
        </View>
        {state.openCamera && <RNCamera forwardedRef={(ref:any)=>{setCameraRef(ref)}} ></RNCamera>}
    </View>
}