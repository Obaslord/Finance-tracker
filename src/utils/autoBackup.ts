import { AppState, BackupSnapshot } from '../types';
import { exportStateToJson } from './exportData';

export function checkAndRunWeeklyAutoBackup(state: AppState): {
  triggered: boolean;
  backupDate?: string;
  updatedSnapshots?: BackupSnapshot[];
} {
  const settings = state.autoBackupSettings || {
    enabled: true,
    frequencyDays: 7,
    autoSaveToDownloads: true,
  };

  if (!settings.enabled) {
    return { triggered: false };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const lastBackupStr = settings.lastBackupDate;

  if (lastBackupStr) {
    const lastDate = new Date(lastBackupStr).getTime();
    const intervalMs = (settings.frequencyDays || 7) * 24 * 60 * 60 * 1000;
    if (now.getTime() - lastDate < intervalMs) {
      return { triggered: false };
    }
  }

  // Create snapshot
  const snapshot: BackupSnapshot = {
    id: `snap_${Date.now()}`,
    date: nowIso,
    timestamp: now.getTime(),
    description: `Automated weekly backup (${now.toLocaleDateString()})`,
    state: JSON.parse(JSON.stringify(state)),
  };

  const existingSnapshots = state.backupSnapshots || [];
  // Keep last 10 snapshots max
  const updatedSnapshots = [snapshot, ...existingSnapshots].slice(0, 10);

  if (settings.autoSaveToDownloads) {
    try {
      exportStateToJson(state);
    } catch (err) {
      console.warn('Auto download was blocked or failed:', err);
    }
  }

  return {
    triggered: true,
    backupDate: nowIso,
    updatedSnapshots,
  };
}
