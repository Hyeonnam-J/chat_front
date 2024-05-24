const net = require('net');
const Chat = require('./js/chat');

// 서버 정보
const PORT = 3000;
const HOST = '127.0.0.1';

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// 앱을 실행하면 바로 연결. 로그인 기능 생략.
client.connect(PORT, HOST, () => {
    let m_id = "-1";

    client.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        // 다른 방법이...
        if (obj_data.infoType === Chat.infoType.alaram) {  // - 입장인 경우,
            // 입장 시 서버가 단독으로 보낸 메시지.
            if (obj_data.infoOrigin === Chat.infoOrigin.self) {
                m_id = obj_data.id;
                console.log('id가 발급되었습니다: ', m_id, ' / ', obj_data.message);
            } else {
                // 다른 유저의 입장 알림
                console.log(`${obj_data.id}님이 대화방에 입장하셨습니다 !`);
            }
        } else {  // - 입장이 아닌 경우는 채팅 메시지.
            // 내가 보낸 메시지
            if (obj_data.id === m_id) {
                console.log(`나, ${obj_data.id}: ${obj_data.message}`);
            } else {  // 남이 보낸 메시지
                console.log(`남, ${obj_data.id}: ${obj_data.message}`);
            }
        }
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
    });
});

function sendMessage(m_id) {
    const obj_chat = new Chat(m_id, inputContent.value, Chat.infoType.message, Chat.infoOrigin.self);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";
}