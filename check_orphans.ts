import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkOrphanedData() {
  const tenantsSnap = await getDocs(collection(db, 'tenants'));
  const tenantIds = new Set(tenantsSnap.docs.map(d => d.id));
  
  const casesSnap = await getDocs(collection(db, 'cases'));
  const orphanedCases = casesSnap.docs.filter(d => !tenantIds.has(d.data().tenantId));
  
  console.log(`Total Tenants: ${tenantsSnap.size}`);
  console.log(`Total Cases: ${casesSnap.size}`);
  console.log(`Orphaned Cases: ${orphanedCases.length}`);
  
  if (orphanedCases.length > 0) {
    console.log('Sample orphaned case tenantId:', orphanedCases[0].data().tenantId);
  }
}

checkOrphanedData();
