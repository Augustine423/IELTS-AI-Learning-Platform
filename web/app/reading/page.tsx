import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';

export default async function ReadingPage() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return (
    <App
      appConfig={appConfig}
      welcomeVariant="reading"
      initialPreferences={{ mode: 'reading' }}
    />
  );
}
