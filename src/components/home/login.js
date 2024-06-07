import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import mqtt from 'mqtt';
import { Joystick } from 'react-joystick-component';
import throttle from 'lodash.throttle';

function AppLogin({ loggedIn, onLogin }) {
  const videoRef = useRef(null);
  const [cameraUrl, setCameraUrl] = useState('http://192.168.43.164:8001/stream.mjpg');
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
      });
      mqttClient.on('message', (topic, payload) => {
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
    }, 200), // Adjust the throttle interval as needed
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
    }, 200), // Adjust the throttle interval as needed
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

  return (
    <div>
      {loggedIn ? (
        <div id="robot-control" className="block" style={{ height: '100%', display: 'flex' }}>
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
                  stickColor="#c7135b"
                  stickWidth={20}
                  borderWidth={2}
                  move={(e) => throttledHandleJoystickMove(e.direction, `robot/head/${e.direction.toLowerCase()}`)}
                  stop={() => handleStop('robot/head')}
                  position={headJoystickPosition}
                />
              </div>
            </div>
          </div>
          <div className="video-container" style={{ flex: '3', height: '100%', border: '1px solid #ccc', padding: '16px', marginLeft: '16px' }}>
            <h1 style={{ textAlign: 'center', fontSize: '1.5em' }}>Diffusion en direct</h1>
            <div style={{ width: '100%', height: 'calc(100% - 32px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={cameraUrl} alt="Live Stream" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </div>
          </div>
        </div>
      ) : (
        <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: '300px', margin: '0 auto', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <Form.Item name="username" label="Nom d'utilisateur" rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Connexion</Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default AppLogin;
