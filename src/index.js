'use strict';

const net = require('net');
const Chat = require('./js/chat');
const { render } = require('./js/render');
const { Socket } = require('dgram');

let id = -1;
let clientHost, clientPort, serverHost, serverPort;

/* 서버 정보 입력 ▼ */
const connectionContainer = document.getElementById('connection-container');
const inputHost = document.getElementById('inputHost');
const inputPort = document.getElementById('inputPort');
const selectServerButton = document.getElementById('selectServerButton');

const alarmInputHost = document.getElementById('alarm-inputHost');
const alarmInputPort = document.getElementById('alarm-inputPort');
let isHostValid, isPortValid = false;

const nickContainer = document.getElementById('nick-container');

// regex.
const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
const numberRegex = /^[0-9]+$/;

// 유효성 검사.
function executeValidation(name){
    switch(name){
        case "host":
            const _host = inputHost.value;

            if(_host === ''){
                setValidation(alarmInputHost, '호스트 정보를 입력하세요.', 'host', false);
                isHostValid = false;
                return ;
            }else if(_host.includes(' ')){
                setValidation(alarmInputHost, '공백을 포함할 수 없습니다.', 'host', false);
                isHostValid = false;
                return ;
            }

            if(! ipRegex.test(_host) && ! domainRegex.test(_host)){
                setValidation(alarmInputHost, '올바르지 못한 호스트 정보입니다.', 'host', false);
                isHostValid = false;
                return ;
            }
            
            setValidation(alarmInputHost, '올바른 정보.', 'host', true);
            return ;
            
        case "port":
            const _port = inputPort.value;

            if(! numberRegex.test(_port)){
                setValidation(alarmInputPort, '문자열은 입력할 수 없습니다.', 'port', false);
                return ;
            }else if(_port.toString().trim() === ''){
                setValidation(alarmInputPort, '포트 정보를 입력하세요.', 'port', false);
                return ;
            }else if(_port.toString().includes(' ')){
                setValidation(alarmInputPort, '공백을 포함할 수 없습니다.', 'port', false);
                return ;
            }

            setValidation(alarmInputPort, '올바른 정보.', 'port', true);
            return ;
    }
}

function setValidation(element, message, input, isValid){
    element.textContent = message;

    if(isValid) element.style.color = 'green';
    else element.style.color = 'red';
    
    switch(input){
        case "host":
            if(isValid) isHostValid = true;
            else isHostValid = false;
        case "port":
            if(isValid) isPortValid = true;
            else isPortValid = false;
    }
}

inputHost.addEventListener('input', () => executeValidation('host'));
inputPort.addEventListener('input', () => executeValidation('port'));

// 입력.
selectServerButton.addEventListener('click', () => {
    enterServerInfo();
});
inputHost.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        enterServerInfo();
    }
})
inputPort.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        enterServerInfo();
    }
})

function enterServerInfo(){
    if(! isHostValid || ! isPortValid) return ;

    const _host = inputHost.value;
    const _port = inputPort.value;

    serverHost = _host;
    serverPort = _port;
    
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
    
    startConnection();
}
/* 닉네임 입력 ▲ */

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// DB 저장 용도?
const messages = [];

let client;

function startConnection() {
    console.log('startConnection..');
    client =  new net.Socket();

    // 앱을 실행하면 바로 연결. 로그인 기능 생략.
    client.connect(serverPort, serverHost, () => {
        // 연결되고 나서 내 아이디가 -1이면 서버로부터 아이디 발급 과정 진행.
        if(id === -1){
            const requestChat = new Chat(id, nick, '소켓 정보랑 아이디 주세요.', Chat.INFO_TYPE.requestClientSocketInfoWithId, serverPort, serverHost);
            client.write(JSON.stringify(requestChat));
        } else {
            const requestChat = new Chat(id, nick, '소켓 정보만 주세요.', Chat.INFO_TYPE.requestClientSocketInfo, serverPort, serverHost);
            client.write(JSON.stringify(requestChat));
        }

        client.on('data', (data) => {
            const json_data = data.toString();
            const obj_data = JSON.parse(json_data);

            console.log('서버로부터 받은 데이터: ', json_data);

            if (obj_data.infoType === Chat.INFO_TYPE.responseClientSocketInfoWithId) {
                // 나 입장 시, 메시지 목록에 추가하지 않고, 아이디 발급 로직.
                // 서버가 접속한 소켓에게만 단독으로 보낸 메시지.
                id = obj_data.id;
                console.log(`서버로부터 환영인사가 도착했습니다. ${obj_data.message} ${nick}님, id가 발급되었습니다: `, id);

                // 자신의 net 정보 저장.
                clientHost = obj_data.destinationHost;
                clientPort = obj_data.destinationPort;
                console.log('내 net 정보 저장, Host: ', clientHost, ' Port: ', clientPort);
            } else if(obj_data.infoType === Chat.INFO_TYPE.responseClientSocketInfo){
                // 자신의 net 정보 저장.
                clientHost = obj_data.destinationHost;
                clientPort = obj_data.destinationPort;
                console.log('내 net 정보 저장, Host: ', clientHost, ' Port: ', clientPort);
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
        });

        // close -> 소켓이 완전히 닫힐 때 발생.
        client.on('close', () => {
            console.log('서버와의 연결이 끊겼습니다');

            const disconnectAlarm = new Chat(id, nick, '서버와의 연결이 끊겼습니다 !', Chat.INFO_TYPE.inform, client.remotePort, client.remoteAddress);
            addMessageList(id, disconnectAlarm);
            console.log('메시지 수: ', messages.length);

            // 서버 재시작 알림용.
            const temp_server = net.createServer(Socket => {
                console.log('서버 연락 옴!');
                startConnection();

                // 서버에서 연락오면 역할이 끝난 임시 서버는 종료.
                temp_server.close();
            });

            temp_server.listen(clientPort, clientHost, () => {
                console.log(`서버 연락 대기 중... port: ${clientPort}, host: ${clientHost}`);
            });
        });
    });
}


function sendMessage(id) {
    if (inputContent.value.length === 0) return;

    const obj_chat = new Chat(id, nick, inputContent.value, Chat.INFO_TYPE.message, client.remotePort, client.remoteAddress);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";

    console.log('sendMessage: ', json_chat);
}

function addMessageList(id, data) {
    messages.push(data);
    render(id, data, document);
}

