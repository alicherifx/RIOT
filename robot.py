import paho.mqtt.client as mqtt
from picarx import Picarx
from time import sleep

# Define movement speeds
FORWARD_SPEED = 80
TURN_SPEED = 50

# Define topics for commands
TOPIC_FORWARD = "robot/forward"
TOPIC_BACKWARD = "robot/backward"
TOPIC_LEFT = "robot/left"
TOPIC_RIGHT = "robot/right"

# Initialize Picar-X object
px = Picarx()

# Define callback function for received messages
def on_message(client, userdata, msg):
    global px

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

def main():
    # Connect to MQTT broker
    client = mqtt.Client()
    client.on_message = on_message
    client.connect("test.mosquitto.org")
    client.subscribe(TOPIC_FORWARD)
    client.subscribe(TOPIC_BACKWARD)
    client.subscribe(TOPIC_LEFT)
    client.subscribe(TOPIC_RIGHT)

    # Start the MQTT loop
    client.loop_start()

    try:
        while True:
            # No keyboard input needed here, commands come from MQTT
            sleep(0.1)
    except KeyboardInterrupt:
        print("\n Quit")

    finally:
        # Stop robot and clean up
        client.loop_stop()
        client.disconnect()
        px.set_dir_servo_angle(0)
        px.stop()
        sleep(0.2)

if __name__ == "__main__":
    main()

