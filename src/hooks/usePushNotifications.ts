import { useEffect } from 'react';
import { CalendarApi } from '../api';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return view;
}

export const usePushNotifications = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('🔔 [Push] Navegador no soportado');
      return;
    }

    const register = async () => {
      const api = CalendarApi.getInstance();

      console.log('🔔 [Push] Iniciando registro...');

      const { data } = await api.get<{ publicKey: string }>('/push/vapid-key');
      console.log('🔔 [Push] VAPID key recibida:', data.publicKey.slice(0, 20) + '...');

      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      // Registrar SW y esperar a que esté completamente activo
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;
      console.log('🔔 [Push] SW activo, scope:', registration.scope);

      const permission = await Notification.requestPermission();
      console.log('🔔 [Push] Permiso:', permission);
      if (permission !== 'granted') {
        console.warn('🔔 [Push] Permiso denegado');
        return;
      }

      // Verificar si ya existe una suscripción activa
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔔 [Push] Ya existe suscripción, enviando al backend...');
        await api.post('/push/subscribe', existingSubscription.toJSON());
        console.log('🔔 [Push] Suscripción existente sincronizada con backend');
        return;
      }

      console.log('🔔 [Push] Creando nueva suscripción...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log('🔔 [Push] Suscripción creada:', subscription.endpoint.slice(0, 60) + '...');

      const response = await api.post('/push/subscribe', subscription.toJSON());
      console.log('🔔 [Push] Guardada en backend:', response.data);
    };

    register().catch((err: unknown) => {
      console.error('🔔 [Push] Error en el registro:', err);
    });
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
  }, []);
};