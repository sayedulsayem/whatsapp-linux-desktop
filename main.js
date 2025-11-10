// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, nativeImage, Tray, Menu } = require( 'electron' );
const path = require( 'node:path' );
const contextMenu = require( 'electron-context-menu' );
const appIcon = nativeImage.createFromPath( path.join( __dirname, 'build/icon.png' ) );

const cliArgs = process.argv.slice( 1 );
const shouldStartMinimized = cliArgs.includes( '--start-minimized' ) || cliArgs.includes( '--minimized' );
const shouldStartInTray = cliArgs.includes( '--start-in-tray' ) || cliArgs.includes( '--tray' ) || cliArgs.includes( '--hidden' );
const shouldStartHidden = shouldStartMinimized || shouldStartInTray;

app.disableHardwareAcceleration();

let mainWindow;
let tray;
let isQuitting = false;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow( {
		width: 1200,
		height: 800,
		autoHideMenuBar: true,
		frame: true,
		show: false,
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

	mainWindow.once( 'ready-to-show', () => {
		if ( shouldStartHidden ) {
			mainWindow.hide();
		} else {
			mainWindow.show();
		}
	} );

	mainWindow.on( 'minimize', event => {
		event.preventDefault();
		mainWindow.hide();
	} );

	mainWindow.on( 'close', event => {
		if ( isQuitting ) {
			return;
		}

		event.preventDefault();

		if ( process.platform === 'darwin' ) {
			app.hide();
		} else {
			mainWindow.hide();
		}
	} );

	if ( process.platform === 'darwin' ) {
		setupDockIcon();
	}
};

function setupTray () {
	if ( tray ) {
		return;
	}

	tray = new Tray( appIcon );
	tray.setToolTip( 'WhatsApp Desktop' );

	const trayMenu = Menu.buildFromTemplate( [
		{
			label: 'Show',
			click: () => {
				showMainWindow();
			}
		},
		{
			label: 'Hide to Tray',
			click: () => {
				if ( mainWindow?.isVisible() ) {
					mainWindow.hide();
				}
			}
		},
		{ type: 'separator' },
		{
			label: 'Exit',
			click: () => {
				isQuitting = true;
				app.quit();
			}
		}
	] );

	tray.setContextMenu( trayMenu );

	tray.on( 'click', () => {
		showMainWindow();
	} );
}

function showMainWindow () {
	if ( !mainWindow || mainWindow.isDestroyed() ) {
		createWindow();
		return;
	}

	if ( !mainWindow.isVisible() ) {
		mainWindow.show();
	}

	if ( mainWindow.isMinimized() ) {
		mainWindow.restore();
	}

	mainWindow.focus();
}

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
	setupTray();

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

app.on( 'before-quit', () => {
	isQuitting = true;

	if ( tray ) {
		tray.destroy();
		tray = null;
	}
} );

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.