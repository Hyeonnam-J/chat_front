'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,

        // 페이지가 표시되기 전 전처리
        // _dirname: 현재 실행 중인 스크립트의 경로
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            
            // Renderer에서 require 사용 가능
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    
    win.loadFile(path.join(__dirname, 'index.html'));

    // 개발 중 개발자 모드 활성화
    win.webContents.openDevTools();
}

// 앱 준비 후 실행할 스크립트
app.whenReady().then( () => {
    createWindow();

    // 맥 OS에서 앱 활성화될 때, 창이 없는 경우 새로운 창을 만드는 코드
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// 맥 OS에서는 모든 창이 닫혀도 종료가 되지 않음.
// 맥 OS에서 일관된 사용자 경험을 위함.
app.on('window-all-closed', () => {

    // 맥 OS가 아니면 종료.
    if(process.platform !== 'darwin') app.quit();
});