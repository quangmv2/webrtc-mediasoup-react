/* eslint-disable */
import React, { FC, forwardRef, memo, Ref, RefObject, useEffect, useRef, useState } from 'react';
import * as faceapi from "face-api.js";
import './index.css';
import { Switch } from 'antd';


interface Props {
    className?: string,
    stream?: MediaStream,
    // faceapi?: any
}
// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5
const options: any = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })

let IdDetect: any = 0

const Video: FC<Props> = ({
    className,
    stream,
    // faceapi
}) => {
    const [ai, setAI] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true)
    const canvas = useRef<HTMLCanvasElement>(null);
    const video = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        load()
        // clearInterval(IdDetect)
        // IdDetect = setInterval(detect, 0)

        return () => clearInterval(IdDetect)
    }, [])


    useEffect(() => {
        video.current.srcObject = stream
    }, [stream])

    const onAI = () => {
        if (loading) return
        // clearInterval(IdDetect)
        // IdDetect = setInterval(detect, 100)
        // setTimeout(detect)
        setAI(true)
    }

    const offAI = () => {
        if (loading) return
        // clearInterval(IdDetect)
        setAI(false)
    }

    const load = async () => {
        const load: any = faceapi.nets;
        // await load.ssdMobilenetv1.loadFromUri("/models");
        // await load.faceRecognitionNet.loadFromUri("/models");
        // await load.faceLandmark68Net.loadFromUri("/models");
        await load.tinyFaceDetector.loadFromUri("/models");
        // await load.tinyYolov2.loadFromUri("/models");
        setLoading(false);
    }

    const detect = async () => {
        setAI(ai => {
            (async () => {
                try {
                    if (ai == false) {
                        setTimeout(detect)
                        return
                    }
                    const result = await faceapi.detectSingleFace(video.current, options);
                    
                    if (result) {
                        faceapi.draw.drawDetections(canvas.current, faceapi.resizeResults(result, faceapi.matchDimensions(canvas.current, video.current, true)))
                    } else {
                        faceapi.draw.drawDetections(canvas.current, []);
                    }
                    setTimeout(detect)
                } catch (error) {
                    console.log(error);
                }
            })()
            return ai;
        })

    }

    const onChangeAI = () => {
        if (loading) return;
        setAI(a => !a)

    }

    return (
        <div className={`${className} `} >
            <div className="ai">
                <Switch checked={ai} onChange={onChangeAI} />
            </div>
            <video className={`${stream ? '' : 'hidden'}`} onLoadedMetadata={() => detect()} autoPlay playsInline ref={video}>

            </video>
            <p className={`${!stream ? '' : 'hidden'}`}>
                No media
            </p>
            <canvas className={`${ai ? '' : 'hidden'}`} ref={canvas}>
            </canvas>
        </div>
    );
}

export default memo(Video);

