const admin = require('firebase-admin');
const serviceAccount = require('../utils/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (token, title, body, data = {}, lang = 'en') => {
  if (!token) {
    console.warn('No FCM token provided');
    return;
  }

  // ✅ تأكد إن كل الـ data سترينج (شرط FCM)
  const safeData = {};
  Object.keys(data).forEach(key => {
    safeData[key] = data[key] != null ? String(data[key]) : '';
  });

  const message = {
    token,
    notification: {
      title: title,   // ✅ نص مباشر
      body: body,     // ✅ نص مباشر
    },
    data: safeData,
    android: {
      priority: 'high',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log('✅ Notification sent');
  } catch (error) {
    console.error('❌ FCM error:', error.message);
  }
};

module.exports = { sendNotification };
