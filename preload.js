/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { ipcRenderer, Notification } = require( 'electron' );

// Request notification permission when the preload script is loaded
Notification.requestPermission().then( permission => {
	console.log( 'Notification permission:', permission );
} );

// Handle IPC event to show a notification
ipcRenderer.on( 'show-notification', ( event, notificationOptions ) => {
	if ( Notification.permission === 'granted' ) {
		const notification = new Notification( notificationOptions.title, notificationOptions );
		notification.show();
	}
} );