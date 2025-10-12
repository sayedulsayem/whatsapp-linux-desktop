// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, nativeImage } = require( 'electron' );
const path = require( 'node:path' );
const contextMenu = require( 'electron-context-menu' );
const appIcon = nativeImage.createFromPath( path.join( __dirname, 'build/icon.png' ) );

app.disableHardwareAcceleration();

let mainWindow;
let deepLinkUrl = null; // <— store incoming URL

// Register protocol handler (on Linux this usually works after installing the .desktop file / snap config)
const PROTOCOL = 'whatsapp';
if ( process.defaultApp ) {
	// Fix for dev mode (electron .)
	if ( process.argv.length >= 2 ) {
		app.setAsDefaultProtocolClient( PROTOCOL, process.execPath, [ path.resolve( process.argv[ 1 ] ) ] );
	}
} else {
	app.setAsDefaultProtocolClient( PROTOCOL );
}

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

	// Open the DevTools.
	mainWindow.on( 'closed', function () {
		mainWindow = null;
	} );

	mainWindow.webContents.once( 'did-finish-load', () => {
		// Check notification permission when the window is ready
		checkNotificationPermission();
		setupExternalLinkHandling();
		sendNotification();

		// If app was launched with a deep link
		if ( deepLinkUrl ) {
			handleDeepLink( deepLinkUrl );
			deepLinkUrl = null;
		}
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

// 🧩 Deep Link Handler
function handleDeepLink ( url ) {
	try {
		const parsed = new URL( url );
		// Example: whatsapp://send/?phone=%2B1234567890&text=Hello
		const phone = parsed.searchParams.get( 'phone' );
		const text = parsed.searchParams.get( 'text' );

		const target = new URL( 'https://web.whatsapp.com/send' );
		if ( phone ) {
			target.searchParams.set( 'phone', phone );
		}
		if ( text ) {
			target.searchParams.set( 'text', text );
		}

		if ( mainWindow && ( phone || text ) ) {
			mainWindow.loadURL( target.toString() );
		}
	} catch ( err ) {
		console.error( 'Failed to parse deep link URL:', err );
	}
}

// Handle deep links when the app is already running (macOS)
app.on( 'open-url', ( event, url ) => {
	event.preventDefault();
	if ( mainWindow ) {
		handleDeepLink( url );
	} else {
		deepLinkUrl = url;
	}
} );

// Handle deep links on Linux/Windows via process.argv
app.on( 'second-instance', ( event, argv ) => {
	const deeplinkArg = argv.find( arg => arg.startsWith( `${PROTOCOL}://` ) );
	if ( deeplinkArg ) {
		if ( mainWindow ) {
			if ( mainWindow.isMinimized() ) mainWindow.restore();
			mainWindow.focus();
			handleDeepLink( deeplinkArg );
		} else {
			deepLinkUrl = deeplinkArg;
		}
	}
} );

app.whenReady().then( () => {
	// Context Menu
	contextMenu( {
		showInspectElement: false,
		prepend: ( params, browserWindow ) => [
			{ label: 'Copy', role: 'copy' },
			{ label: 'Cut', role: 'cut' },
			{ label: 'Paste', role: 'paste' },
			{ type: 'separator' },
			{ label: 'Undo', role: 'undo' },
			{ label: 'Redo', role: 'redo' },
			{ type: 'separator' },
			{ label: 'Zoom In', role: 'zoomIn' },
			{ label: 'Zoom Out', role: 'zoomOut' },
			{ label: 'Reset Zoom', role: 'resetZoom' },
			{ type: 'separator' },
			{ label: 'Reload', role: 'forceReload' },
			{ label: 'Toggle Full Screen', role: 'togglefullscreen' }
		],
	} );

	// Single Instance Lock for deep link
	const gotTheLock = app.requestSingleInstanceLock();
	if ( !gotTheLock ) {
		app.quit();
		return;
	}

	createWindow();

	app.on( 'activate', () => {
		if ( BrowserWindow.getAllWindows().length === 0 ) createWindow();
	} );

	// Handle deep link passed on launch
	if ( process.platform !== 'darwin' ) {
		const deeplinkArg = process.argv.find( arg => arg.startsWith( `${PROTOCOL}://` ) );
		if ( deeplinkArg ) deepLinkUrl = deeplinkArg;
	}
} );

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );
