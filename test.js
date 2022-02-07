// Firebase configuration

var firebaseConfigDev = {
	apiKey: "AIzaSyBXw14EVO77GZPMb5rmFW3qV_q8GfSxiOo",
	authDomain: "suedtirolmobil-dev-4da66.firebaseapp.com",
	databaseURL: "https://suedtirolmobil-dev-4da66.firebaseio.com",
	projectId: "suedtirolmobil-dev-4da66",
	storageBucket: "suedtirolmobil-dev-4da66.appspot.com",
	messagingSenderId: "278373853074",
	appId: "1:278373853074:web:34789aedf2efb07049034b"
};

var firebaseConfigQS = {
	apiKey: "AIzaSyBa2x6KLUmSErDbdpzjpyp83edo2vPuej8",
	authDomain: "suedtirolmobil-qs.firebaseapp.com",
	databaseURL: "https://suedtirolmobil-qs.firebaseio.com",
	projectId: "suedtirolmobil-qs",
	storageBucket: "suedtirolmobil-qs.appspot.com",
	messagingSenderId: "800757675062",
	appId: "1:800757675062:web:57bf1f3c12765e4806d497"
};

var firebaseConfigProd = {
	apiKey: "AIzaSyB_9lGHW1APTRt2wK_77PzkGGPRR-IrSSk",
	authDomain: "suedtirolmobil.firebaseapp.com",
	databaseURL: "https://suedtirolmobil.firebaseio.com",
	projectId: "suedtirolmobil",
	storageBucket: "suedtirolmobil.appspot.com",
	messagingSenderId: "829402355361",
	appId: "1:829402355361:web:11a2891a7772e34d0b42e0"
};

var vapidKeyDev = "BBTwpcL1mMFiBbW77aVGpTog_CIu6_Z97uwGeqPgbxDtNKtdt-1G0E9LQu5sPke1Nc2zAAzegy2Icer8zX_daTs";
var vapidKeyQS = "BNrkEZVPoF_cNgxNqlZ7XaOCOVhdM7yTK6B5idLz6wXRI5VSu87K1lRaWHuBC__nsuDSg-QeGLbvfmzObXnkx5U";
var vapidKeyProd = "BMJZ8CvCIfFVYCATjylTascDW9CyxBjVd6TneOffI7FG3pV5f4BsGDhQky-e9EnK9ZmiECGuQLxltUU8rW9jsVU";

var serverKeyDev = 'AAAAQNBf55I:APA91bEX9u49YXTiiaObqKuct-ZwLPo7HLcgQ3agr_LdxdM5PqXur3TDaeOdutRrDXc8mpS1' +
	'LhdZAG8lZyYbIwc1PV6dRCeMLFvPygCiolN3K3kMi_WVPDAbxUoiH5Is4knN7A5VlH3k';
var serverKeyQS = 'AAAAunDgdDY:APA91bGGcffKo_1if_idX29AYLy9kbShVXN820pvsAAg3yBa7nZ5PLS7C1kg9faG7LtP4RVe' +
	'wVSKb5byq7qOQpl-CQbkjf03G6fa3dUtdj_ddjPqMo-RXuCFrTJryIkvHbLmnY0rrM8k';
var serverKeyProd = 'AAAAwRw7lqE:APA91bFe9pTjwc9SXRNUwYdvE6X29P4b7dDEW4IOG8Ern1N4VwOM57Qo61fOftZ8w3XbmK7Z' +
	'vxEtQXS-m9PqlEU5iy-tSUjg3GjztUbG7weVDULie_WlPu0EZJkJh2DYafJccxxUK-Bv';

// Dev url until there is some pushbackend on the actual dev server.
var urlDevLocal = 'http://localhost:443/pb/';
var urlDev = 'https://push-dev.suedtirolmobil.info/pb/';
var urlQS = 'https://push-qs.suedtirolmobil.info/pb/';
var urlProd = 'https://push.suedtirolmobil.info/pb/';

// Use same URL since the backend is not up for prod yet.

var environment = 'dev';

var useConfig;
var useVapidKey;
var useUrl;
var serverKey;

function setEnvironment(env) {
	environment = env;

	switch (environment) {
		case 'dev-local':
			useConfig = firebaseConfigDev;
			useVapidKey = vapidKeyDev;
			useUrl = urlDevLocal;
			serverKey = serverKeyDev;
			environment = 'dev';
			break;
		case 'dev':
			useConfig = firebaseConfigDev;
			useVapidKey = vapidKeyDev;
			useUrl = urlDev;
			serverKey = serverKeyDev
			break;
		case 'qs':
			useConfig = firebaseConfigQS;
			useVapidKey = vapidKeyQS;
			useUrl = urlQS;
			serverKey = serverKeyQS;
			break;
		case 'prod':
			useConfig = firebaseConfigProd;
			useVapidKey = vapidKeyProd;
			useUrl = urlProd;
			serverKey = serverKeyProd;
			break;
	}

	localStorage.setItem('pushBackendUrl', useUrl);
	localStorage.setItem('flavor', environment);

	// Initialize Firebase
	firebase.initializeApp(useConfig);
}

function initializeFirebase () {

	// We use a different serviceworker, because of redirecting
	navigator.serviceWorker.register('/typo3conf/ext/sta_layout/Resources/Public/JavaScript/Src/firebase-messaging-sw-' + environment + '.js')
		.then((r) => {
			const messaging = firebase.messaging();
			messaging.useServiceWorker(r);
			messaging.usePublicVapidKey(useVapidKey);

			const channel = new BroadcastChannel('sw-messages');
			channel.addEventListener('message', event => {
				localStorage.setItem('dashboardNews', JSON.stringify({title: event.data.title, subtitle: event.data.body, body: event.data.messageText}));
			});

			//request permission for Push Message.
			messaging.requestPermission().then(function () {
				messaging.getToken().then(token => {
					if (localStorage.getItem('firebaseToken') !== token) {
						localStorage.setItem('firebaseToken', token);
					}

					// the timeout is a safety measure 
					setTimeout(() => {
						getAllSubscriptions(token, serverKey).then((subscriptions) => {
							let language = window.location.pathname.split('/')[1];
							adjustTopicsToLanguage(subscriptions, language, token, useUrl);
						});
					}, 5000);
				});
				messaging.onMessage((payload) => {
					navigator.serviceWorker.getRegistrations().then(function(registrations) {
						registrations[0].showNotification(payload.data.title, {
							icon: '/typo3conf/ext/sta_layout/Resources/Public/Images/push-logo.png',
							body: payload.data.body,
							data: payload.data
						});
					  });
				});
			}).catch(function(error) {
				console.log('Push Message is disallowed');
			});
	});
	
	window.addEventListener("unload", (event) => { 
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			for(let registration of registrations) {
				registration.unregister();
			}
		});
	});
}

function getAllSubscriptions (token, serverKey) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `key=${serverKey}`
			}
		};
		fetch(`https://iid.googleapis.com/iid/info/${token}?details=true`, options)
			.then(resoponse => resoponse.json())
			.then(data => {
				if (!data.rel) {
					resolve([]);
				}
				else if (data.rel.topics !== undefined) {
					resolve(Object.keys(data.rel.topics));
				} else {
					throw new Error('Unexpected data in getAllSubscriptions!');
				}
			})
			.catch(error => reject(error));
	});
}

function subscribe (topic, token, url) {
	return doSubscribeUnsubscribe(topic, token, url + 'subscribe');
}

function unsubscribe (topic, token, url) {
	return doSubscribeUnsubscribe(topic, token, url + 'unsubscribe');
}

function doSubscribeUnsubscribe (topic, token, url) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'POST', 
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				IdToken: token,
				topic: topic
			})
		}
		fetch(url, options)
			.then(resoponse => resoponse.json())
			.then(data => resolve(data))
			.catch(error => reject(error));
	});
}

function adjustTopicsToLanguage (subscriptions, language, token, url) {
	const subsUnsubs = [];

	for(const subscription of subscriptions) {
		const topicName = subscription.split('_')[0];
		const languageString = subscription.split('_')[1];

		if(!languageString || languageString === '') {
			// skip
		} else if(languageString !== language) {
			subsUnsubs.push(unsubscribe(subscription, token, url));
			subsUnsubs.push(subscribe(topicName + '_' + language, token, url));
		}
	}
	
	return Promise.all(subsUnsubs);
};