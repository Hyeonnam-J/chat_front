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

    // 전송 버튼을 누르면 아이디와 메시지를 보낸다.
    sendButton.addEventListener('click', () => {
        const obj_chat = new Chat(m_id, inputContent.value, false);
        const json_chat = JSON.stringify(obj_chat);
        client.write(json_chat);
        inputContent.value = "";

        console.log('보내는 데이터: ', json_chat);
    });

    client.on('data', (data) => {
        const json_data = data.toString();
        const obj_data = JSON.parse(json_data);

        // 다른 방법이...
        if(obj_data.entrance){
            m_id = obj_data.id;
            console.log('id가 발급되었습니다: ', m_id);
            console.log('서버로부터 환영인사: ', obj_data.message);
        }else{
            // todo
            // 다른 유저가 보낸 데이터를 받아 화면에 그리는 로직
        }
    });
    
    client.on('close', () => {
        console.log('서버와의 연결이 끊겼습니다');
    });
});