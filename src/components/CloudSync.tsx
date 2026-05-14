import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

export default function CloudSync() {
  const store = useStore();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const performSync = async (isAuto = false) => {
    if (syncing) return;
    setSyncing(true);
    try {
      const dataToSync = {
        classes: store.classes,
        students: store.students,
        weekly: store.weeklyScores,
        sas: store.sasScores,
        practice: store.practiceScores,
        asaj: store.asajScores
      };

      // Save each table to D1
      for (const [key, data] of Object.entries(dataToSync)) {
        await fetch(getApiUrl('/api/sync'), {
          method: 'POST',
          body: JSON.stringify({ key, data }),
        });
      }

      setLastSync(new Date());
      if (!isAuto) toast.success('Data tersinkronisasi ke Cloud!');
    } catch (err) {
      console.error(err);
      if (!isAuto) toast.error('Gagal sinkronisasi ke Cloud');
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-sync if we have data to sync
      if (store.classes.length > 0) {
        performSync(true);
      }
    }, 3000); // Wait 3 seconds after last change

    return () => clearTimeout(timer);
  }, [store.classes, store.students, store.weeklyScores, store.sasScores, store.practiceScores, store.asajScores]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md">
      <div className={`p-1.5 rounded-full ${lastSync ? 'bg-emerald-100/50 text-emerald-600' : 'bg-blue-100/50 text-blue-600'}`}>
        {lastSync ? <Cloud size={14} /> : <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />}
      </div>
      <div className="hidden xl:block min-w-[70px]">
        <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5 tracking-tighter">Cloud Sync</p>
        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 leading-none truncate">
          {syncing ? 'Syncing...' : lastSync ? lastSync.toLocaleTimeString() : 'Ready'}
        </p>
      </div>
      <button 
        onClick={performSync}
        disabled={syncing}
        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-all text-gray-500 active:scale-95"
        title="Sync to Cloud"
      >
        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
