import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export function usePushNotifications(userId?: string) {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'web') {
      registerPush();
    }
  }, [userId]);

  const registerPush = async () => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied push notification permission');
      return;
    }

    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Save token to backend if user is logged in
      if (userId) {
        try {
          await fetch('/api/users/fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token: token.value })
          });
        } catch (e) {
          console.error('Error saving token', e);
        }
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // You could show a local toast or alert here
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });
  };
}
