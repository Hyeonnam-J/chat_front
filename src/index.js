'use strict';

const net = require('net');
const Chat = require('./js/chat');
const { render } = require('./js/render');

let host, port;

/* 서버 정보 입력 ▼ */
const connectionContainer = document.getElementById('connection-container');
const inputHost = document.getElementById('inputHost');
const inputPort = document.getElementById('inputPort');
const selectServerButton = document.getElementById('selectServerButton');

const alarmInputHost = document.getElementById('alarm-inputHost');
const alarmInputPort = document.getElementById('alarm-inputPort');
let isHostValid, isPortValid = false;

const nickContainer = document.getElementById('nick-container');

// ip, domain regex.
const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

// 유효성 검사.
function validateInputHostInfo(){
    const _host = inputHost.value;

    if(_host === ''){
        invalidAlarm(alarmInputHost, '호스트 정보를 입력하세요.');
        isHostValid = false;
        return ;
    }else if(_host.includes(' ')){
        invalidAlarm(alarmInputHost, '공백을 포함할 수 없습니다.');
        isHostValid = false;
        return ;
    }

    if(! ipRegex.test(_host) && ! domainRegex.test(_host)){
        invalidAlarm(alarmInputHost, '올바르지 못한 호스트 정보입니다.');
        isHostValid = false;
        return ;
    }
    
    alarmInputHost.textContent = '올바른 정보.';
    alarmInputHost.style.color = 'green';
    isHostValid = true;
}

function validateInputPortInfo(){
    const _port = inputPort.value;

    if(isNaN(parseInt(_port))){
        invalidAlarm(alarmInputPort, '문자열은 입력할 수 없습니다.');
        isPortValid = false;
        return ;
    }else if(_port.toString().trim() === ''){
        invalidAlarm(alarmInputPort, '포트 정보를 입력하세요.');
        isPortValid = false;
        return ;
    }else if(_port.toString().includes(' ')){
        invalidAlarm(alarmInputPort, '공백을 포함할 수 없습니다.');
        isPortValid = false;
        return ;
    }

    alarmInputPort.textContent = '올바른 정보.';
    alarmInputPort.style.color = 'green';
    isPortValid = true;
}

function invalidAlarm(element, message){
    element.textContent = message;
    element.style.color = 'red';
}

inputHost.addEventListener('input', validateInputHostInfo);
inputPort.addEventListener('input', validateInputPortInfo);

// 입력.
selectServerButton.addEventListener('click', () => {
    connectServer();
});
inputHost.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        connectServer();
    }
})
inputPort.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        connectServer();
    }
})

function connectServer(){
    if(! isHostValid || ! isPortValid) return ;

    const _host = inputHost.value;
    const _port = inputPort.value;

    host = _host;
    port = _port;
    
    connectionContainer.style.display = 'none';
    nickContainer.style.display = 'block';
}
/* 서버 정보 입력 ▲ */

/* 닉네임 입력 ▼ */
let nick = '없음';

const chatContainer = document.getElementById('chat-container');
const inputNick = document.getElementById('inputNick');
const submitNickButton = document.getElementById('submitNickButton');

submitNickButton.addEventListener('click', () => {
    enterNick();
});
inputNick.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        enterNick();
    }
});

function enterNick() {
    nick = inputNick.value;
    if (nick.length > 4) {
        nick = nick.substring(0, 3) + '..';
    };

    nickContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    
    startConnect();
}
/* 닉네임 입력 ▲ */

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// DB 저장 용도?
const messages = [];

function startConnect() {
    // 앱을 실행하면 바로 연결. 로그인 기능 생략.
    client.connect(port, host, () => {
        let id = -1;

        client.on('data', (data) => {
            const json_data = data.toString();
            const obj_data = JSON.parse(json_data);

            // 계속 체크를 해야 하니 다른 방법이..
            if (obj_data.issued) {
                // 나 입장 시, 메시지 목록에 추가하지 않고, 아이디 발급 로직.
                // 서버가 접속한 소켓에게만 단독으로 보낸 메시지.
                id = obj_data.id;
                console.log(`${nick}님, id가 발급되었습니다: `, id, ' / ', obj_data.message);

                // 다른 유저에게 입장을 알려야하므로 서버에게 닉을 전달. issued 참값으로.
                const obj_entranceAlarm = new Chat(id, nick, null, Chat.INFO_TYPE.alarm, true);
                const json_entranceAlarm = JSON.stringify(obj_entranceAlarm);
                client.write(json_entranceAlarm);
            } else {
                // 그 외의 경우는 모두 메시지 목록에 저장.
                addMessageList(id, obj_data);
            }

            console.log('메시지 수: ', messages.length);
        });

        // message 전송.
        sendButton.addEventListener('click', () => { sendMessage(id); });
        inputContent.addEventListener('keydown', e => {
            // Enter + shift = 개행.
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(id);
            }
        })

        client.on('close', () => {
            console.log('서버와의 연결이 끊겼습니다');

            const disconnectAlarm = new Chat(id, nick, '서버와의 연결이 끊겼습니다 !', Chat.INFO_TYPE.alarm, false);
            addMessageList(id, disconnectAlarm);
            console.log('메시지 수: ', messages.length);
        });
    });
}

function sendMessage(id) {
    if (inputContent.value.length === 0) return;

    const obj_chat = new Chat(id, nick, inputContent.value, Chat.INFO_TYPE.message, false);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";
}

function addMessageList(id, data) {
    messages.push(data);
    render(id, data, document);
}