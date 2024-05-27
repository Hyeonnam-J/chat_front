'use strict';

const net = require('net');
const Chat = require('./js/chat');
const { render } = require('./js/render');

// 서버 정보
const PORT = 3000;
const HOST = '127.0.0.1';

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

const messages = [];

// 앱을 실행하면 바로 연결. 로그인 기능 생략.
client.connect(PORT, HOST, () => {
    let m_id = "-1";

    client.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        if(obj_data.issued){
            // 나 입장 시, 메시지 목록에 추가하지 않고, 아이디 발급 로직.
            // 서버가 접속한 소켓에게만 단독으로 보낸 메시지.
            m_id = obj_data.id;
            console.log('id가 발급되었습니다: ', m_id, ' / ', obj_data.message);
        }else{
            // 그 외의 경우는 모두 메시지 목록에 저장.
            pushMessage(obj_data, m_id);
        }

        console.log('메시지 수: ', messages.length);
    });

    // message 전송.
    sendButton.addEventListener('click', () => { sendMessage(m_id); });
    inputContent.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage(m_id);
        }
    })

    client.on('close', () => {
        console.log('서버와의 연결이 끊겼습니다');

        const disconnectAlarm = new Chat(m_id, '서버와의 연결이 끊겼습니다 !', Chat.INFO_TYPE.alarm, false);
        pushMessage(disconnectAlarm, m_id);
        console.log('메시지 수: ', messages.length);
    });
});

function sendMessage(m_id) {
    if(inputContent.value.length === 0) return;

    const obj_chat = new Chat(m_id, inputContent.value, Chat.INFO_TYPE.message, false);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";
}

function pushMessage(data, m_id){
    messages.push(data);
    render(m_id, messages, document);
}