import { openDB } from 'idb'

const DB_NAME = 'wc-fixture-db'
const STORE_NAME = 'simulations'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export async function saveSimulation(key: string, value: any) {
  const db = await getDB()
  await db.put(STORE_NAME, value, key)
}

export async function loadSimulation(key: string) {
  const db = await getDB()
  return db.get(STORE_NAME, key)
}

export async function clearSimulation(key: string) {
  const db = await getDB()
  return db.delete(STORE_NAME, key)
}
