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

// ===== PHONE CALLING FEATURES =====

// Handle end call request
ipcRenderer.on( 'end-call', () => {
	const endCallButton = document.querySelector( '[aria-label*="End call" i]' ) ||
						 document.querySelector( '[data-testid="end-call"]' );
	if ( endCallButton ) {
		endCallButton.click();
		console.log( 'Call ended via keyboard shortcut' );
	}
} );

// Handle toggle mute
ipcRenderer.on( 'toggle-mute', () => {
	const muteButton = document.querySelector( '[aria-label*="Mute" i]' ) ||
					   document.querySelector( '[data-testid="mute"]' );
	if ( muteButton ) {
		muteButton.click();
		console.log( 'Microphone toggled' );
	}
} );

// Handle toggle camera
ipcRenderer.on( 'toggle-camera', () => {
	const cameraButton = document.querySelector( '[aria-label*="Camera" i]' ) ||
						document.querySelector( '[data-testid="camera"]' );
	if ( cameraButton ) {
		cameraButton.click();
		console.log( 'Camera toggled' );
	}
} );

// Detect incoming calls and send notification
function setupCallDetection() {
	let isCurrentlyInCall = false;

	const callObserver = new MutationObserver( ( mutations ) => {
		// Check for incoming call indicators - WhatsApp uses various selectors
		const callScreens = [
			document.querySelector( '[data-testid="call-screen"]' ),
			document.querySelector( '[aria-label*="call" i]' ),
			document.querySelector( '.call-screen' ),
			document.querySelector( 'div[style*="call"]' ),
			document.querySelector( '[class*="CallScreen"]' ),
			document.querySelector( '[data-testid="call"]' )
		];
		
		const callUI = callScreens.find( screen => screen !== null );
		
		if ( callUI && !isCurrentlyInCall ) {
			isCurrentlyInCall = true;
			
			// Extract contact information
			const contactName = document.querySelector( '[data-testid="call-contact-name"]' )?.textContent || 
								 document.querySelector( '.contact-name' )?.textContent ||
								 document.querySelector( '[data-testid="contact-name"]' )?.textContent ||
								 document.querySelectorAll( 'h4, h3, .qlwzfd' )?.[0]?.textContent ||
								 'Unknown Contact';
			
			// Get avatar if available
			const avatarElement = document.querySelector( '[data-testid="call-contact-avatar"]' ) ||
								   document.querySelector( 'img[alt="' + contactName + '"]' ) ||
								   document.querySelector( '[class*="avatar"]' );
			
			const avatar = avatarElement?.src || '👤';
			
			// Determine if it's a video call
			const isVideo = document.querySelector( '[data-testid="video-call"]' ) !== null ||
						   document.querySelector( '[aria-label*="Video" i]' ) !== null;
			
			// Send call started event with contact info
			ipcRenderer.send( 'call-started', {
				contactName: contactName,
				avatar: avatar,
				isVideo: isVideo,
				timestamp: new Date().getTime()
			} );
			
			console.log( `%c📞 Call started with: ${contactName}`, 'color: #25D366; font-weight: bold;' );
			console.log( `%cVideo: ${isVideo ? 'Yes' : 'No'}`, 'color: #25D366;' );
		} else if ( !callUI && isCurrentlyInCall ) {
			isCurrentlyInCall = false;
			ipcRenderer.send( 'call-ended' );
			console.log( '%c📞 Call ended', 'color: #e74c3c; font-weight: bold;' );
		}

		// Expose call buttons to main interface
		const callButtons = document.querySelectorAll( 
			'[data-testid="call"], [aria-label*="Call" i], button[title*="Call" i], [data-tooltip*="call" i]' 
		);
		
		callButtons.forEach( button => {
			// Make sure call buttons are visible and accessible
			button.style.visibility = 'visible';
			button.style.display = 'block';
			button.style.opacity = '1';
		} );
	} );

	callObserver.observe( document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['style', 'class', 'aria-hidden']
	} );

	window.addEventListener( 'beforeunload', () => callObserver.disconnect() );
}

// Initialize call detection when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', setupCallDetection );
} else {
	setupCallDetection();
}

// Provide a way to manually notify about incoming calls
window.notifyIncomingCall = function ( contactName, avatar ) {
	ipcRenderer.send( 'incoming-call', {
		name: contactName,
		avatar: avatar
	} );
};

// Notify when call ends
window.addEventListener( 'beforeunload', () => {
	ipcRenderer.send( 'call-ended' );
} );

// Handle call control events from the call window
ipcRenderer.on( 'call-mute-toggle', ( event, isMuted ) => {
	const muteButton = document.querySelector( 'button[aria-label*="Mute" i]' ) ||
					   document.querySelector( '[data-testid="mute"]' );
	if ( muteButton ) {
		muteButton.click();
	}
} );

ipcRenderer.on( 'call-camera-toggle', ( event, isOn ) => {
	const cameraButton = document.querySelector( 'button[aria-label*="Camera" i]' ) ||
						document.querySelector( '[data-testid="camera"]' );
	if ( cameraButton ) {
		cameraButton.click();
	}
} );

ipcRenderer.on( 'call-speaker-toggle', ( event, isOn ) => {
	const speakerButton = document.querySelector( 'button[aria-label*="Speaker" i]' ) ||
						 document.querySelector( '[aria-label*="Loudspeaker" i]' );
	if ( speakerButton ) {
		speakerButton.click();
	}
} );

ipcRenderer.on( 'end-call', ( event ) => {
	const endCallButton = document.querySelector( 'button[aria-label*="End call" i]' ) ||
						 document.querySelector( '[data-testid="end-call"]' );
	if ( endCallButton ) {
		endCallButton.click();
	}
} );

// Request audio devices
ipcRenderer.invoke( 'get-system-audio-devices' ).then( devices => {
	console.log( 'Available audio devices:', devices );
} );

// Add visual indicator for call status in the window title
console.log( '✓ Phone calling features enabled' );

// Debug function to find and display all clickable elements that might be call buttons
window.debugCallButtons = function() {
	console.clear();
	console.log( '%c📞 WhatsApp Call Feature Debugger', 'color: #25D366; font-size: 16px; font-weight: bold;' );
	
	const selectors = [
		{ name: 'Call Button (data-testid)', selector: '[data-testid="call"]' },
		{ name: 'Video Call Button (data-testid)', selector: '[data-testid="video-call"]' },
		{ name: 'Call Buttons (aria-label)', selector: 'button[aria-label*="Call" i]' },
		{ name: 'Video Buttons (aria-label)', selector: 'button[aria-label*="Video" i]' },
		{ name: 'All Buttons with aria-label', selector: 'button[aria-label]' },
		{ name: 'Call-like divs', selector: 'div[onclick*="call" i]' }
	];
	
	selectors.forEach( ( { name, selector } ) => {
		const elements = document.querySelectorAll( selector );
		if ( elements.length > 0 ) {
			console.log( `\n✓ Found ${elements.length} element(s) matching: ${name}` );
			elements.forEach( ( el, idx ) => {
				console.log( `  [${idx}]`, {
					tag: el.tagName,
					class: el.className,
					id: el.id,
					ariaLabel: el.getAttribute( 'aria-label' ),
					title: el.title,
					textContent: el.textContent.substring( 0, 50 ),
					visible: el.offsetParent !== null,
					onclick: el.onclick ? 'yes' : 'no'
				} );
			} );
		}
	} );
	
	console.log( '\n%c📍 To make call buttons visible:', 'color: #128C7E; font-weight: bold;' );
	console.log( 'Run: window.showAllCallButtons()' );
};

// Function to force show all call buttons
window.showAllCallButtons = function() {
	const selectors = [
		'[data-testid="call"]',
		'[data-testid="video-call"]',
		'button[aria-label*="Call" i]',
		'button[aria-label*="Video" i]'
	];
	
	let count = 0;
	selectors.forEach( selector => {
		document.querySelectorAll( selector ).forEach( el => {
			el.style.visibility = 'visible';
			el.style.display = 'block';
			el.style.opacity = '1';
			el.style.pointerEvents = 'auto';
			el.style.zIndex = '9999';
			count++;
		} );
	} );
	
	console.log( `✓ Made ${count} call button(s) visible` );
	return count;
};

// Auto-run debugger on page load to help user find call buttons
window.addEventListener( 'load', () => {
	setTimeout( () => {
		console.log( '%c🚀 WhatsApp Desktop is ready!', 'color: #25D366; font-size: 14px; font-weight: bold;' );
		console.log( '%cℹ️ Run window.debugCallButtons() to find call buttons', 'color: #128C7E;' );
		console.log( '%cℹ️ Run window.showAllCallButtons() to make them visible', 'color: #128C7E;' );
	}, 1000 );
} );