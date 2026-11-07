import { execSync } from 'child_process';
import { Firestore } from '@google-cloud/firestore';
import { OAuth2Client } from 'google-auth-library';
import { setFirestore } from './reed-log.ts';

// Local scripts authenticate with the active gcloud user. Cloud Run uses the
// runtime service account through Application Default Credentials.
export function useGcloudFirestore() {
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
  const authClient = new OAuth2Client();
  authClient.setCredentials({ access_token: token });
  setFirestore(
    new Firestore({
      projectId: 'unreed',
      databaseId: '(default)',
      authClient,
    }),
  );
}
