const net = require('net');

// 서버 정보
const PORT = 3000;
const HOST = '127.0.0.1';

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// 앱을 실행하면 바로 연결. 로그인 기능 생략.
client.connect(PORT, HOST, () => {
    client.write('들어가겠습니다~');

    sendButton.addEventListener('click', () => {
        client.write(inputContent.value);
        inputContent.value = "";
    });

    client.on('data', (data) => {
        console.log('서버가 보낸 말', data.toString());

        // todo
        // 다른 유저가 보낸 데이터를 받아 화면에 그리는 로직
    });
    
    client.on('close', () => {
        console.log('서버와의 연결이 끊겼습니다');
    });
});