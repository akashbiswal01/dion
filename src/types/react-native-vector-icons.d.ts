declare module 'react-native-vector-icons/*' {
  import { Component } from 'react';
  import { TextStyle, StyleProp } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    onPress?: () => void;
    testID?: string;
    [key: string]: any;
  }

  export default class Icon extends Component<IconProps> {}
}

declare module 'react-native-vector-icons' {
  import { Component } from 'react';
  import { TextStyle, StyleProp } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    onPress?: () => void;
    testID?: string;
    [key: string]: any;
  }

  export default class Icon extends Component<IconProps> {}
}
