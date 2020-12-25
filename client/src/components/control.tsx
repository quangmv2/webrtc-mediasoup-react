import { Button } from 'antd';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { RoomClient } from '../pages/services/RoomClient';
import './index.css';
import VideoContainer from './video-container';
import { AudioMutedOutlined, AudioOutlined, FundProjectionScreenOutlined, PhoneOutlined, VideoCameraOutlined, VideoCameraTwoTone } from "@ant-design/icons";


interface Props {
    rc?: RoomClient
}

const Control: FunctionComponent<Props> = ({
    rc
}) => {

    const [audio, setAudio] = useState<boolean>(false);
    const [video, setVideo] = useState<boolean>(false);
    const [screen, setScreen] = useState<boolean>(false);
    const [audioDevices, setAudioDevices] = useState<any[]>([]);
    const [videoDevices, setVideoDevices] = useState<any[]>([]);
    const localVideo = useRef(null)
    const remoteVideo = useRef(null)

    useEffect(() => {
        try {
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
        } catch (error) {
            alert("No device or no permission use device");
        }
        if (!rc) return;
        rc.localMediaEl = localVideo.current;
        rc.remoteVideoEl = remoteVideo.current;
    }, []);

    useEffect(() => {
        if (!rc || !videoDevices || videoDevices.length == 0) return;
        addListeners();
        openCamera();
        openAudio();
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
        if (screen) return;
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

    const openAudio = () => {
        console.log("video", audio);
        if (audio) {
            console.log("close vd", audio);
            rc?.closeProducer(RoomClient.mediaType.audio);
            setAudio(false)
            return;
        }
        setAudio(true);
        rc?.produce(RoomClient.mediaType.audio, audioDevices[0].value);
    }

    const openScreen = () => {
        if (video) return;
        console.log("video", screen);
        if (screen) {
            console.log("close vd", screen);
            rc?.closeProducer(RoomClient.mediaType.screen);
            setScreen(false)
            return;
        }
        setScreen(true);
        rc?.produce(RoomClient.mediaType.screen);
    }

    const exit = () => {
        rc?.exit(true);
        location.reload();
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
                            onClick={openAudio}
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
                            onClick={exit}
                            type="primary"
                            size="large"
                            danger
                        >
                        </Button>
                        <Button shape="circle" icon={<FundProjectionScreenOutlined />}
                            onClick={openScreen}
                            type={screen ? "primary" : 'dashed'}
                            size="large"
                        >
                        </Button>

                    </div>
                </div>
            </div>
        </>

    );
}

export default Control;
