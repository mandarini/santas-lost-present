import { useState, useEffect } from 'react';

const DEVICE_ID_KEY = 'santa-game-device-id';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem(DEVICE_ID_KEY);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }

    setDeviceId(id);
  }, []);

  return deviceId;
}
