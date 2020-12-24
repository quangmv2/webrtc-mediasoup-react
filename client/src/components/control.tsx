import { Button } from 'antd';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { RoomClient } from '../pages/services/RoomClient';
import './index.css';
import Video from './video';
import VideoContainer from './video-container';
import { AudioMutedOutlined, AudioOutlined, PhoneOutlined, VideoCameraOutlined, VideoCameraTwoTone } from "@ant-design/icons";


interface Props {
    rc?: RoomClient
}

const Control: FunctionComponent<Props> = ({
    rc
}) => {

    const [audio, setAudio] = useState<boolean>(false);
    const [video, setVideo] = useState<boolean>(false);
    const [audioDevices, setAudioDevices] = useState<any[]>([]);
    const [videoDevices, setVideoDevices] = useState<any[]>([]);
    const localVideo = useRef(null)
    const remoteVideo = useRef(null)

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const vds: any[] = [], ads: any[] = [];
            devices.forEach(device => {
                if ('audioinput' === device.kind) {
                    ads.push(device)
                } else if ('videoinput' === device.kind) {
                    vds.push(device)
                }
            });
            setAudioDevices(ads);
            setVideoDevices(vds)
        })
        if (!rc) return;
        rc.localMediaEl = localVideo.current;
        rc.remoteVideoEl = remoteVideo.current;
    }, []);

    useEffect(() => {
        if (!rc || !videoDevices || videoDevices.length == 0) return;
        addListeners();
        openCamera();
    }, [rc]);


    const addListeners = () => {
        if (!rc) return;
        rc.on(RoomClient.EVENTS.startScreen, () => {
        })

        rc.on(RoomClient.EVENTS.stopScreen, () => {
        })

        rc.on(RoomClient.EVENTS.stopAudio, () => {
        })
        rc.on(RoomClient.EVENTS.startAudio, () => {
        })

        rc.on(RoomClient.EVENTS.startVideo, () => {
            console.log("start");
        })
        rc.on(RoomClient.EVENTS.stopVideo, () => {
        })
        rc.on(RoomClient.EVENTS.exitRoom, () => {
        })
    }

    const openCamera = () => {
        console.log("video", video);
        if (video) {
            console.log("close vd", video);
            rc?.closeProducer(RoomClient.mediaType.video);
            setVideo(false)
            return;
        }
        setVideo(true);
        rc?.produce(RoomClient.mediaType.video, videoDevices[0].value);
    }

    return (
        <>
            <VideoContainer local={localVideo} remote={remoteVideo} />
            <div className="control-container">
                <div className="control">
                    {/* <button id='exitButton' className='hidden'>Exit</button>
                    <br />
        audio: <select id="audioSelect">
                        {
                            audioDevices && audioDevices.map(device => (
                                <option value={device.deviceId} key={`${device.deviceId} ${device.label}`}>{device.label}</option>
                            ))
                        }
                    </select>
                    <br />
        video: <select id="videoSelect">
                        {
                            videoDevices && videoDevices.map(device => (
                                <option value={device.deviceId} key={`${device.deviceId} ${device.label}`}>{device.label}</option>
                            ))
                        }
                    </select>
                    <br /> */}
                    <div className="button-control">
                        <Button shape="circle" icon={audio ? <AudioOutlined /> : <AudioMutedOutlined />}
                            type={audio ? "primary" : 'dashed'}
                            size="large"
                        >
                        </Button>
                        <Button shape="circle" icon={<VideoCameraOutlined />}
                            onClick={openCamera}
                            type={video ? "primary" : 'dashed'}
                            size="large"
                        >
                        </Button>
                        <Button shape="circle" icon={<PhoneOutlined />}
                            type="primary"
                            size="large"
                            danger
                        >
                        </Button>

                    </div>
                </div>
            </div>
        </>

    );
}

export default Control;
