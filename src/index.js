const net = require('net');
const Chat = require('./js/chat');

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
            messages.push(obj_data);

            // 화면에서 구현 후 삭제할 로직 ▽
            if(obj_data.infoType === Chat.infoType.alaram){
                // 다른 유저의 출입 알림.
                // 내가 입장 시엔 메시지가 나에게만 오고(issued), 내가 퇴장 시엔 clients 배열에서 삭제 후 전송되니까 infoType이 alaram인 경우는 무조건 다른 유저의 출입 알림.
                console.log(`${obj_data.message}`);
            }else{
                if(obj_data.id === m_id){
                    console.log(`나, ${obj_data.id}: ${obj_data.message}`);
                }else{
                    console.log(`남, ${obj_data.id}: ${obj_data.message}`);
                }
            }
            // 화면에서 구현 후 삭제할 로직 △
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

        const disconnectAlaram = new Chat(m_id, '서버와의 연결이 끊겼습니다 !', Chat.infoType.alaram, false);
        messages.push(disconnectAlaram);
        console.log('메시지 수: ', messages.length);
    });
});

function sendMessage(m_id) {
    if(inputContent.value.length === 0) return;

    const obj_chat = new Chat(m_id, inputContent.value, Chat.infoType.message, false);
    const json_chat = JSON.stringify(obj_chat);
    client.write(json_chat);
    inputContent.value = "";
}