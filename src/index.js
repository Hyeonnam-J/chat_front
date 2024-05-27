'use strict';

const net = require('net');
const Chat = require('./js/chat');
const { render } = require('./js/render');

// 서버 정보.
const PORT = 3000;
const HOST = '127.0.0.1';

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// DB 저장 용도?
const messages = [];

// 앱을 실행하면 바로 연결. 로그인 기능 생략.
client.connect(PORT, HOST, () => {
    let _id = -1;

    client.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        // 계속 체크를 해야 하니 다른 방법이..
        if(obj_data.issued){
            // 나 입장 시, 메시지 목록에 추가하지 않고, 아이디 발급 로직.
            // 서버가 접속한 소켓에게만 단독으로 보낸 메시지.
            _id = obj_data.id;
            console.log('id가 발급되었습니다: ', _id, ' / ', obj_data.message);
        }else{
            // 그 외의 경우는 모두 메시지 목록에 저장.
            pushMessage(_id, obj_data);
        }

        console.log('메시지 수: ', messages.length);
    });

    // message 전송.
    sendButton.addEventListener('click', () => { sendMessage(_id); });
    inputContent.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage(_id);
        }
    })

    client.on('close', () => {
        console.log('서버와의 연결이 끊겼습니다');

        const disconnectAlarm = new Chat(_id, '서버와의 연결이 끊겼습니다 !', Chat.INFO_TYPE.alarm, false);
        pushMessage(_id, disconnectAlarm);
        console.log('메시지 수: ', messages.length);
    });
});

function sendMessage(_id) {
    if(inputContent.value.length === 0) return;

    const obj_chat = new Chat(_id, inputContent.value, Chat.INFO_TYPE.message, false);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";
}

function pushMessage(_id, data){
    messages.push(data);
    render(_id, data, document);
}