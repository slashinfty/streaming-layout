import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import OBSWebSocket from 'obs-websocket-js';
import { Store } from "tauri-plugin-store-api";
import Stopwatch from 'notatimer';
import Mousetrap from 'mousetrap';

const obs = new OBSWebSocket();
let timer = new Stopwatch({
    callback: obj => {
        const [hr, min, sec, ms] = obj.times;
        const hrFormatted = hr > 0 ? `${hr}:` : '';
        const minFormatted = hr > 0 && min < 10 ? `0${min}:` : `${min}:`;
        const secFormatted = sec < 10 ? `0${sec}.` : `${sec}.`;
        const msFormatted = ms.toString().charAt(0);
        (<HTMLElement>document.getElementById('timer')).innerText = `${hrFormatted}${minFormatted}${secFormatted}${msFormatted}`;
    }
});
const store = new Store('.settings.dat');

Mousetrap.bind('f1', () => timer.start());
Mousetrap.bind('f5', () => timer.pause());
Mousetrap.bind('f9', () => timer.reset());

const widths = {
    "10-9": 733,
    "8-7": 754,
    "4-3": 880,
    "3-2": 990,
    "16-9": 1013
}

document.getElementById('aspect-ratio').addEventListener('change', aspectRatio);
document.getElementById('timer-toggle').addEventListener('click', timerToggle);
document.getElementById('timer-close').addEventListener('click', timerToggle);
document.getElementById('chat-toggle').addEventListener('click', chatToggle);
document.getElementById('chat-close').addEventListener('click', chatToggle);
document.getElementById('clear-chat').addEventListener('click', () => (<HTMLInputElement>document.getElementById('chat')).value = '');
document.getElementById('set-pb').addEventListener('click', setPB);
document.getElementById('obs-ws-connect').addEventListener('click', obsConnect);
document.getElementById('timer-start').addEventListener('click', () => timer.start());
document.getElementById('timer-pause').addEventListener('click', () => timer.pause());
document.getElementById('timer-reset').addEventListener('click', () => timer.reset());
document.getElementById('twitch-connect').addEventListener('click', twitchConnect);

async function aspectRatio() {
    const ar = (<HTMLInputElement>document.getElementById('aspect-ratio')).value;
    const width = widths[ar];
    const feedWidth = width + 16;
    document.getElementById('feed-window').style.width = `${feedWidth}px`;
    const feedLeft = 1258 - feedWidth;
    document.getElementById('feed-window').style.left = `${feedLeft}px`;
    document.getElementById('feed').style.height = ar === '16-9' ? `570px` : `660px`;
    const maxWidth = feedLeft - 16;
    (<HTMLElement[]>[...document.getElementsByClassName('left')]).forEach(el => el.style.maxWidth = `${maxWidth}px`);
    await obs.call('SetCurrentPreviewScene', { 'sceneName': ar });
    await obs.call('TriggerStudioModeTransition');
}

function timerToggle() {
    const timerWindow = document.getElementById('timer-window');
    const chatWindow = document.getElementById('chat-window');
    if (timerWindow.style.display === 'none') {
        timerWindow.style.display = 'block';
        chatWindow.style.top = '145px';
    } else {
        timerWindow.style.display = 'none';
        chatWindow.style.top = '0px';
    }
}

function chatToggle() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow.style.display === 'none') {
        chatWindow.style.display = 'block';
    } else {
        chatWindow.style.display = 'none';
    }
}

async function setPB() {
    const pb = (<HTMLInputElement>document.getElementById('pb-input')).value;
    document.getElementById('pb').innerText = pb;
    await store.set('pb', pb);
    await store.save();
}

async function obsConnect() {
    const addr = (<HTMLInputElement>document.getElementById('obs-ws-input')).value;
    try {
        await obs.connect(`ws://${addr}:4455`);
        await store.set('obs', addr);
        await store.save();
        const ar = (<HTMLInputElement>document.getElementById('aspect-ratio')).value;
        await obs.call('SetCurrentProgramScene', { 'sceneName': ar });
        await obs.call('SetStudioModeEnabled', { 'studioModeEnabled': true });
        await obs.call('SetCurrentPreviewScene', { 'sceneName': ar });
    } catch (error) {
        console.error(error);
        (<HTMLInputElement>document.getElementById('obs-ws-input')).value = '';
        return;
    }
}

async function twitchConnect() {
    try {
        const clientID = (<HTMLInputElement>document.getElementById('twitch-client-id')).value;
        const accessToken = (<HTMLInputElement>document.getElementById('twitch-access-token')).value;
        const authProvider = new StaticAuthProvider(clientID, accessToken);
        const chat = new ChatClient({
            authProvider: authProvider,
            channels: ['slashinfty']
        });
        await store.set('client-id', clientID);
        await store.set('access-token', accessToken);
        await store.save();
        await chat.connect();
        const chatTextArea = <HTMLInputElement>document.getElementById('chat');
        chat.onConnect(() => {
            chatTextArea.value = 'Connected to Twitch chat!';
        });
        chat.onMessage((_channel, user, text) => {
            chatTextArea.value = `${(<HTMLInputElement>document.getElementById('chat')).value}\n${user}: ${text}`;
            chatTextArea.scrollTop = chatTextArea.scrollHeight;
        });
    } catch (error) {
        console.error(error);
        return;
    }
}

(async function() {
    aspectRatio();
    const pb: string = await store.get('pb');
    if (pb !== null) {
        document.getElementById('pb').innerText = pb;
    }
    const obs: string = await store.get('obs');
    if (obs !== null) {
        (<HTMLInputElement>document.getElementById('obs-ws-input')).value = obs;
    }
    const clientID: string = await store.get('client-id');
    if (clientID !== null) {
        (<HTMLInputElement>document.getElementById('twitch-client-id')).value = clientID;
    }
    const accessToken: string = await store.get('access-token');
    if (accessToken !== null) {
        (<HTMLInputElement>document.getElementById('twitch-access-token')).value = accessToken;
    }
})();