const Chat = require('./chat');

function render(m_id, messages, document){
    const viewBox = document.querySelector('#viewBox');

    // 뷰 박스 초기화.
    while(viewBox.firstChild){
        viewBox.removeChild(viewBox.firstChild);
    }

    // 메시지 렌더링.
    messages.forEach(data => {
        const messageBox = document.createElement('div');
        messageBox.className = 'messageBox';

        if(! data.issued && data.infoType === Chat.infoType.alaram){
            // 다른 유저의 출입 알림.
            // issued가 참인 경우는 새로운 클라이언트가 접속했을 때, clients 배열이 아닌 서버가 접속한 소켓을 통해 전달하기 때문에 당사자에게만 온다.
            // 퇴장 시 알림은 clients 배열에서 당사자를 먼저 삭제 후 전송.
            // 그래서 issued가 거짓이고, infoType이 alaram인 경우는 무조건 다른 유저의 출입 알림.
            const serverAlarm = document.createElement('div');
            serverAlarm.className = 'serverAlaram';
            serverAlarm.classList.add('align-center');
            serverAlarm.innerText = data.message;

            messageBox.appendChild(serverAlarm);
        }else{
            const profile = document.createElement('div');
            profile.className = 'profile';
            profile.innerText = data.id;

            const message = document.createElement('div');
            message.className = 'message';
            message.innerText = data.message;

            // 클래스 정렬 정리.
            if(m_id === data.id){
                messageBox.appendChild(message);
                messageBox.appendChild(profile);
            }else{
                messageBox.appendChild(profile);
                messageBox.appendChild(message);
            }
        }

        viewBox.appendChild(messageBox);
    });
}

module.exports = { render };