import { message } from "antd"

const mediaType = {
    audio: 'audioType',
    video: 'videoType',
    screen: 'screenType'
}
const _EVENTS = {
    exitRoom: 'exitRoom',
    openRoom: 'openRoom',
    startVideo: 'startVideo',
    stopVideo: 'stopVideo',
    startAudio: 'startAudio',
    stopAudio: 'stopAudio',
    startScreen: 'startScreen',
    stopScreen: 'stopScreen'
}

export const TYPE_CHANGE_USER = {
    join: "join",
    add: "add",
    exit: "exit",
    reload: "reload"
}

export const EVENTS = {
    onChangeStream: "on-change-stream"
}

export const EVENT_CHANGE_STREAM = {
    add: "add",
    remove: "remove"
}

class RoomClient {

    constructor(localMediaEl, remoteVideoEl, remoteAudioEl, mediasoupClientDevice, socket, room_id, name, successCallback) {
        this.name = name
        this.localMediaEl = localMediaEl
        this.remoteVideoEl = remoteVideoEl
        this.remoteAudioEl = remoteAudioEl
        this.mediasoupClientDevice = mediasoupClientDevice

        this.socket = socket
        this.producerTransport = null
        this.consumerTransport = null
        this.device = null
        this.room_id = room_id

        this.consumers = new Map()
        this.producers = new Map()

        this.users = new Map()

        this.streams = new Map();
        this.audios = new Map();
        this.locals = [];

        /**
         * map that contains a mediatype as key and producer_id as value
         */
        this.producerLabel = new Map()

        this.onStream = (streams) => { }
        this.onStreamLocal = (streams) => { }
        this.onChangeUser = (user, type) => {

        }
        this.onInit = () => {

        }

        this.events = new Map();

        this.addListener = (event, _callback) => {
            if (!this.events.get(event)) this.events.set(event, [])
            const _callbacks = this.events.get(event);
            _callbacks.push(_callback)
        }
        this.removeListener = (event, _callback) => {
            console.log("events", this.events);
            if (!this.events.get(event)) return;
            const _callbacks = this.events.get(event);
            const index = _callbacks.findIndex(i => i == _callback);
            _callbacks.splice(index, 1);
            console.log("events", this.events);
        }

        this._isOpen = false
        this.eventListeners = new Map()
        Object.keys(_EVENTS).forEach(function (evt) {
            this.eventListeners.set(evt, [])
        }.bind(this))


        this.createRoom(room_id).then(async function () {
            await this.join(name, room_id)
            await this.initSockets()
            // console.log("log init");
            this._isOpen = true
            successCallback(this)
            // this.onChangeUser(this.users, TYPE_CHANGE_USER.reload)
        }.bind(this))

    }

    request(type, data = {}) {
        return new Promise((resolve, reject) => {
            // console.log(this.socket);
            this.socket.emit(type, data, (data) => {
                if (data.error) {
                    reject(data.error)
                } else {
                    resolve(data)
                }
            })
        })
    }

    ////////// INIT /////////

    async createRoom(room_id) {
        console.log(this.socket);
        await this.request('createRoom', {
            room_id
        }).catch(err => {
            console.log(err)
        })
    }

    async join(name, room_id) {

        try {
            const e = await this.request('join', {
                name,
                room_id
            });
            this.users.clear()
            e?.data.users.forEach(us => this.users.set(us._id, us));
            console.log("peers", e)
            const load = message.loading("Loading device")
            const data = await this.request('getRouterRtpCapabilities');
            let device = await this.loadDevice(data)
            this.device = device
            console.log(device);
            await this.initTransports(device)
            load();
            this.socket.emit('getProducers')
            this.onChangeUser(this.users, TYPE_CHANGE_USER.reload)

        } catch (error) {
            console.log(error);
        }
    }

    async loadDevice(routerRtpCapabilities) {
        let device
        try {
            device = new this.mediasoupClientDevice();
        } catch (error) {
            if (error.name === 'UnsupportedError') {
                console.error('browser not supported');
            }
            console.error(error)
        }
        await device.load({
            routerRtpCapabilities
        })
        return device

    }

    async initTransports(device) {

        // const peers = this.socket.on('new-peer')

        // init producerTransport
        {
            const data = await this.request('createWebRtcTransport', {
                forceTcp: false,
                rtpCapabilities: device.rtpCapabilities,
            })
            if (data.error) {
                console.error(data.error);
                return;
            }

            this.producerTransport = await device.createSendTransport(data);
            console.log("oke tran");

            this.producerTransport.on('connect', async function ({
                dtlsParameters
            }, callback, errback) {
                this.request('connectTransport', {
                    dtlsParameters,
                    transport_id: data.id
                })
                    .then(callback)
                    .catch(errback)
            }.bind(this));

            this.producerTransport.on('produce', async function ({
                kind,
                rtpParameters
            }, callback, errback) {
                try {
                    const {
                        producer_id
                    } = await this.request('produce', {
                        producerTransportId: this.producerTransport.id,
                        kind,
                        rtpParameters,
                    });
                    callback({
                        id: producer_id
                    });
                } catch (err) {
                    errback(err);
                }
            }.bind(this))

            this.producerTransport.on('connectionstatechange', function (state) {
                switch (state) {
                    case 'connecting':

                        break;

                    case 'connected':
                        //localVideo.srcObject = stream
                        break;

                    case 'failed':
                        this.producerTransport.close();
                        break;

                    default:
                        break;
                }
            }.bind(this));
        }

        // init consumerTransport
        {
            const data = await this.request('createWebRtcTransport', {
                forceTcp: false,
            });
            if (data.error) {
                console.error(data.error);
                return;
            }

            // only one needed
            this.consumerTransport = device.createRecvTransport(data);
            this.consumerTransport.on('connect', function ({
                dtlsParameters
            }, callback, errback) {
                this.request('connectTransport', {
                    transport_id: this.consumerTransport.id,
                    dtlsParameters
                })
                    .then(callback)
                    .catch(errback);
            }.bind(this));

            this.consumerTransport.on('connectionstatechange', async function (state) {
                switch (state) {
                    case 'connecting':
                        break;
                    case 'connected':
                        //remoteVideo.srcObject = await stream;
                        //await socket.request('resume');
                        break;

                    case 'failed':
                        this.consumerTransport.close();
                        break;

                    default:
                        break;
                }
            }.bind(this));
        }

    }

    initSockets() {
        this.socket.on('consumerClosed', function ({
            consumer_id
        }) {
            console.log('closing consumer:', consumer_id)
            this.removeConsumer(consumer_id)
        }.bind(this))

        /**
         * data: [ {
         *  producer_id:
         *  producer_socket_id:
         * }]
         */
        this.socket.on('newProducers', async function (data) {
            console.log('new producers', data)
            for (let {
                producer_id,
                producer_socket_id
            } of data) {
                await this.consume(producer_id, producer_socket_id)
            }
        }.bind(this))

        this.socket.on("new-user", (data) => {
            this.users.set(data?.user._id, data?.user)
            console.log(this.users);
            this.onChangeUser(data, TYPE_CHANGE_USER.add)
        })

        this.socket.on("delete-user", (data) => {
            this.users.delete(data?.user._id)
            this.onChangeUser(data, TYPE_CHANGE_USER.exit)
        })

        this.socket.on('disconnect', function () {
            this.exit(true)
            message.error("Disconnect to server", 2);
        }.bind(this))
    }


    //////// MAIN FUNCTIONS /////////////

    getUsers() {
        return Array.from(this.users.keys()).reduce((arr, key) => { arr.push(this.users.get(key)); return arr; }, []);
    }

    getStreams() {
        return this.streams;
    }

    getAudios() {
        return this.audios;
    }

    getStreamsById(_id) {
        const consumers = Array.from(this.consumers.keys()).reduce((arr, key) => {
            const cs = this.consumers.get(key);
            if (cs && cs.kind == "video" && cs.userID == _id) arr.push(cs.id)
            return arr;
        }, []);
        return consumers.reduce((arr, cs) => {
            arr.push(this.streams.get(cs));
            return arr;
        }, []);
    }

    getStreamsAudioById(_id) {
        const consumers = Array.from(this.consumers.keys()).reduce((arr, key) => {
            const cs = this.consumers.get(key);
            if (cs && cs.kind == "audio" && cs.userID == _id) arr.push(cs.id)
            return arr;
        }, []);
        return consumers.reduce((arr, cs) => {
            arr.push(this.audios.get(cs));
            return arr;
        }, []);
    }

    async produce(type, deviceId = null) {
        let mediaConstraints = {}
        let audio = false
        let screen = false
        console.log(type, deviceId);
        switch (type) {
            case mediaType.audio:
                mediaConstraints = {
                    audio: {
                        deviceId: deviceId
                    },
                    video: false
                }
                audio = true
                break
            case mediaType.video:
                mediaConstraints = {
                    audio: false,
                    video: {
                        width: {
                            min: 640,
                            ideal: 1920
                        },
                        height: {
                            min: 400,
                            ideal: 1080
                        },
                        deviceId: deviceId,
                        aspectRatio: {
                            ideal: 1.7777777778
                        }
                    }
                }
                break
            case mediaType.screen:
                mediaConstraints = false
                screen = true
                break;
            default:
                return
                break;
        }
        if (this.device && !this.device.canProduce('video') && !audio) {
            console.error('cannot produce video');
            return;
        }
        if (this.producerLabel.has(type)) {
            console.log('producer already exists for this type ' + type)
            return
        }
        console.log('mediacontraints:', mediaConstraints)
        let stream;
        try {
            stream = screen ? await navigator.mediaDevices.getDisplayMedia() : await navigator.mediaDevices.getUserMedia(mediaConstraints)
            console.log(navigator.mediaDevices.getSupportedConstraints())

            const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0]
            const params = {
                track
            };
            if (!audio && !screen) {
                params.encodings = [{
                    rid: 'r0',
                    maxBitrate: 100000,
                    //scaleResolutionDownBy: 10.0,
                    scalabilityMode: 'S1T3'
                },
                {
                    rid: 'r1',
                    maxBitrate: 300000,
                    scalabilityMode: 'S1T3'
                },
                {
                    rid: 'r2',
                    maxBitrate: 900000,
                    scalabilityMode: 'S1T3'
                }
                ];
                params.codecOptions = {
                    videoGoogleStartBitrate: 1000
                };
            }
            const producer = await this.producerTransport.produce(params)

            console.log('producer', producer)

            this.producers.set(producer.id, producer)
            console.log("change producers", this.producers);

            let elem
            // console.log(this.localMediaEl.childNodes);
            if (!audio) {
                // elem = document.createElement('video')
                // elem.srcObject = stream
                // elem.id = producer.id
                // elem.playsinline = false
                // elem.autoplay = true
                // elem.className = "vid"
                // this.localMediaEl.srcObject = stream
                this.locals.push(stream);
                console.log("locals", this.locals);
                this.onStreamLocal(this.locals)
            }

            producer.on('trackended', () => {
                this.closeProducer(type)
            })

            producer.on('transportclose', () => {
                console.log('producer transport close')
                if (!audio) {
                    elem.srcObject.getTracks().forEach(function (track) {
                        track.stop()
                    })
                    elem.parentNode.removeChild(elem)
                }
                this.producers.delete(producer.id)
                console.log("change producers", this.producers);


            })

            producer.on('close', () => {
                console.log('closing producer')
                if (!audio) {
                    elem.srcObject.getTracks().forEach(function (track) {
                        track.stop()
                    })
                    elem.parentNode.removeChild(elem)
                }
                this.producers.delete(producer.id)
                console.log("change producers", this.producers);


            })

            this.producerLabel.set(type, producer.id)

            switch (type) {
                case mediaType.audio:
                    this.event(_EVENTS.startAudio)
                    break
                case mediaType.video:
                    this.event(_EVENTS.startVideo)
                    break
                case mediaType.screen:
                    this.event(_EVENTS.startScreen)
                    break;
                default:
                    return
                    break;
            }
        } catch (err) {
            console.log(err)
        }
    }

    async consume(producer_id, userID) {

        //let info = await roomInfo()

        this.getConsumeStream(producer_id).then(function ({
            consumer,
            stream,
            kind
        }) {
            consumer.userID = userID
            this.consumers.set(consumer.id, consumer)
            const user_tmp = this.users.get(userID);
            console.log(user_tmp);
            if (!user_tmp.consumers)
                user_tmp["consumers"] = new Map()
            user_tmp.consumers.set(consumer.id, consumer)
            this.onChangeUser(this.users, TYPE_CHANGE_USER.reload)
            console.log("con", this.users);
            console.log("consumers", this.consumers);

            let elem;
            if (kind === 'video') {
                // elem = document.createElement('video')
                // elem.srcObject = stream
                // elem.id = consumer.id
                // elem.playsinline = false
                // elem.autoplay = true
                // elem.className = "vid"
                // this.remoteVideoEl.appendChild(elem)
                // console.log(stream);
                this.streams.set(consumer.id, stream)
                // this.onChangeStream(userID)
                // this.onStream(elem)
                const __callbacks = this.events.get(EVENTS.onChangeStream);
                console.log(__callbacks);
                if (__callbacks)
                    __callbacks.forEach(cb => cb(userID, EVENT_CHANGE_STREAM.add))
            } else {
                // elem = document.createElement('audio')
                // elem.srcObject = stream
                // elem.id = consumer.id
                // elem.playsinline = false
                // elem.autoplay = true
                // // this.remoteAudioEl.appendChild(elem)
                this.audios.set(consumer.id, stream)
                const __callbacks = this.events.get(EVENTS.onChangeStream);
                console.log(__callbacks);
                if (__callbacks)
                    __callbacks.forEach(cb => cb(userID, EVENT_CHANGE_STREAM.add))
            }

            consumer.on('trackended', function () {
                this.removeConsumer(consumer.id)
            }.bind(this))
            consumer.on('transportclose', function () {
                this.removeConsumer(consumer.id)
            }.bind(this))



        }.bind(this))
    }

    async getConsumeStream(producerId) {
        const {
            rtpCapabilities
        } = this.device
        const data = await this.request('consume', {
            rtpCapabilities,
            consumerTransportId: this.consumerTransport.id, // might be 
            producerId
        });
        const {
            id,
            kind,
            rtpParameters,
        } = data;

        let codecOptions = {};
        const consumer = await this.consumerTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            codecOptions,
        })
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        return {
            consumer,
            stream,
            kind
        }
    }

    closeProducer(type) {
        if (!this.producerLabel.has(type)) {
            console.log('there is no producer for this type ' + type)
            return
        }
        let producer_id = this.producerLabel.get(type)
        console.log(producer_id)
        this.socket.emit('producerClosed', {
            producer_id
        })
        this.producers.get(producer_id).close()
        this.producers.delete(producer_id)
        this.producerLabel.delete(type)

        console.log("change producers", this.producers);


        // if (type !== mediaType.audio) {
        //     let elem = document.getElementById(producer_id)
        //     elem.srcObject.getTracks().forEach(function (track) {
        //         track.stop()
        //     })
        //     elem.parentNode.removeChild(elem)
        // }

        switch (type) {
            case mediaType.audio:
                this.event(_EVENTS.stopAudio)
                break
            case mediaType.video:
                this.event(_EVENTS.stopVideo)
                this.locals.shift()
                // this.onStream()
                break
            case mediaType.screen:
                this.event(_EVENTS.stopScreen)
                break;
            default:
                return
                break;
        }

    }

    pauseProducer(type) {
        if (!this.producerLabel.has(type)) {
            console.log('there is no producer for this type ' + type)
            return
        }
        let producer_id = this.producerLabel.get(type)
        this.producers.get(producer_id).pause()

    }

    resumeProducer(type) {
        if (!this.producerLabel.has(type)) {
            console.log('there is no producer for this type ' + type)
            return
        }
        let producer_id = this.producerLabel.get(type)
        this.producers.get(producer_id).resume()

    }

    removeConsumer(consumer_id) {
        // let elem = document.getElementById(consumer_id)
        // // elem.srcObject.getTracks().forEach(function (track) {
        // //     track.stop()
        // // })
        // console.log(elem);
        // if (elem) elem.parentNode.removeChild(elem)

        console.log("ss", this.users);
        console.log(consumer_id);
        const consumer = this.consumers.get(consumer_id);
        console.log(this.consumers, consumer);
        if (consumer && this.events.get(EVENTS.onChangeStream)) this.events.get(EVENTS.onChangeStream).forEach(cb => cb(consumer.userID, EVENT_CHANGE_STREAM.remove))
        this.onChangeUser(this.users, TYPE_CHANGE_USER.reload)
        console.log("ss", this.users);
        this.streams.delete(consumer_id)
        this.consumers.delete(consumer_id)
    }

    exit(offline = false) {

        let clean = function () {
            this._isOpen = false
            this.consumerTransport.close()
            this.producerTransport.close()
            this.socket.off('disconnect')
            this.socket.off('newProducers')
            this.socket.off('consumerClosed')
        }.bind(this)

        if (!offline) {
            this.request('exitRoom').then(e => console.log(e)).catch(e => console.warn(e)).finally(function () {
                clean()
            }.bind(this))
        } else {
            clean()
        }

        this.event(_EVENTS.exitRoom)

    }

    ///////  HELPERS //////////

    async roomInfo() {
        let info = await this.request('getMyRoomInfo')
        return info
    }

    static get mediaType() {
        return mediaType
    }

    event(evt) {
        if (this.eventListeners.has(evt)) {
            this.eventListeners.get(evt).forEach(callback => callback())
        }
    }

    on(evt, callback) {
        this.eventListeners.get(evt).push(callback)
    }




    //////// GETTERS ////////

    isOpen() {
        return this._isOpen
    }

    static get EVENTS() {
        return _EVENTS
    }
}

export {
    RoomClient
}