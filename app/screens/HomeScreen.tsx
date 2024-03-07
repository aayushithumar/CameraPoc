import React, { useRef, useState } from "react"
import { Button, View } from "react-native"
import { Camera } from "react-native-vision-camera"
import useCamera from "../Components/RNHooks"
import RNCamera from "../Components/RNCamera"
export const HomeScreen = () => {
    const [state, setState] = useState({
        openCamera: false
    })
    const rnRef = useRef(null);
    const { setCameraRef, recordVideo, stopRecording } = useCamera()

    return <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>

            <Button title="OpenCamera" onPress={() => setState({ ...state, openCamera: true })} />

            <Button title="Record" onPress={async () => {
                let video = rnRef.current?.record()
                console.log('recorded : ', video)
            }} />
            <Button title="Stop" onPress={async () => {
                await rnRef.current?.stopRecording()

            }} />
        </View>
        {state.openCamera && <RNCamera recordVideo={(video) => {

        }} ></RNCamera>}
    </View>
}