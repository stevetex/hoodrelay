import logging
import os
 
from flask import Flask
from flask_ask import Ask, request, session, question, statement
import requests
 
app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger('flask_ask').setLevel(logging.DEBUG)
 
STATUSON = ["on", "switch on", "enable", "power on", "activate", "turn on"] # all values that are defined as synonyms in type
STATUSOFF = ["off", "switch off", "disable", "power off", "deactivate", "turn off"]
 
@ask.launch
def launch():
    speech_text = 'Welcome to the Hood Pi alexa automation.'
    return question(speech_text).reprompt(speech_text).simple_card(speech_text)
 
@ask.intent('LightIntent', mapping = {'status':'status'})
def HoodLight_Intent(status,room):
    err = True
    if status in STATUSON:
        response = requests.get("http://hoodpi:8081/light?value=on")
        if response.status_code == 200:
            err = False
            return statement("Hood light turned on")
    elif status in STATUSOFF:
        response = requests.get("http://hoodpi:8081/light?value=off")
        if response.status_code == 200:
            err = False
            return statement("Hood light turned off")
    if err:
        return statement('Sorry, Hood Pi just cannot with this.')
 
@ask.intent('AMAZON.HelpIntent')
def help():
    speech_text = 'You can say hello to me!'
    return question(speech_text).reprompt(speech_text).simple_card('HelloWorld', speech_text)
 
 
@ask.session_ended
def session_ended():
    return "{}", 200
 
 
if __name__ == '__main__':
    if 'ASK_VERIFY_REQUESTS' in os.environ:
        verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
        if verify == 'false':
            app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)