/**
 * Call Window Manager
 * Manages the native call window UI similar to Windows WhatsApp
 */

const { BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let callWindow = null;
let mainWindow = null;

function createCallWindow(mainWindowRef) {
	mainWindow = mainWindowRef;
	
	if (callWindow) {
		callWindow.focus();
		return;
	}

	// Get the primary display dimensions
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	callWindow = new BrowserWindow({
		width: 400,
		height: 600,
		x: width - 420,
		y: height - 650,
		frame: true,
		resizable: true,
		alwaysOnTop: true,
		webPreferences: {
			preload: path.join(__dirname, 'call-window-preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false
		}
	});

	// Load the call interface
	const callHTML = path.join(__dirname, 'call-window.html');
	callWindow.loadFile(callHTML).catch(() => {
		// Fallback: create HTML dynamically
		callWindow.loadURL(`data:text/html,${encodeURIComponent(getCallWindowHTML())}`);
	});

	callWindow.on('closed', () => {
		callWindow = null;
		if (mainWindow) {
			mainWindow.webContents.send('call-window-closed');
		}
	});

	// Developer tools (optional)
	// callWindow.webContents.openDevTools();

	return callWindow;
}

function closeCallWindow() {
	if (callWindow) {
		callWindow.close();
		callWindow = null;
	}
}

function sendToCallWindow(channel, data) {
	if (callWindow && !callWindow.isDestroyed()) {
		callWindow.webContents.send(channel, data);
	}
}

function getCallWindowHTML() {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>WhatsApp Call</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
		}

		.call-container {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}

		.call-header {
			text-align: center;
			margin-bottom: 30px;
		}

		.contact-avatar {
			width: 100px;
			height: 100px;
			border-radius: 50%;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto 20px;
			font-size: 48px;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		}

		.contact-name {
			font-size: 24px;
			font-weight: 600;
			margin-bottom: 10px;
		}

		.call-status {
			font-size: 14px;
			color: #aaa;
			margin-bottom: 10px;
		}

		.call-timer {
			font-size: 18px;
			font-weight: 500;
			color: #25d366;
			font-family: 'Courier New', monospace;
		}

		.call-type-indicator {
			margin-top: 15px;
			font-size: 12px;
			color: #888;
			text-transform: uppercase;
			letter-spacing: 1px;
		}

		.call-controls {
			margin-top: auto;
			margin-bottom: 20px;
			display: flex;
			gap: 20px;
			justify-content: center;
			flex-wrap: wrap;
		}

		.control-btn {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			border: none;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24px;
			transition: all 0.3s ease;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}

		.control-btn:hover {
			transform: scale(1.1);
			box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		}

		.control-btn:active {
			transform: scale(0.95);
		}

		.btn-mute {
			background: #404854;
			color: white;
		}

		.btn-mute.active {
			background: #e74c3c;
		}

		.btn-camera {
			background: #404854;
			color: white;
		}

		.btn-camera.active {
			background: #e74c3c;
		}

		.btn-speaker {
			background: #404854;
			color: white;
		}

		.btn-speaker.active {
			background: #3498db;
		}

		.btn-end-call {
			background: #e74c3c;
			color: white;
			width: 70px;
			height: 70px;
			font-size: 28px;
		}

		.btn-end-call:hover {
			background: #c0392b;
		}

		.video-preview {
			width: 100%;
			height: 200px;
			background: #000;
			border-radius: 10px;
			margin-bottom: 20px;
			display: none;
			align-items: center;
			justify-content: center;
			color: #666;
			font-size: 14px;
		}

		.video-preview.active {
			display: flex;
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		}

		.tooltip {
			font-size: 11px;
			text-align: center;
			margin-top: 8px;
			color: #888;
			min-height: 14px;
		}

		.control-group {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		@keyframes pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.5; }
		}

		.ringing {
			animation: pulse 1s infinite;
		}
	</style>
</head>
<body>
	<div class="call-container">
		<div class="video-preview" id="videoPreview">
			📹 Video Call (Camera Off)
		</div>

		<div class="call-header">
			<div class="contact-avatar" id="contactAvatar">👤</div>
			<div class="contact-name" id="contactName">Contact Name</div>
			<div class="call-status" id="callStatus">Connecting...</div>
			<div class="call-timer" id="callTimer">00:00</div>
			<div class="call-type-indicator" id="callType">VOICE CALL</div>
		</div>

		<div class="call-controls">
			<div class="control-group">
				<button class="control-btn btn-mute" id="muteBtn" title="Mute/Unmute (Alt+M)">🔊</button>
				<div class="tooltip">Mute</div>
			</div>

			<div class="control-group">
				<button class="control-btn btn-camera" id="cameraBtn" title="Toggle Camera (Alt+C)">📷</button>
				<div class="tooltip">Camera</div>
			</div>

			<div class="control-group">
				<button class="control-btn btn-speaker" id="speakerBtn" title="Speaker">🔔</button>
				<div class="tooltip">Speaker</div>
			</div>

			<div class="control-group">
				<button class="control-btn btn-end-call" id="endCallBtn" title="End Call (Esc)">📵</button>
				<div class="tooltip">End Call</div>
			</div>
		</div>
	</div>

	<script>
		const { ipcRenderer } = require('electron');

		let callDuration = 0;
		let timerInterval = null;
		let isMuted = false;
		let isCameraOn = false;
		let isSpeakerOn = true;

		// Initialize call
		function initCall(callData = {}) {
			const { contactName = 'Unknown Contact', isVideo = false, avatar = '👤' } = callData;
			
			document.getElementById('contactName').textContent = contactName;
			document.getElementById('contactAvatar').textContent = avatar;
			document.getElementById('callStatus').textContent = 'Connected';
			document.getElementById('callType').textContent = isVideo ? 'VIDEO CALL' : 'VOICE CALL';

			if (isVideo) {
				document.getElementById('videoPreview').classList.add('active');
			}

			startTimer();
		}

		// Start timer
		function startTimer() {
			clearInterval(timerInterval);
			callDuration = 0;
			timerInterval = setInterval(() => {
				callDuration++;
				const minutes = Math.floor(callDuration / 60);
				const seconds = callDuration % 60;
				const formatted = \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
				document.getElementById('callTimer').textContent = formatted;
			}, 1000);
		}

		// Mute button
		document.getElementById('muteBtn').addEventListener('click', () => {
			isMuted = !isMuted;
			const btn = document.getElementById('muteBtn');
			btn.textContent = isMuted ? '🔇' : '🔊';
			btn.classList.toggle('active');
			ipcRenderer.send('mute-toggled', isMuted);
		});

		// Camera button
		document.getElementById('cameraBtn').addEventListener('click', () => {
			isCameraOn = !isCameraOn;
			const btn = document.getElementById('cameraBtn');
			btn.classList.toggle('active');
			document.getElementById('videoPreview').style.display = isCameraOn ? 'flex' : 'none';
			ipcRenderer.send('camera-toggled', isCameraOn);
		});

		// Speaker button
		document.getElementById('speakerBtn').addEventListener('click', () => {
			isSpeakerOn = !isSpeakerOn;
			const btn = document.getElementById('speakerBtn');
			btn.classList.toggle('active');
			ipcRenderer.send('speaker-toggled', isSpeakerOn);
		});

		// End call button
		document.getElementById('endCallBtn').addEventListener('click', () => {
			endCall();
		});

		// End call function
		function endCall() {
			clearInterval(timerInterval);
			ipcRenderer.send('end-call-requested');
		}

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				endCall();
			} else if (e.altKey && e.key.toLowerCase() === 'm') {
				document.getElementById('muteBtn').click();
			} else if (e.altKey && e.key.toLowerCase() === 'c') {
				document.getElementById('cameraBtn').click();
			}
		});

		// Listen for incoming call
		ipcRenderer.on('incoming-call-window', (event, callData) => {
			initCall(callData);
		});

		// Initialize with default data
		initCall();
	</script>
</body>
</html>
	`;
}

module.exports = {
	createCallWindow,
	closeCallWindow,
	sendToCallWindow,
	getCallWindow: () => callWindow
};
