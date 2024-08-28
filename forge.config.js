const { FusesPlugin } = require( '@electron-forge/plugin-fuses' );
const { FuseV1Options, FuseVersion } = require( '@electron/fuses' );

module.exports = {
	packagerConfig: {
		name: 'WhatsApp',
		executableName: 'WhatsApp',
		asar: true,
		appCategoryType: 'public.app-category.social-networking',
		icon: './public/icons/icon',
	},
	rebuildConfig: {
		force: true
	},
	makers: [
		{
			name: '@electron-forge/maker-deb',
			config: {
				options: {
					name: 'WhatsApp',
					productName: 'WhatsApp',
					genericName: 'WhatsApp',
					productDescription: 'An unofficial WhatsApp linux desktop application',
					maintainer: 'Sayedul Sayem',
					homepage: 'https://sayedulsayem.com'
				},
				icon: './public/icons/icon.png'
			},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				name: 'WhatsApp',
				title: "WhatsApp",
				format: 'ULFO'
			}
		},
		// {
		// 	name: '@electron-forge/maker-snap',
		// 	config: {
		// 		features: {
		// 			audio: true,
		// 			mpris: 'com.whatsapp.mpris',
		// 			webgl: true
		// 		},
		// 		summary: 'An unofficial WhatsApp linux desktop application',
		// 	}
		// },
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin( {
			version: FuseVersion.V1,
			[ FuseV1Options.RunAsNode ]: false,
			[ FuseV1Options.EnableCookieEncryption ]: true,
			[ FuseV1Options.EnableNodeOptionsEnvironmentVariable ]: false,
			[ FuseV1Options.EnableNodeCliInspectArguments ]: false,
			[ FuseV1Options.EnableEmbeddedAsarIntegrityValidation ]: true,
			[ FuseV1Options.OnlyLoadAppFromAsar ]: true,
		} ),
	],
	hooks: {},
	buildIdentifier: 'WhatsApp'
};
