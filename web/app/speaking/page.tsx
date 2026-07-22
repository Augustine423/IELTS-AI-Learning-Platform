import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';

export default async function SpeakingPage() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return (
    <App
      appConfig={appConfig}
      welcomeVariant="speaking"
      initialPreferences={{ mode: 'speaking' }}
    />
  );
}
