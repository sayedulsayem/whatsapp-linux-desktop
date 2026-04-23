/**
 * Preload script for Call Window
 * Provides secure IPC communication
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('callAPI', {
	// Send events to main process
	muteToggled: (state) => ipcRenderer.send('mute-toggled', state),
	cameraToggled: (state) => ipcRenderer.send('camera-toggled', state),
	speakerToggled: (state) => ipcRenderer.send('speaker-toggled', state),
	endCall: () => ipcRenderer.send('end-call-requested'),
	
	// Listen for events from main process
	onIncomingCall: (callback) => ipcRenderer.on('incoming-call-window', (event, data) => callback(data)),
	onCallEnded: (callback) => ipcRenderer.on('call-window-ended', callback),
	onCallStatusUpdate: (callback) => ipcRenderer.on('call-status-update', (event, data) => callback(data))
});
