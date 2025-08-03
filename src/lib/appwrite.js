import { Account, Client, Databases, Storage, ID } from "appwrite";

const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT_URL,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  productsCollectionId: import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID,
  categoriesCollectionId: import.meta.env
    .VITE_APPWRITE_CATEGORIES_COLLECTION_ID,
  storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, appwriteConfig };
