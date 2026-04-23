// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, nativeImage, ipcMain, Notification, globalShortcut, Menu } = require( 'electron' );
const path = require( 'node:path' );
const contextMenu = require( 'electron-context-menu' );
const appIcon = nativeImage.createFromPath( path.join( __dirname, 'build/icon.png' ) );
const callWindowManager = require( './call-window.js' );

app.disableHardwareAcceleration();

let mainWindow;
let isInCall = false;
let callData = {};

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow( {
		width: 1200,
		height: 800,
		autoHideMenuBar: true,
		frame: true,
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true,
			nodeIntegrationInSubFrames: true,
			preload: path.join( __dirname, 'preload.js' ),
		},
		icon: appIcon,
	} );

	// and load the index.html of the app.
	mainWindow.loadURL( 'https://web.whatsapp.com', {
		userAgent: 'Mozilla/5.0 (X11; Linux x86_64; Wayland) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
	} );

	// Enable media permissions for calling
	mainWindow.webContents.session.setPermissionRequestHandler( ( webContents, permission, callback ) => {
		if ( permission === 'media' ) {
			callback( true );
		} else if ( permission === 'camera' || permission === 'microphone' ) {
			callback( true );
		} else {
			callback( false );
		}
	} );

	// Open the DevTools.
	mainWindow.on( 'closed', function () {
		mainWindow = null;
	} );

	mainWindow.webContents.once( 'did-finish-load', () => {
		// Check notification permission when the window is ready
		checkNotificationPermission();
		setupExternalLinkHandling();
		setupCallingShortcuts();
		sendNotification();
		injectCallingIntegration();
	} );

	if ( process.platform === 'darwin' ) {
		setupDockIcon();
	}
};

function setupExternalLinkHandling () {
	// Open external links in the default browser
	mainWindow.webContents.setWindowOpenHandler( ( { url } ) => {
		if ( isExternalLink( url ) ) {
			shell.openExternal( url );
			return { action: 'deny' };
		}
	} );
}

function isExternalLink ( url ) {
	// Check if the URL is from web.whatsapp.com or its subdomains
	const whatsappDomains = [ 'whatsapp.com', 'web.whatsapp.com', /* Add more if needed */ ];
	return !whatsappDomains.some( domain => url.includes( domain ) );
}

function checkNotificationPermission () {
	// For example, show a dialog to request permission
}

function sendNotification () {
	// Send an IPC message to show a notification
	mainWindow.webContents.send( 'show-notification', {
		title: 'WhatsApp Notification',
		body: 'WhatsApp notified you',
	} );
}

function setupDockIcon () {
	app.dock.setIcon( appIcon );
}

function setupCallingShortcuts () {
	try {
		// Register hotkey: Escape to end call
		globalShortcut.register( 'Escape', () => {
			if ( isInCall ) {
				mainWindow?.webContents.send( 'end-call' );
				isInCall = false;
			}
		} );

		// Register hotkey: Alt+M to toggle mute
		globalShortcut.register( 'Alt+m', () => {
			mainWindow?.webContents.send( 'toggle-mute' );
		} );

		// Register hotkey: Alt+C to toggle camera
		globalShortcut.register( 'Alt+c', () => {
			mainWindow?.webContents.send( 'toggle-camera' );
		} );
	} catch ( error ) {
		console.error( 'Failed to register shortcuts:', error );
	}
}

function injectCallingIntegration () {
	// Inject JavaScript to detect call events and enhance UI
	mainWindow?.webContents.executeJavaScript( `
		(function() {
			// Add CSS to make call buttons more visible
			const style = document.createElement( 'style' );
			style.innerHTML = \`
				/* Make call buttons more prominent */
				button[aria-label*="Call" i],
				button[data-testid*="call" i],
				span[aria-label*="Call" i],
				[data-tooltip*="call" i] {
					opacity: 1 !important;
					visibility: visible !important;
					display: block !important;
					pointer-events: auto !important;
				}
				
				/* Highlight call buttons */
				button[aria-label*="Call" i]:hover,
				button[data-testid*="call" i]:hover {
					filter: brightness(1.2);
				}
			\`;
			document.head.appendChild( style );
			
			// Create a debug function to find call buttons
			window.findCallButtons = function() {
				const selectors = [
					'[data-testid="call"]',
					'[data-testid="video-call"]', 
					'[aria-label*="Call" i]',
					'[aria-label*="Video" i]',
					'button[title*="Call" i]',
					'button[title*="Video" i]',
					'.call-button',
					'[data-tooltip*="call" i]',
					'[data-tooltip*="video" i]'
				];
				
				let found = [];
				selectors.forEach( selector => {
					const elements = document.querySelectorAll( selector );
					elements.forEach( el => {
						if ( el && el.offsetParent !== null ) {
							found.push( {
								selector: selector,
								element: el,
								label: el.getAttribute( 'aria-label' ) || el.title || el.textContent
							} );
						}
					} );
				} );
				
				return found;
			};
			
			// Log available call buttons
			console.log( '📞 WhatsApp Call Buttons Found:', window.findCallButtons() );
			
			// Monitor for new call buttons
			const observer = new MutationObserver( ( mutations ) => {
				mutations.forEach( mutation => {
					if ( mutation.type === 'childList' ) {
						// Check if new call-related elements were added
						const newCallButtons = [].filter.call( 
							mutation.addedNodes, 
							node => node.innerHTML && (
								node.innerHTML.includes( 'call' ) || 
								node.innerHTML.includes( 'Call' ) ||
								node.innerHTML.includes( 'video' ) ||
								node.innerHTML.includes( 'Video' )
							)
						);
						
						if ( newCallButtons.length > 0 ) {
							console.log( '📱 New call-related UI detected' );
						}
					}
				} );
			} );
			
			observer.observe( document.documentElement, {
				childList: true,
				subtree: true
			} );
			
			window.addEventListener( 'beforeunload', () => observer.disconnect() );
		})();
	` );
}


function showIncomingCallNotification ( contactName, avatar ) {
	const notification = new Notification( {
		title: 'Incoming Call',
		body: `${contactName} is calling you`,
		icon: avatar || appIcon,
		urgency: 'critical',
		timeoutType: 'never'
	} );

	notification.on( 'click', () => {
		mainWindow.focus();
		mainWindow.show();
	} );

	notification.show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then( () => {
	// IPC handlers for call events
	ipcMain.on( 'incoming-call', ( event, callDataArg ) => {
		if ( !isInCall ) {
			isInCall = true;
			callData = callDataArg;
			const { name, avatar } = callDataArg;
			
			// Show notification
			showIncomingCallNotification( name, avatar );
			
			// Create and show call window
			callWindowManager.createCallWindow( mainWindow );
			callWindowManager.sendToCallWindow( 'incoming-call-window', {
				contactName: name,
				avatar: avatar,
				isVideo: false
			} );
			
			mainWindow.setTitle( 'WhatsApp - Incoming Call' );
		}
	} );

	ipcMain.on( 'call-started', ( event, callDataArg ) => {
		if ( !isInCall ) {
			isInCall = true;
			callData = callDataArg || {};
			
			// Create call window
			callWindowManager.createCallWindow( mainWindow );
			callWindowManager.sendToCallWindow( 'incoming-call-window', {
				contactName: callData.contactName || 'Unknown',
				avatar: callData.avatar || '👤',
				isVideo: callData.isVideo || false
			} );
			
			mainWindow.setTitle( 'WhatsApp - In Call' );
		}
	} );

	ipcMain.on( 'call-ended', ( event ) => {
		isInCall = false;
		callWindowManager.closeCallWindow();
		mainWindow.setTitle( 'WhatsApp Desktop' );
		callData = {};
	} );

	// Handle mute toggle from call window
	ipcMain.on( 'mute-toggled', ( event, isMuted ) => {
		console.log( `Microphone ${isMuted ? 'muted' : 'unmuted'}` );
		mainWindow?.webContents.send( 'call-mute-toggle', isMuted );
	} );

	// Handle camera toggle from call window
	ipcMain.on( 'camera-toggled', ( event, isOn ) => {
		console.log( `Camera ${isOn ? 'on' : 'off'}` );
		mainWindow?.webContents.send( 'call-camera-toggle', isOn );
	} );

	// Handle speaker toggle from call window
	ipcMain.on( 'speaker-toggled', ( event, isOn ) => {
		console.log( `Speaker ${isOn ? 'on' : 'off'}` );
		mainWindow?.webContents.send( 'call-speaker-toggle', isOn );
	} );

	// Handle end call from call window
	ipcMain.on( 'end-call-requested', ( event ) => {
		mainWindow?.webContents.send( 'end-call' );
		isInCall = false;
		callWindowManager.closeCallWindow();
		mainWindow.setTitle( 'WhatsApp Desktop' );
	} );

	ipcMain.handle( 'get-system-audio-devices', async () => {
		// This can be expanded to list actual audio devices
		return {
			microphones: [ 'Default Microphone' ],
			speakers: [ 'Default Speaker' ]
		};
	} );

	// Create application menu with Developer Tools
	const template = [
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Developer Tools',
					accelerator: 'Ctrl+Shift+I',
					click: () => {
						mainWindow.webContents.toggleDevTools();
					}
				},
				{
					label: 'Reload',
					accelerator: 'Ctrl+R',
					click: () => {
						mainWindow.reload();
					}
				},
				{ type: 'separator' },
				{
					label: 'Zoom In',
					accelerator: 'Ctrl+Plus',
					click: () => {
						mainWindow.webContents.zoomFactor += 0.1;
					}
				},
				{
					label: 'Zoom Out',
					accelerator: 'Ctrl+Minus',
					click: () => {
						mainWindow.webContents.zoomFactor -= 0.1;
					}
				},
				{
					label: 'Reset Zoom',
					accelerator: 'Ctrl+0',
					click: () => {
						mainWindow.webContents.zoomFactor = 1;
					}
				},
				{ type: 'separator' },
				{
					label: 'Toggle Full Screen',
					accelerator: 'F11',
					click: () => {
						mainWindow.setFullScreen( !mainWindow.isFullScreen() );
					}
				}
			]
		},
		{
			label: 'Help',
			submenu: [
				{
					label: 'Phone Calling Features',
					click: () => {
						console.log( '📞 Calling Features:' );
						console.log( '  Escape - End call' );
						console.log( '  Alt+M - Toggle mute' );
						console.log( '  Alt+C - Toggle camera' );
						console.log( '  Ctrl+Shift+I - Open Developer Tools' );
						mainWindow.webContents.send( 'show-notification', {
							title: 'WhatsApp Calling',
							body: 'Press Escape to end call, Alt+M to mute, Alt+C to toggle camera'
						} );
					}
				},
				{
					label: 'About',
					click: () => {
						mainWindow.webContents.send( 'show-notification', {
							title: 'WhatsApp Desktop',
							body: 'Unofficial WhatsApp Linux Desktop Application v1.0.1'
						} );
					}
				}
			]
		}
	];

	const menu = Menu.buildFromTemplate( template );
	Menu.setApplicationMenu( menu );

	contextMenu( {
		showInspectElement: true, // Now show "Inspect Element" for debugging
		prepend: ( params, browserWindow ) => [
			{
				label: 'Copy',
				role: 'copy',
			},
			{
				label: 'Cut',
				role: 'cut'
			},
			{
				label: 'Paste',
				role: 'paste',
			},
			{ type: 'separator' },
			{
				label: 'Undo',
				role: 'undo'
			},
			{
				label: 'Redo',
				role: 'redo'
			},
			{ type: 'separator' },
			{
				label: 'Zoom In',
				role: 'zoomIn'
			},
			{
				label: 'Zoom Out',
				role: 'zoomOut'
			},
			{
				label: 'Reset Zoom',
				role: 'resetZoom'
			},
			{ type: 'separator' },
			{
				label: 'Reload',
				role: 'forceReload'
			},
			{
				label: 'Toggle Full Screen',
				role: 'togglefullscreen'
			}
		],
	} );

	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on( 'activate', () => {
		if ( BrowserWindow.getAllWindows().length === 0 ) {
			createWindow();
		}
	} );
} );

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.