/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
const Width = Dimensions.get('window').width
const Height = Dimensions.get('window').height
import RingToneModule from './modules'
export default class Call extends Component<Props> {
  constructor(props){
    super(props)
    this.state={
      textMsg:"New Call arrived",
      newCall:true
    }
  }
  componentDidMount(){
    RingToneModule.PlaySound()
    }
    handleRefuse=()=>{
      RingToneModule.StopSound()
      this.setState({textMsg:"Call Refused",newCall:false})
    }
    handleAccepet=()=>{
      RingToneModule.StopSound()
      this.setState({textMsg:"Call accepted",newCall:false})
    }

  render() {
    return (
      <ImageBackground
        resizeMode="cover"
        source={require('./dummyBackground.jpg')}
        style={styles.container}>
        <Text style={styles.newcallText}>{this.state.textMsg} </Text>

        {this.state.newCall&&<View style={styles.buttonsContainer}>
          <TouchableOpacity 
          onPress={this.handleRefuse}
          style={[styles.btn, { backgroundColor: "red" }]}>
            <Text style={[styles.newcallText,{fontSize:14}]}>refuse</Text>
          </TouchableOpacity>
          <TouchableOpacity 
           onPress={this.handleAccepet}
          style={[styles.btn, { backgroundColor: "green" }]}>
            <Text style={[styles.newcallText,{fontSize:14}]}>accept</Text>
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
    justifyContent:"center",
    alignItems:"center"
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
