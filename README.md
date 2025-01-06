# WhatsApp Desktop (Linux)
An unofficial WhatsApp Linux desktop application

[![Get it from the Snap Store](https://snapcraft.io/en/dark/install.svg)](https://snapcraft.io/whatsapp-linux-desktop)
[![Get it from the AUR Package](https://aur.archlinux.org/static/css/archnavbar/aurlogo.png)](https://aur.archlinux.org/packages/whatsapp-linux-desktop-bin)

## WhatsApp Desktop (Linux) - Stay Connected on Your Desktop!

Experience WhatsApp directly on your Linux desktop with this lightweight and efficient Electron-based application. Designed for Snapcraft users, this app brings the full functionality of WhatsApp Web to a standalone desktop environment, ensuring you stay connected without needing to keep a browser tab open.

**Key Features:**

* **Native Desktop Experience:** Use WhatsApp like a native application on your Linux system.
* **Seamless Notifications:** Get instant notifications for messages and calls directly on your desktop.
* **Full Functionality:** Access all the features you love from WhatsApp Web, including text messaging, voice messaging, and file sharing.
* **Cross-platform Compatibility:** Works flawlessly across different Linux distributions thanks to Snapcraft packaging.
* **Automatic Updates:** Receive updates and new features automatically through the Snap Store.


Perfect for users looking to streamline their messaging experience, this app offers smooth performance and a clean interface, making it an ideal choice for WhatsApp users on Linux.

### Installation
For Debian, Ubuntu, Linux Mint and any other debian based OS
```bash
sudo snap install whatsapp-linux-desktop
```
For Arch, Manjaro, and any other arch based OS
```bash
yay -Syu
yay -S whatsapp-linux-desktop-bin
```
For snap
```bash
sudo snap install whatsapp-linux-desktop
```

### Development
Clone  the repository and run the following commands to run the application:
```bash
npm install
npm run start
```
### Build
Clone  the repository and run the following commands to run the application:
```bash
npm run build-linux # all architectures
npm run build-linux-AppImage # only for AppImage
npm run build-linux-tar.gz # only for tar.gz
npm run build-linux-deb # only for deb
npm run build-linux-pacman # only for pacman
npm run build-linux-snap # only for snap
```


**Changelogs:**
* **1.0.1**
	* New: Release native pacman package to install on Arch Linux
	* New: Release native Debian package to install natively
	* Fix: Sound Issue on snap
* **1.0.0**
	* Initial Release