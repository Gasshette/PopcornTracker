import { RESTDB_APIKEY, RESTDB_URL } from '../../const';
import { CategoryColors, StatusColors } from '../../types/Config';
import { DocumentResponse } from '../../types/Document';

/* Migration purpose: change the default color values for all the user if necessary
 ** Required because of modifications made to the chip style: darken and lighten mui function don't handle the previous value of 'var(--mui-palette-primary-main)'
 **/
export async function migrateDefaultConfigColors() {
  const response: Response = await fetch(`${RESTDB_URL}`, {
    headers: {
      'x-apikey': `${RESTDB_APIKEY}`,
    },
  });

  if (response.ok) {
    const documents: Array<DocumentResponse> = await response.json();

    const promises: Array<Promise<Response>> = [];
    documents.forEach((doc) => {
      const documentId = doc._id;
      // Update the colors to the default one if it still has the previous MUi default color of "var(--mui-palette-primary-main)"
      for (const [key, val] of Object.entries(doc.document.config.colors)) {
        console.log('doc:', documentId, '\nval:', val);
        if (!val.startsWith('#')) {
          doc.document.config.colors[key as keyof CategoryColors] = '#FFF';
        }
      }

      for (const [key, val] of Object.entries(doc.document.config.status)) {
        if (!val.startsWith('#')) {
          doc.document.config.status[key as keyof StatusColors] = '#FFF';
        }
      }

      doc.document.lastUpdated = new Date().toISOString();

      // Push the migrated document
      const promise = fetch(`${RESTDB_URL}/${documentId}`, {
        method: 'PATCH',
        headers: {
          'x-apikey': `${RESTDB_APIKEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document: doc.document }),
      });

      promises.push(promise);
    });

    const responses = await Promise.all(promises);
    const erroredUserIds: Array<string> = [];

    for (const response of responses) {
      if (!response.ok) {
        const doc: DocumentResponse = await response.json();
        erroredUserIds.push(doc.userId);
      }
    }

    if (erroredUserIds.length > 0) {
      console.warn(
        'Migration error for users:"',
        erroredUserIds.join('","'),
        '"'
      );
    } else {
      console.log('Migrations done successfully');
    }
  }
}
