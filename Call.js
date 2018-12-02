/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList,Platform, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';

var WebRTC = require('react-native-webrtc');
var {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  getUserMedia,
} = WebRTC;
const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

const pcPeers = {};
let localStream;



function getLocalStream(isFront, callback) {

  let videoSourceId;

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      console.log("TAG", "sourceInfos: ", sourceInfos);

      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
  getUserMedia({
    audio: true,
    video: {
      mandatory: {
        minWidth: 640, // Provide your own width, height and frame rate here
        minHeight: 360,
        minFrameRate: 30,
      },
      facingMode: (isFront ? "user" : "environment"),
      optional: (videoSourceId ? [{ sourceId: videoSourceId }] : []),
    }
  }, function (stream) {
    console.log("TAG", 'getUserMedia success', stream);
    callback(stream);
  }, logError);
}



function createPC(socketId, isOffer) {
  console.log("TAG","createpcsocketid")
  const pc = new RTCPeerConnection(configuration);
 

  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    console.log("TAG", 'onicecandidate', event.candidate);
    if (event.candidate) {
      socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer((desc)=> {
      console.log("TAG", 'createOffer', desc);
      pc.setLocalDescription(desc, ()=> {
        console.log("TAG", 'setLocalDescription', pc.localDescription);
        socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError);
  }

  pc.onnegotiationneeded = () =>{
    console.log("TAG", 'onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange =  (event)=> {
    console.log("TAG", 'oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = (event)=> {
    console.log("TAG", 'onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream =  (event)=> {
    console.log("TAG", 'onaddstream', event);
    container.setState({ info: 'One peer join!' });

    const remoteList = container.state.remoteList;
    remoteList.push(event.stream.toURL());
    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
    console.log("TAG", 'onremovestream', event.stream);
  };
console.log("TAG","addlocalstream",localStream)
  pc.addStream(localStream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror =  (error) =>{
      console.log("TAG", "dataChannel.onerror", error);
    };

    dataChannel.onmessage =  (event)=> {
      console.log("TAG", "dataChannel.onmessage:", event.data);
      container.receiveTextData({ user: socketId, message: event.data });
    };

    dataChannel.onopen =  ()=> {
      console.log("TAG", 'dataChannel.onopen');
      container.setState({ textRoomConnected: true });
    };

    dataChannel.onclose =  () =>{
      console.log("TAG", "dataChannel.onclose");
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

function exchange(data) {
  console.log("TAG","exchange data",data)
  const fromId = data.from;
  let pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    console.log("TAG", 'exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp),  ()=> {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer( (desc)=> {
          console.log("TAG", 'createAnswer', desc);
          pc.setLocalDescription(desc,  ()=> {
            console.log("TAG", 'setLocalDescription', pc.localDescription);
            socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    console.log("TAG", 'exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  console.log("TAG", 'leave', socketId);
  const pc = pcPeers[socketId];
  const viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({ info: 'One peer leave!' });
}
function logError(error) {
  console.log("TAG", "logError", error);
}
function getStats() {
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    console.log('track', track);
    pc.getStats(track, function (report) {
      console.log('getStats report', report);
    }, logError);
  }
}
type Props = {};
var socket=null
const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height
import RingToneModule from './modules'
import SocketIOClient from 'socket.io-client';
const serverUrl = "http://192.168.43.149:5000"
export default class Call extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      textMsg: "New Call arrived",
      newCall: true,
      selfViewSrc:null,
      remoteList:[]
    }
  }
  componentDidMount() {
    // RingToneModule.PlaySound()
    container=this
  }
  Call() {
    this.setState({ status: 'connect', info: 'Connecting' });
    this.join("123456");
  }
  join=(roomID)=> {
    this.socket.emit('call', roomID, (socketIds)=> {
      console.log("TAG", 'join', socketIds);
      for (const i in socketIds) {
        const socketId = socketIds[i];
        createPC(socketId, true);
      }
    });
  }
  ConnectSocket = () => {
    try {
      console.log("TAG","ConnectSocket")
      this.socket = SocketIOClient(serverUrl);
      console.log("TAG",this.socket)
      socket=this.socket
      this.socket.on('exchange', function (data) {
        exchange(data);
      });
      this.socket.on('leave', function (socketId) {
        leave(socketId);
      });
      
      this.socket.on('connect',  (data)=> {
        console.log('connect');
        this.Call()
        getLocalStream(true,  (stream)=> {
          localStream = stream;
          console.log("TAG","stream",stream.toURL())
          this.setState({ selfViewSrc: stream.toURL() });
          this.setState({ status: 'ready', info: 'Please enter or create room ID' });
        });
      });
      this.socket.on('error', function onSocketError(e) {
        console.log("TAG", 'TAG', 'WebSocket Error ' + e);
      });
    } catch (error) {
      console.log("TAG",  "Error", error)
    }
  }
  
  closeSocket = () => {
    this.socket.disconnect()
  }
  handleRefuse = () => {
    RingToneModule.StopSound()
    this.setState({ textMsg: "Call Refused", newCall: false })
  }
  handleAccepet = () => {
    RingToneModule.StopSound()
    this.setState({ textMsg: "Call accepted", newCall: false })
  }

  render() {
    console.log("TAG","items",this.state.remoteList,this.state.selfViewSrc)
    return (
      <ImageBackground
        resizeMode="cover"
        source={require('./dummyBackground.jpg')}
        style={styles.container}>
        <Text style={styles.newcallText}>{this.state.textMsg} </Text>
        <View style={{  }}>
          <RTCView 
          streamURL={this.state.selfViewSrc} 
          style={{ width: Width * .8, height: Height * .4}} />
        </View>

        <View style={{ width: Width * .7, height: Height * .3,backgroundColor:"red"}}>
          <FlatList
          horizontal
          data={this.state.remoteList}
          extraData={this.state}
          keyExtractor={(item,index)=>index+""}
          renderItem={({item,index})=>{
            alert(item)
            return(
              <RTCView 
              streamURL={this.state.selfViewSrc} 
              style={{ width: Width * .8, height: Height * .4}} />
            )
          }}
          />
         
        </View>
        {this.state.newCall && <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={this.closeSocket}
            style={[styles.btn, { backgroundColor: "red" }]}>
            <Text style={[styles.newcallText, { fontSize: 14 }]}>disconnect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.ConnectSocket}
            style={[styles.btn, { backgroundColor: "blue" }]}>
            <Text style={[styles.newcallText, { fontSize: 14 }]}>connect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.sendData}
            style={[styles.btn, { backgroundColor: "green" }]}>
            <Text style={[styles.newcallText, { fontSize: 14 }]}>send data</Text>
          </TouchableOpacity>
        </View>}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: Width * .2,
    height: Width * .2,
    borderRadius: Width * .1,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonsContainer: {
    marginTop: Height * .2,
    width: "60%",
    height: "10%",
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: "row"
  },
  newcallText: {
    fontSize: 20,
    textAlign: 'center',
    color: "#fff",
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
