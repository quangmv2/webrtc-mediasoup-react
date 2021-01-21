import React, { useEffect, useState } from 'react';
import Control from '../../components/control';
import Login from '../../components/login';
import './index.css';
import { Device } from "mediasoup-client";
import io from "../../services/lib/socketio";
import { RoomClient } from "../../services/RoomClient";
import { message } from 'antd';

const socket = io("https://localhost:3016", {
  transports: ["websocket", "polling"]
});

let load = () => {}

function Conference() {

  const [rc, setRc] = useState<RoomClient>();
  const [login, setLogin] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const myParam = urlParams.get('room');
    const join = urlParams.get('join');

    if (myParam && join) {
      joinRoom(Math.round(Math.random() * 10000) + '', myParam);
    }
    
}, []);

  const loginSuccess = (rcc) => {
    if (rcc) {
      setRc(rcc);
      setSigning(false)
      setLogin(true);
      load()
    } else {
      message.error("Singing failed")
    }
  }

  const joinRoom = async (name: string, room_id: string) => {
    if (rc && rc.isOpen()) {
      console.log('already connected to a room')
    } else {
      setSigning(true);
      load = message.loading('Signing')
      const newRc = new RoomClient(null, null, null, Device, socket, room_id, name, loginSuccess)
    }

  }



  return (
    <div className="container">
      {
        login ? <Control rc={rc} />
          :
          <Login signing={signing} onLogin={joinRoom} />
      }
    </div>
  );
}

export default Conference;
