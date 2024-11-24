// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, nativeImage, Tray, Menu } = require( 'electron' );
const path = require( 'node:path' );
const contextMenu = require( 'electron-context-menu' );
const appIcon = nativeImage.createFromPath( path.join( __dirname, 'build/icon.png' ) );

app.disableHardwareAcceleration();

let mainWindow = null;
let tray = null;

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

	mainWindow.on( 'minimize', ( event ) => {
		event.preventDefault();
		mainWindow.hide();
	} );

	mainWindow.on( 'close', ( event ) => {
		if ( !app.isQuiting ) {
			event.preventDefault();
			mainWindow.hide();
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
		sendNotification();
	} );

	if ( process.platform === 'darwin' ) {
		setupDockIcon();
	}

	let trayIconPath;
	if ( app.isPackaged ) {
		trayIconPath = path.join( process.resourcesPath, 'build/tray-icon.png' );
	} else {
		trayIconPath = path.join( __dirname, 'build/tray-icon.png' );
	}
	tray = new Tray( trayIconPath );
	tray.setToolTip( 'WhatsApp Desktop' );

	tray.on( 'click', () => {
		if ( mainWindow.isVisible() ) {
			// If the window is visible, hide it
			mainWindow.hide();
		} else {
			// If the window is hidden, show and focus it
			mainWindow.show();
			mainWindow.focus();
		}
	} );

	const trayMenu = Menu.buildFromTemplate( [
		{
			label: 'Show',
			click: () => {
				mainWindow.show();
			},
		},
		{
			label: 'Quit',
			click: () => {
				app.isQuiting = true;
				app.quit();
			},
		},
	] );
	tray.setContextMenu( trayMenu );
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then( () => {
	contextMenu( {
		showInspectElement: false, // Hide "Inspect Element" option
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
			if ( mainWindow === null ) {
				createWindow();
			} else {
				if ( !mainWindow.isVisible() ) {
					mainWindow.show();
				}
				mainWindow.focus();
			}
			// createWindow();
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