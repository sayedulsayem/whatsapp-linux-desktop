# WhatsApp Desktop - Phone Calling Features

## Overview
The WhatsApp Linux Desktop application now includes enhanced phone calling features to provide a seamless calling experience directly from your desktop.

## Features Added

### 1. **Audio & Video Permissions**
- Automatic permission granting for microphone and camera access
- No manual permission dialogs when making or receiving calls
- Supports both audio and video calling

### 2. **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Escape` | End the current call |
| `Alt+M` | Toggle microphone (mute/unmute) |
| `Alt+C` | Toggle camera (on/off) |

### 3. **Incoming Call Notifications**
- Desktop notifications for incoming calls with caller name
- Critical urgency level to ensure you don't miss calls
- Click notification to bring app to focus

### 4. **Call Status Detection**
- Automatic detection of call start/end
- Window title updates to show "WhatsApp - In Call" during active calls
- Tracks call state for proper feature toggling

### 5. **System Audio Devices**
- Detects available microphones and speakers
- Supports system audio routing for better call quality

### 6. **Media Integration**
- Full WebRTC support for voice and video calls
- Hardware acceleration disabled for better compatibility on Linux
- Optimized user agent for web.whatsapp.com

## Usage

### Making a Call
1. Open the contact you want to call
2. Click the **Call** button (phone icon) for audio call or **Video Call** button for video call
3. Use keyboard shortcuts to manage your call:
   - `Alt+M` to toggle microphone
   - `Alt+C` to toggle camera
   - `Escape` to end the call

### Receiving a Call
1. When someone calls, you'll see a desktop notification with their name
2. Click the notification or switch to the app to answer
3. Use the same shortcuts to manage your call

### Manual Call Notification (for developers)
```javascript
window.notifyIncomingCall('Contact Name', avatarUrl);
```

## Configuration

### Permission Settings
Permissions are pre-granted for:
- Media (audio/video)
- Camera
- Microphone

To modify these settings, edit the `main.js` file:

```javascript
mainWindow.webContents.session.setPermissionRequestHandler( ( webContents, permission, callback ) => {
	if ( permission === 'media' || permission === 'camera' || permission === 'microphone' ) {
		callback( true );  // Grant permission
	} else {
		callback( false ); // Deny permission
	}
} );
```

## Technical Details

### IPC Channels
- `incoming-call`: Triggers incoming call notification
- `call-started`: Notifies when call begins
- `call-ended`: Notifies when call ends
- `end-call`: Ends the current call (via shortcut)
- `toggle-mute`: Toggles microphone
- `toggle-camera`: Toggles camera
- `get-system-audio-devices`: Retrieves available audio devices

### Files Modified
- `main.js`: Added IPC handlers, media permissions, shortcuts, and call notifications
- `preload.js`: Added call detection, UI element interaction, and notification handlers

## Troubleshooting

### Call Buttons Not Visible?

**Step 1: Open Developer Tools**
- Press `Ctrl+Shift+I` to open Developer Tools
- Go to the **Console** tab

**Step 2: Debug Call Buttons**
Run this command in the console:
```javascript
window.debugCallButtons()
```
This will show all elements that could be call buttons.

**Step 3: Make Call Buttons Visible**
If buttons are found but hidden, run:
```javascript
window.showAllCallButtons()
```
This will force all call buttons to be visible and clickable.

### No Sound During Call?
1. Check system audio is not muted
2. Ensure microphone is connected and recognized
3. Test microphone in system settings

### Camera Not Working?
1. Verify camera hardware is connected
2. Check camera permissions in system settings
3. Try using `Alt+C` to toggle camera on/off

### Missed Notifications?
1. Ensure notification permissions are granted
2. Check system notification settings
3. Verify WhatsApp app is in focus or taskbar notification is visible

### Call Shortcuts Not Working?
1. Make sure you're in an active call
2. Try restarting the app
3. Check if other apps are capturing the keyboard shortcuts

## Developer Information

### Console Functions

**`window.debugCallButtons()`**
- Searches for all call-related UI elements
- Displays detailed information about each element
- Shows if elements are visible or hidden

**`window.showAllCallButtons()`**
- Forces all call buttons to be visible and clickable
- Removes any CSS that might hide them
- Returns count of buttons made visible

**`window.findCallButtons()`**
- Returns array of found call buttons
- Shows selector and label for each button

### Accessing Features via Menu

1. **View Menu** → Toggle Developer Tools (Ctrl+Shift+I)
2. **Help Menu** → Phone Calling Features
3. **Help Menu** → About

## Future Enhancements
- Call history tracking
- Call recording support
- Custom notification sounds
- Call transfer functionality
- Conference calling improvements

## Support
For issues or feature requests, please visit: https://github.com/sayedulsayem/whatsapp
