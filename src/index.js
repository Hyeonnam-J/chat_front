const net = require('net');

// 서버 정보
const PORT = 3000;
const HOST = '127.0.0.1';

const client = new net.Socket();

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

// 앱을 실행하면 바로 연결. 로그인 기능 생략.
client.connect(PORT, HOST, () => {
    let isFirst = true;
    let m_id = "-1";

    client.write('들어가겠습니다~');

    // 전송 버튼을 누르면 아이디와 메시지를 보낸다.
    sendButton.addEventListener('click', () => {
        client.write(`${m_id}/${inputContent.value}`);
        inputContent.value = "";
    });

    client.on('data', (data) => {
        // 계속 isFirst를 체크하지 말고 다른 방법을...
        if(isFirst){
            m_id = data.toString();
            isFirst = false;
            console.log('id 발급', m_id);
        }else{
            console.log('서버가 보낸 말', data.toString());
            // todo
            // 다른 유저가 보낸 데이터를 받아 화면에 그리는 로직
        }
    });
    
    client.on('close', () => {
        console.log('서버와의 연결이 끊겼습니다');
    });
});