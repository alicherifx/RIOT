import io
import picamera
import logging
import socket
import socketserver
from threading import Condition, Thread
from http import server
import paho.mqtt.client as mqtt
from picarx import Picarx
from time import sleep

PAGE="""\
<html>
<head>
<title>Raspberry Pi - Surveillance Camera</title>
</head>
<body>
<center><h1>Raspberry Pi - Surveillance Camera</h1></center>
<center><img src="stream.mjpg" width="640" height="480"></center>
</body>
</html>
"""

# Define movement speeds
FORWARD_SPEED = 80
TURN_SPEED = 50

# Define topics for commands
TOPIC_FORWARD = "robot/forward"
TOPIC_BACKWARD = "robot/backward"
TOPIC_LEFT = "robot/left"
TOPIC_RIGHT = "robot/right"
TOPIC_HEAD_FORWARD = "robot/head/up"
TOPIC_HEAD_BACKWARD = "robot/head/down"
TOPIC_HEAD_LEFT = "robot/head/left"
TOPIC_HEAD_RIGHT = "robot/head/right"

# Initialize Picar-X object
px = Picarx()

# Initialize camera angles
tilt_angle = 0
pan_angle = 0

# MQTT Callback function
def on_message(client, userdata, msg):
    global px, tilt_angle, pan_angle

    # Check the topic and execute the corresponding command
    if msg.topic == TOPIC_FORWARD:
        if msg.payload.decode() == "1":
            px.set_dir_servo_angle(0)
            px.forward(FORWARD_SPEED)
        else:
            px.stop()
    elif msg.topic == TOPIC_BACKWARD:
        if msg.payload.decode() == "1":
            px.set_dir_servo_angle(0)
            px.backward(FORWARD_SPEED)
        else:
            px.stop()
    elif msg.topic == TOPIC_LEFT:
        if msg.payload.decode() == "1":
            px.set_dir_servo_angle(-30)
            px.forward(TURN_SPEED)
        else:
            px.stop()
    elif msg.topic == TOPIC_RIGHT:
        if msg.payload.decode() == "1":
            px.set_dir_servo_angle(30)
            px.forward(TURN_SPEED)
        else:
            px.stop()
    elif msg.topic == TOPIC_HEAD_FORWARD:
        tilt_angle += 5
        if tilt_angle > 30:
            tilt_angle = 30
    elif msg.topic == TOPIC_HEAD_BACKWARD:
        tilt_angle -= 5
        if tilt_angle < -30:
            tilt_angle = -30
    elif msg.topic == TOPIC_HEAD_LEFT:
        pan_angle += 5
        if pan_angle > 30:
            pan_angle = 30
    elif msg.topic == TOPIC_HEAD_RIGHT:
        pan_angle -= 5
        if pan_angle < -30:
            pan_angle = -30

    # Set camera angles
    px.set_cam_tilt_angle(tilt_angle)
    px.set_cam_pan_angle(pan_angle)

# MQTT Thread function
def mqtt_thread():
    # Connect to MQTT broker
    client = mqtt.Client()
    client.on_message = on_message
    client.connect("test.mosquitto.org")
    client.subscribe(TOPIC_FORWARD)
    client.subscribe(TOPIC_BACKWARD)
    client.subscribe(TOPIC_LEFT)
    client.subscribe(TOPIC_RIGHT)
    client.subscribe(TOPIC_HEAD_FORWARD)
    client.subscribe(TOPIC_HEAD_BACKWARD)
    client.subscribe(TOPIC_HEAD_LEFT)
    client.subscribe(TOPIC_HEAD_RIGHT)

    # Start the MQTT loop
    client.loop_forever()

# Camera streaming code
class StreamingOutput(object):
    def __init__(self):
        self.frame = None
        self.buffer = io.BytesIO()
        self.condition = Condition()

    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/': 
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()


class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

# Start threads
if __name__ == '__main__':
    output = StreamingOutput()
    mqtt_thread = Thread(target=mqtt_thread)
    mqtt_thread.start()

    with picamera.PiCamera(resolution='640x480', framerate=24) as camera:
        camera.start_recording(output, format='mjpeg')
        try:
            address = ('', 8001)  # Using the local IP address
            server = StreamingServer(address, StreamingHandler)
            server.serve_forever()
        finally:
            camera.stop_recording()
