import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import mqtt from 'mqtt';
import { Joystick } from 'react-joystick-component';
import throttle from 'lodash.throttle';

function AppLogin({ loggedIn, onLogin }) {
  const videoRef = useRef(null);
  const [cameraUrl, setCameraUrl] = useState('');
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [form] = Form.useForm();
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState('');
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [robotJoystickPosition, setRobotJoystickPosition] = useState({ x: 0, y: 0 });
  const [headJoystickPosition, setHeadJoystickPosition] = useState({ x: 0, y: 0 });

  const onFinish = (values) => {
    onLogin(values);
  };

  useEffect(() => {
    if (loggedIn && !client) {
      const mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient.subscribe('robot/ipadress');
        mqttClient.publish('robot/getip', ''); // Request the IP address
      });
      mqttClient.on('message', (topic, payload) => {
        if (topic === 'robot/ipadress') {
          const ipAddress = payload.toString();
          setCameraUrl(`http://${ipAddress}:8001/stream.mjpg`);
        }
        if (topic === 'robot/forward') {
          setMessage(payload.toString());
        }
      });
      mqttClient.on('error', (error) => {
        console.error('MQTT connection error:', error);
      });
      setClient(mqttClient);
    }
  }, [loggedIn, client]);

  const throttledHandleMove = useCallback(
    throttle((direction, topic) => {
      if (client) {
        switch (direction) {
          case 'FORWARD':
            client.publish('robot/forward', '1');
            break;
          case 'BACKWARD':
            client.publish('robot/backward', '1');
            break;
          case 'LEFT':
            client.publish('robot/left', '1');
            break;
          case 'RIGHT':
            client.publish('robot/right', '1');
            break;
          default:
            break;
        }
        console.log(`Message sent to ${topic}: ${direction} = 1`);
      }
    }), // Adjust the throttle interval as needed
    [client]
  );

  const throttledHandleJoystickMove = useCallback(
    throttle((direction, topic) => {
      if (client) {
        switch (direction) {
          case 'FORWARD':
            client.publish('robot/head/up', '1');
            break;
          case 'BACKWARD':
            client.publish('robot/head/down', '1');
            break;
          case 'LEFT':
            client.publish('robot/head/left', '1');
            break;
          case 'RIGHT':
            client.publish('robot/head/right', '1');
            break;
          default:
            break;
        }
        console.log(`Message sent to ${topic}: ${direction}`);
      }
    }, 100), // Adjust the throttle interval as needed
    [client]
  );

  const handleStop = (topic) => {
    if (client) {
      client.publish('robot/forward', '0');
      client.publish('robot/backward', '0');
      client.publish('robot/left', '0');
      client.publish('robot/right', '0');
      client.publish('robot/head/up', '0');
      client.publish('robot/head/down', '0');
      client.publish('robot/head/left', '0');
      client.publish('robot/head/right', '0');
      console.log(`Message sent to ${topic}: 0`);
    }
  };

  const handleKeyDown = (event) => {
    if (client && !isJoystickActive) {
      setIsJoystickActive(true);
      switch (event.key) {
        case 'z':
          throttledHandleMove('FORWARD', 'robot/forward');
          setRobotJoystickPosition((prevPos) => ({ ...prevPos, y: -1 }));
          break;
        case 's':
          throttledHandleMove('BACKWARD', 'robot/backward');
          setRobotJoystickPosition((prevPos) => ({ ...prevPos, y: 1 }));
          break;
        case 'q':
          throttledHandleMove('LEFT', 'robot/left');
          setRobotJoystickPosition((prevPos) => ({ ...prevPos, x: -1 }));
          break;
        case 'd':
          throttledHandleMove('RIGHT', 'robot/right');
          setRobotJoystickPosition((prevPos) => ({ ...prevPos, x: 1 }));
          break;
        case '8':
          throttledHandleJoystickMove('FORWARD', 'robot/head/up');
          setHeadJoystickPosition((prevPos) => ({ ...prevPos, y: -1 }));
          break;
        case '2':
          throttledHandleJoystickMove('BACKWARD', 'robot/head/down');
          setHeadJoystickPosition((prevPos) => ({ ...prevPos, y: 1 }));
          break;
        case '4':
          throttledHandleJoystickMove('LEFT', 'robot/head/left');
          setHeadJoystickPosition((prevPos) => ({ ...prevPos, x: -1 }));
          break;
        case '6':
          throttledHandleJoystickMove('RIGHT', 'robot/head/right');
          setHeadJoystickPosition((prevPos) => ({ ...prevPos, x: 1 }));
          break;
        default:
          break;
      }
    }
  };

  const handleKeyUp = (event) => {
    if (client && isJoystickActive) {
      setIsJoystickActive(false);
      switch (event.key) {
        case 'z':
        case 's':
        case 'q':
        case 'd':
          handleStop('robot');
          break;
        case '8':
        case '2':
        case '4':
        case '6':
          handleStop('robot/head');
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleModeChange = (mode) => {
    const topic = 'robot/mode';
    const message = mode === 'auto' ? '1' : '0'; // Assuming '1' is for auto and '0' for manual
    client.publish(topic, message);
  };

  const handleEmergency = () => {
    const topic = 'robot/emergency';
    const message = '1'; // Assuming '1' is for emergency activation
    client.publish(topic, message);
  };

  return (
    <div>
      {loggedIn ? (
        <div id="robot-control" className="block" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={() => handleModeChange('manual')}>Manual</Button>
            <Button onClick={() => handleModeChange('auto')}>Auto</Button>
            <Button onClick={handleEmergency}>Emergency</Button>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            <div className="control-container" style={{ flex: '2', display: 'flex', flexDirection: 'row', border: '1px solid #ccc', padding: '16px' }}>
              <div className="control-section" style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center', fontSize: '1.5em', marginBottom: '16px' }}>Contrôle des mouvements</h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#f0f0f0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Joystick
                    size={100}
                    baseColor="#f0f0f0"
                    stickColor="#2196f3"
                    stickWidth={20}
                    borderWidth={2}
                    move={(e) => throttledHandleMove(e.direction, 'robot')}
                    stop={() => handleStop('robot')}
                    position={robotJoystickPosition}
                  />
                </div>
              </div>
              <div className="control-section" style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center', fontSize: '1.5em', marginBottom: '16px' }}>Contrôle de la tête du robot</h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#f0f0f0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Joystick
                    size={100}
                    baseColor="#f0f0f0"
                    stickColor="#2196f3"
                    stickWidth={20}
                    borderWidth={2}
                    move={(e) => throttledHandleJoystickMove(e.direction, 'robot/head')}
                    stop={() => handleStop('robot/head')}
                    position={headJoystickPosition}
                  />
                </div>
              </div>
            </div>
            <div className="camera-container" style={{ flex: '3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img id="mjpeg" ref={videoRef} alt="Camera Feed" src={cameraUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      ) : (
        <div id="login-form" className="block" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '16px' }}>Login</h1>
          <Form form={form} name="login" onFinish={onFinish} style={{ width: '100%', maxWidth: '400px' }}>
            <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default AppLogin;
