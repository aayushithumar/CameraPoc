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
    const [isRecording, setRecording] = useState(false);
    
    return <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>

            <Button title="OpenCamera" onPress={() => setState({ ...state, openCamera: true })} />

            {state.openCamera && !isRecording && <Button title="Record" onPress={async () => {
                if(!isRecording){
                    // setRecording(true)
                    let video = await  new Promise((resolve, reject) => {
                        rnRef.current?.startRecording({
                        onRecordingFinished: (video) => {
                            resolve(video)
                            setRecording(false)
                        },
                        onRecordingError: (error) => {
                            console.log(error)
                            reject(error)
                            setRecording(false)
                        },
                    })
                });
                console.log('recorded : ', video)
                }
                
            }} />}
            
            {isRecording && <Button title="Stop" onPress={async () => {
                await rnRef.current?.stopRecording()
            }} />}
        </View>
        {/* {state.openCamera && <RNCamera forwardedRef={rnRef} ></RNCamera>} */}
        <RNCamera forwardedRef={rnRef} ></RNCamera>
    </View>
}