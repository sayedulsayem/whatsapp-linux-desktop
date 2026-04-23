# WhatsApp Native Call Window - User Guide

## Overview
The WhatsApp Linux Desktop app now features a native call window interface similar to the Windows version. When you make or receive a call, a dedicated floating window appears with built-in call controls.

## Features

### 🖼️ Native Call Window
- **Floating window** that appears on top of other applications
- **Resizable & repositionable** window for your convenience
- **Modern dark UI** with contact information displayed
- **Always-on-top** mode during active calls

### 📱 Contact Information Display
- Contact name and avatar
- Call status (Connecting, Connected)
- Call duration timer (MM:SS format)
- Call type indicator (Voice or Video)

### 🎮 Call Controls
Built into the floating window with easy access:

| Control | Function | Shortcut |
|---------|----------|----------|
| 🔊 Mute | Toggle microphone on/off | Alt+M |
| 📷 Camera | Toggle video on/off | Alt+C |
| 🔔 Speaker | Toggle speaker/loudspeaker | - |
| 📵 End Call | End the current call | Esc |

### ⏱️ Call Timer
- Displays elapsed time in MM:SS format
- Updates in real-time during the call
- Green color for easy visibility

## How to Use

### Making a Call
1. **Select a contact** in WhatsApp
2. **Click the Call button** (phone icon) for voice call
3. **Or click Video button** for video call
4. **Call window automatically appears** with floating design
5. Use the built-in controls to manage the call

### Receiving a Call
1. **Desktop notification** appears with caller name
2. **Click the notification** to focus the app
3. **Call window automatically opens** 
4. Use controls to answer or reject the call

### Managing Your Call
- Click **Mute button** 🔊 to toggle microphone
- Click **Camera button** 📷 to toggle video
- Click **Speaker button** 🔔 to switch speakers
- Click **End Call button** 📵 or press **Esc** to disconnect

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Esc | End call |
| Alt+M | Toggle mute |
| Alt+C | Toggle camera |
| Ctrl+R | Reload app |
| Ctrl+Shift+I | Developer Tools |

## Window Features

### Positioning
- Window appears in the **bottom-right corner** of your screen
- You can drag and move it anywhere
- Window remains visible during other tasks

### Resizing
- Drag the window edges to resize
- Minimum size: 400x600 pixels
- Maintains aspect ratio for comfort

### Always-On-Top
- Call window stays on top of other applications
- Won't be hidden by other windows
- Perfect for multitasking while on call

## Status Indicators

### Call Status Messages
- **Connecting...** - Call is being established
- **Connected** - Call is active
- **Incoming** - You have an incoming call

### Call Type
- **VOICE CALL** - Audio-only call
- **VIDEO CALL** - Video call in progress

## Control States

### Mute Button States
- 🔊 **Unmuted** - Microphone is on
- 🔇 **Muted** - Microphone is off (red background)

### Camera Button States
- Off - Camera is disabled
- 📷 **On** - Camera is active (shows in video preview)

### Speaker Button States
- ✓ **Active** - Speaker is selected (blue background)
- Inactive - Speaker is off

## Advanced Features

### Video Call Support
- Camera toggle for video calls
- Video preview shows camera status
- Full-screen capability

### Developer Mode
Press `Ctrl+Shift+I` to open Developer Tools and:
- Monitor call events
- Debug connection issues
- Check console logs

### Call Events
The app logs important information:
```
📞 Call started with: Contact Name
📍 Video: Yes/No
📞 Call ended
```

## Troubleshooting

### Call Window Not Appearing?
1. Check if WhatsApp is properly loaded
2. Make sure you're making a valid call
3. Try refreshing the app (Ctrl+R)
4. Check Developer Tools console for errors

### Controls Not Working?
1. Ensure you're in an active call
2. Try using keyboard shortcuts instead
3. Check if buttons are visually responsive
4. Verify microphone/camera permissions in system settings

### Audio Issues?
1. Check system audio levels
2. Verify microphone and speaker are connected
3. Test in system settings first
4. Try toggling speakers using the button

### Camera Not Working?
1. Check hardware connection
2. Verify permissions for camera access
3. Try Alt+C keyboard shortcut
4. Restart the app if needed

## Tips & Tricks

### Multitasking
- Keep the call window visible while using other apps
- Minimize WhatsApp main window while staying in call
- Window stays on top for important calls

### Call Duration
- Check the timer to track how long you've been talking
- Helpful for monitoring call length

### Quick Mute
- Press Alt+M even if window is not focused
- Allows quick mute without switching windows

### Video Calls
- Camera toggle 📷 works for video calls
- Video preview shows when camera is active
- See camera status at a glance

## Keyboard Navigation

- **Tab** - Cycle through call controls
- **Enter/Space** - Press the focused button
- **Esc** - End call and close window
- **Alt+M** - Quick mute toggle
- **Alt+C** - Quick camera toggle

## Contact Preferences

### Avatar Display
- Shows contact's profile picture
- Falls back to generic avatar (👤) if unavailable
- Helps identify caller at a glance

### Contact Name
- Displays saved contact name from WhatsApp
- Shows "Unknown Contact" if name unavailable

## Performance

The call window is optimized for:
- Minimal CPU usage
- Low memory footprint
- Smooth window animations
- Fast response to button clicks

## Privacy & Security

- All call data is processed locally
- No external servers involved
- Window communication encrypted
- Notifications are system-level

## Getting Help

For issues or feature requests:
- **Check Developer Console**: Ctrl+Shift+I
- **Review logs**: Look for call-related messages
- **Test system settings**: Verify audio/video permissions
- **Restart app**: Often resolves temporary issues

## Future Enhancements

Planned features:
- Call recording support
- Call history in the window
- Recent contacts quick access
- Custom notification sounds
- Fullscreen call mode
