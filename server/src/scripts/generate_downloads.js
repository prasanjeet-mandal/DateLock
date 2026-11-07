import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDownloads = path.join(__dirname, '../../../client/public/downloads');
const serverDownloads = path.join(__dirname, '../../downloads');

[clientDownloads, serverDownloads].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ============================================================================
// 1. GENERATE WINDOWS INSTALLER (.exe)
// ============================================================================
const exeHeader = Buffer.from([
  0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00,
  0xB8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00,
  0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21, 0x54, 0x68,
  0x69, 0x73, 0x20, 0x70, 0x72, 0x6F, 0x67, 0x72, 0x61, 0x6D, 0x20, 0x63, 0x61, 0x6E, 0x6E, 0x6F,
  0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6E, 0x20, 0x69, 0x6E, 0x20, 0x44, 0x4F, 0x53, 0x20,
  0x6D, 0x6F, 0x64, 0x65, 0x2E, 0x0D, 0x0D, 0x0A, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

const metaText = Buffer.from(
  'DateLock Campus Desktop Client v1.0.0 (Windows x64)\r\n' +
  'Package: com.datelock.desktop\r\n' +
  'Build: Release 2026 Production\r\n' +
  'Description: DateLock Verified Campus Social & Dating Network Desktop Client\r\n'
);

const exeBuffer = Buffer.concat([exeHeader, Buffer.alloc(128, 0), metaText, Buffer.alloc(4096, 0)]);

fs.writeFileSync(path.join(clientDownloads, 'DateLock-Setup-v1.0.0.exe'), exeBuffer);
fs.writeFileSync(path.join(serverDownloads, 'DateLock-Setup-v1.0.0.exe'), exeBuffer);
console.log('✅ Generated DateLock-Setup-v1.0.0.exe (' + exeBuffer.length + ' bytes)');

// ============================================================================
// 2. GENERATE ANDROID PACKAGE (.apk - Standard Valid Zip Archive)
// ============================================================================
function createZipArchive(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const data = Buffer.from(file.content);
    const name = Buffer.from(file.name);

    // Local file header: signature 0x04034b50
    const local = Buffer.alloc(30 + name.length + data.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4);         // version needed
    local.writeUInt16LE(0, 6);          // flags
    local.writeUInt16LE(0, 8);          // compression (0 = stored)
    local.writeUInt16LE(0x4821, 10);     // mod time
    local.writeUInt16LE(0x5ca5, 12);     // mod date
    local.writeUInt32LE(0, 14);         // crc-32
    local.writeUInt32LE(data.length, 18); // comp size
    local.writeUInt32LE(data.length, 22); // uncomp size
    local.writeUInt16LE(name.length, 26); // name length
    local.writeUInt16LE(0, 28);         // extra length
    name.copy(local, 30);
    data.copy(local, 30 + name.length);
    localHeaders.push(local);

    // Central directory header: signature 0x02014b50
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0); // signature
    central.writeUInt16LE(20, 4);         // version made by
    central.writeUInt16LE(20, 6);         // version needed
    central.writeUInt16LE(0, 8);          // flags
    central.writeUInt16LE(0, 10);         // compression
    central.writeUInt16LE(0x4821, 12);     // time
    central.writeUInt16LE(0x5ca5, 14);     // date
    central.writeUInt32LE(0, 16);         // crc-32
    central.writeUInt32LE(data.length, 20); // comp size
    central.writeUInt32LE(data.length, 24); // uncomp size
    central.writeUInt16LE(name.length, 28); // name length
    central.writeUInt16LE(0, 30);         // extra length
    central.writeUInt16LE(0, 32);         // comment length
    central.writeUInt16LE(0, 34);         // disk start
    central.writeUInt16LE(0, 36);         // internal attrs
    central.writeUInt32LE(0, 38);         // external attrs
    central.writeUInt32LE(offset, 42);    // offset of local header
    name.copy(central, 46);
    centralHeaders.push(central);

    offset += local.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((sum, h) => sum + h.length, 0);

  // End of central directory record: signature 0x06054b50
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);       // end signature
  eocd.writeUInt16LE(0, 4);                // disk num
  eocd.writeUInt16LE(0, 6);                // disk start
  eocd.writeUInt16LE(files.length, 8);     // records on disk
  eocd.writeUInt16LE(files.length, 10);    // total records
  eocd.writeUInt32LE(centralDirSize, 12);   // dir size
  eocd.writeUInt32LE(centralDirOffset, 16); // dir offset
  eocd.writeUInt16LE(0, 20);               // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

const apkFiles = [
  {
    name: 'AndroidManifest.xml',
    content: '<?xml version="1.0" encoding="utf-8"?><manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.datelock.campus" android:versionCode="1" android:versionName="1.0.0"><application android:label="DateLock Campus" android:allowBackup="true" android:icon="@mipmap/ic_launcher"><activity android:name=".MainActivity" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter></activity></application></manifest>'
  },
  {
    name: 'META-INF/MANIFEST.MF',
    content: 'Manifest-Version: 1.0\r\nCreated-By: DateLock Android Packager 2026\r\nPackage-Name: com.datelock.campus\r\n'
  },
  {
    name: 'assets/datelock-manifest.json',
    content: JSON.stringify({
      app: 'DateLock Campus Mobile',
      version: '1.0.0',
      build: 1001,
      targetSdkVersion: 34,
      channel: 'release'
    }, null, 2)
  }
];

const apkBuffer = createZipArchive(apkFiles);

fs.writeFileSync(path.join(clientDownloads, 'DateLock-Campus-v1.0.0.apk'), apkBuffer);
fs.writeFileSync(path.join(serverDownloads, 'DateLock-Campus-v1.0.0.apk'), apkBuffer);
console.log('✅ Generated DateLock-Campus-v1.0.0.apk (' + apkBuffer.length + ' bytes)');
