import { AppState, BackupSnapshot } from '../types';
import { exportFullAppStateToJson } from './exportData';

const MAX_SNAPSHOTS = 12;

export interface AutoBackupResult {
  triggered: boolean;
  backupDate?: string;
  updatedSnapshots?: BackupSnapshot[];
}

/**
 * Checks if 7 days have passed since the last automated backup,
 * and if so, performs a local snapshot + triggers a local file download.
 */
export function checkAndRunWeeklyAutoBackup(
  currentState: AppState,
  forceNow: boolean = false
): AutoBackupResult {
  const settings = currentState.autoBackupSettings || {
    enabled: true,
    frequencyDays: 7,
    autoSaveToDownloads: true,
  };

  if (!settings.enabled && !forceNow) {
    return { triggered: false };
  }

  const now = Date.now();
  const frequencyMs = (settings.frequencyDays || 7) * 24 * 60 * 60 * 1000;
  const lastDate = settings.lastBackupDate ? new Date(settings.lastBackupDate).getTime() : 0;
  const shouldRun = forceNow || lastDate === 0 || now - lastDate >= frequencyMs;

  if (!shouldRun) {
    return { triggered: false };
  }

  // 1. Create timestamped snapshot
  const snapshotDate = new Date().toISOString();
  const snapshot: BackupSnapshot = {
    id: `backup-snap-${now}`,
    date: snapshotDate,
    timestamp: now,
    description: forceNow
      ? `Manual Local Backup (${new Date().toLocaleDateString()})`
      : `Weekly Automated Backup (${new Date().toLocaleDateString()})`,
    state: JSON.parse(JSON.stringify(currentState)),
  };

  const existingSnapshots = currentState.backupSnapshots || [];
  const updatedSnapshots = [snapshot, ...existingSnapshots].slice(0, MAX_SNAPSHOTS);

  // 2. Trigger download of JSON to local downloads / filesystem path
  if (settings.autoSaveToDownloads !== false || forceNow) {
    try {
      exportFullAppStateToJson(currentState);
    } catch (err) {
      console.warn('Auto backup download trigger failed:', err);
    }
  }

  return {
    triggered: true,
    backupDate: snapshotDate,
    updatedSnapshots,
  };
}

/**
 * Attempts to write backup file using File System Access API if supported and granted.
 */
export async function saveToFileSystemDirectory(
  state: AppState,
  dirHandle: any
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `obaslord-finance-backup-${timestamp}.json`;
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    const backupData = {
      app: 'Obaslord Finance Tracker',
      version: '2.1',
      exportedAt: new Date().toISOString(),
      state,
    };
    await writable.write(JSON.stringify(backupData, null, 2));
    await writable.close();
    return true;
  } catch (err) {
    console.error('Failed to write to file system directory', err);
    return false;
  }
}
