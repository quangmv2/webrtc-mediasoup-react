import React, { useState } from 'react';
import Control from '../../components/control';
import Login from '../../components/login';
import './index.css';
import { Device } from "mediasoup-client";
import io from  "../../services/lib/socketio";
import { RoomClient } from "../../services/RoomClient";

const socket = io("https://192.168.10.105:3016/", {
    transports: ["websocket", "polling"]
});



function Conference() {

    const [rc, setRc] = useState<RoomClient>();
    const [login, setLogin] = useState<boolean>(false);

    const loginSuccess = () => {
        setLogin(true);
    }

    const joinRoom = async (name: string, room_id: string) => {
        if (rc && rc.isOpen()) {
          console.log('already connected to a room')
        } else {
          const newRc = new RoomClient(null, null, null, Device, socket, room_id, name, loginSuccess)
          console.log(newRc);
          
          setRc(newRc);
        //   const newRc = new RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen)
        }
      
      }

    return (
        <div className="container">
            {
                login ? <Control rc={rc} />
                  :
                    <Login onLogin={joinRoom} />
            }
        </div>
    );
}

export default Conference;
