/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName,callScreenname} from './app.json';
import Call from './Call';
AppRegistry.registerComponent(appName, () => Call);
AppRegistry.registerComponent(callScreenname, () => Call);

