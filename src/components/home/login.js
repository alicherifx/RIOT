import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button } from 'antd';
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';

function AppLogin({ loggedIn, onLogin }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [form] = Form.useForm();

  const toggleCamera = () => {
    if (stream) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraOn(false);
    }
  };

  const onFinish = (values) => {
    onLogin(values);
  };

  useEffect(() => {
    if (loggedIn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loggedIn]);

  return (
    <div>
      {loggedIn ? (
        <div id="robot-control" className="block" style={{ height: '100%', display: 'flex' }}>
          <div className="control-container" style={{ flex: '2', display: 'flex', flexDirection: 'column', border: '1px solid #ccc', padding: '16px' }}>
            <div className="control-section" style={{ borderBottom: '1px solid #ccc', marginBottom: '16px', paddingBottom: '16px', flex: '2' }}>
              <h1 style={{ textAlign: 'center', fontSize: '1.5em', marginBottom: '16px' }}>Control des mouvements</h1>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Button type="primary" icon={<CaretUpOutlined />} style={{ width: '100px', marginRight: '8px', background: 'blue' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Button type="primary" icon={<CaretLeftOutlined />} style={{ width: '100px', marginRight: '4px', background: 'blue' }} />
                <Button type="primary" style={{ width: '100px', background: 'blue' }}>Stop</Button>
                <Button type="primary" icon={<CaretRightOutlined />} style={{ width: '100px', marginLeft: '4px', background: 'blue' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" icon={<CaretDownOutlined />} style={{ width: '100px', marginTop: '8px', background: 'blue' }} />
              </div>
            </div>
            <div className="control-section" style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ textAlign: 'center', fontSize: '1.5em', marginBottom: '16px' }}>Control de la tête du robot</h1>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Button type="primary" icon={<CaretUpOutlined />} style={{ width: '100px', marginRight: '8px', background: 'red' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Button type="primary" icon={<CaretLeftOutlined />} style={{ width: '100px', marginRight: '4px', background: 'red' }} />
                <Button type="primary" style={{ width: '100px', background: 'red' }}>Stop</Button>
                <Button type="primary" icon={<CaretRightOutlined />} style={{ width: '100px', marginLeft: '4px', background: 'red' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="primary" icon={<CaretDownOutlined />} style={{ width: '100px', marginTop: '8px', background: 'red' }} />
              </div>
            </div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="primary" style={{ width: '150px', marginBottom: '16px' }}>Mode Manuel</Button>
              <Button type="primary" style={{ width: '150px', marginBottom: '16px' }}>Mode Automatique</Button>
              <Button type="primary" onClick={toggleCamera} style={{ width: '150px' }}>
                {cameraOn ? 'Désactiver Caméra' : 'Activer Caméra'}
              </Button>
            </div>
          </div>
          <div className="video-container" style={{ flex: '3', height: '100%', border: '1px solid #ccc', padding: '16px', marginLeft: '16px' }}>
            <h1 style={{ textAlign: 'center', fontSize: '1.5em' }}>Diffusion en direct</h1>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
              <video autoPlay playsInline style={{ width: '100%', height: '100%' }} ref={videoRef} />
            </div>
          </div>
        </div>
      ) : (
        <div id="login" className="block loginBlock">
          <div className="container-fluid">
            <div className="titleHolder">
              <h2>Connexion</h2>
            </div>
            <Form
              form={form}
              name="normal_login"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur!' }]}
              >
                <Input placeholder="Nom d'utilisateur" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
              >
                <Input.Password placeholder="Mot de passe" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Connexion
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLogin;
