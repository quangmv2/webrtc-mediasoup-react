import { Button, message } from 'antd';
import React, { FunctionComponent, useEffect, useRef, useState, VideoHTMLAttributes } from 'react';
import { RoomClient, TYPE_CHANGE_USER } from '../services/RoomClient';
import './index.css';
import VideoContainer from './video-container';
import { AudioMutedOutlined, AudioOutlined, CloseOutlined, FullscreenExitOutlined, FullscreenOutlined, FundProjectionScreenOutlined, PhoneOutlined, UnorderedListOutlined, VideoCameraOutlined, VideoCameraTwoTone } from "@ant-design/icons";
import { User } from './list-user/user';
import Users from './list-user';
import { Consumer } from 'mediasoup/lib/types';

interface Props {
    rc?: RoomClient
}

const Control: FunctionComponent<Props> = ({
    rc
}) => {

    const [audio, setAudio] = useState<boolean>(false);
    const [video, setVideo] = useState<boolean>(false);
    const [screen, setScreen] = useState<boolean>(false);
    const [fullScreen, setFullScreen] = useState<boolean>(false);
    const [openListUser, setOpenListUser] = useState<boolean>(true);
    const [audioDevices, setAudioDevices] = useState<any[]>([]);
    const [videoDevices, setVideoDevices] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [streams, setStreams] = useState<Map<string, MediaStream>>();
    const [localVideo, setLocalVideo] = useState<MediaStream | null>(null)
    const [remoteVideo, setRemoteVideo] = useState<MediaStream | null>(null)
    const [userID, setUserID] = useState<string>(null);

    useEffect(() => {
        if (!rc) return;
        setUsers(rc.getUsers().filter((us: User) => us._id != rc.socket.id))
        rc.onChangeUser = (data: any, type: string) => {
            if (type == TYPE_CHANGE_USER.reload) {
                console.log(rc.getUsers(), rc.getUsers().filter((us: User) => us._id != rc.socket.id));

                return;
            }
            console.log(rc.getUsers(), rc.getUsers().filter((us: User) => us._id != rc.socket.id));
            
            setUsers(rc.getUsers().filter((us: User) => us._id != rc.socket.id))
            switch (type) {
                case TYPE_CHANGE_USER.join:
                    message.success("Join success", 2)
                    break;
                case TYPE_CHANGE_USER.add:
                    message.success(data?.user?.name + " Join", 2);
                    break;
                case TYPE_CHANGE_USER.exit:
                    message.error(data?.user?.name + " exit", 2);
                    break;
                default:
                    break;
            }
        }

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
                setVideoDevices(vds);
                openCamera(vds);
                openAudio(ads);
            })
        } catch (error) {
            alert("No device or no permission use device");
        }
        

    }, [rc]);

    useEffect(() => {
        if (!rc) return;
        console.log("users", rc.getUsers())
        addListeners();
    }, [rc]);

    useEffect(() => {
        setUserID(_id => {
            if (!users.find(us => us._id == _id)) return null;
            return _id;
        })
    }, [users])

    useEffect(() => {
        if (userID == null) setRemoteVideo(null);
    }, [userID])


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
        rc.onStreamLocal = onStreamLocal
    }

    const onStreamLocal = (streams: MediaStream[]) => {
        console.log(streams);
        if (streams && streams.length > 0) {
            setLocalVideo(streams[streams.length - 1]);
        }
    }

    const openCamera = (list?: any[]) => {
        console.log(rc.producerTransport);
        
        if (screen) {
            closeScreen();
        };
        console.log("video", video);
        if (video) {
            console.log("close vd", video);
            closeVideo();
            return;
        }
        if (list && list.length > 0) {
            rc?.produce(RoomClient.mediaType.video, list[0]?.value);
            setVideo(true);

            return;
        }
        if (videoDevices && videoDevices.length > 0) {
            rc?.produce(RoomClient.mediaType.video, videoDevices[0].deviceId);
            setVideo(true);
            return
        }
        message.error("No camera")

    }

    const closeVideo = () => {
        rc?.closeProducer(RoomClient.mediaType.video);
        setLocalVideo(null);
        setVideo(false)
    }

    const openAudio = (list?: any) => {
        console.log("video", audio);
        if (audio) {
            console.log("close vd", audio);
            rc?.closeProducer(RoomClient.mediaType.audio);
            setAudio(false)
            return;
        }
        if (list && list.length > 0) {
            rc?.produce(RoomClient.mediaType.audio, list[0]?.value);
            setAudio(true);
            return;
        }
        if (audioDevices && audioDevices.length > 0) {
            setAudio(true);
            rc?.produce(RoomClient.mediaType.audio, audioDevices[0]?.value);
            return
        }
        message.error("No microphone")
    }

    const openScreen = () => {
        if (video) closeVideo();
        console.log("video", screen);
        if (screen) {
            console.log("close vd", screen);
            closeScreen()
            return;
        }
        setScreen(true);
        rc?.produce(RoomClient.mediaType.screen);
    }

    const closeScreen = () => {
        rc?.closeProducer(RoomClient.mediaType.screen);
        setLocalVideo(null);
        setScreen(false)
    }

    const exit = () => {
        rc?.exit(true);
        location.replace("/")
    }

    const toggleFullscreen = () => {
        if (!document.fullscreen)
            document.body.requestFullscreen().then(() => setFullScreen(true))
        else document.exitFullscreen().then(() => setFullScreen(false))
    }

    const onClickUser = (_id: string) => {
        setUserID(_id);
        const stream: MediaStream[] = rc?.getStreamsById(_id)
        setRemoteVideo(stream && stream.length > 0 ? stream[0] : null);
    }

    return (
        <>
            <div>
                <div className="feature"
                >
                    <div className="button">
                        <p> {rc?.name} </p>
                        <Button icon={fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                            shape="circle"
                            size="large"
                            type="primary"
                            onClick={toggleFullscreen}
                        />
                        <Button icon={openListUser ? <CloseOutlined /> : <UnorderedListOutlined />}
                            shape="circle"
                            size="large"
                            type="primary"
                            onClick={() => setOpenListUser(b => !b)}
                        />
                    </div>
                    <Users users={users} roomClient={rc} visible={openListUser} onClickUser={onClickUser} placement="right" />

                </div>
            </div>
            <VideoContainer local={localVideo} remote={remoteVideo} />
            <div className="control-container">
                <div className="control">
                    <div className="button-control">
                        <Button shape="circle" icon={audio ? <AudioOutlined /> : <AudioMutedOutlined />}
                            onClick={() => openAudio()}
                            type={audio ? "primary" : 'dashed'}
                            size="large"
                        >
                        </Button>
                        <Button shape="circle" icon={<VideoCameraOutlined />}
                            onClick={() => openCamera()}
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
