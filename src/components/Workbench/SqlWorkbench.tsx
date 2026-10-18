import React, { useState } from 'react';
import { Terminal, Play, CheckCircle, Database, Layers, Sparkles } from 'lucide-react';

interface QueryPreset {
  id: string;
  name: string;
  layer: 'Bronze' | 'Silver' | 'Gold' | 'CDC';
  description: string;
  sql: string;
  results: {
    columns: string[];
    rows: (string | number)[][];
    executionTimeMs: number;
  };
}

const queryPresets: QueryPreset[] = [
  {
    id: 'silver-dedup',
    name: 'Silver Katmanı: Yinelenenleri Ayıklama & Deduplication',
    layer: 'Silver',
    description: 'Ham Bronze verisinden aynı event_id ile birden fazla gelen kayıtları tekilleştirir.',
    sql: `-- Spark SQL / DuckDB: Window Function ile Deduplication
WITH ranked_events AS (
  SELECT 
    event_id,
    device_id,
    amount,
    currency,
    event_timestamp,
    ROW_NUMBER() OVER (
      PARTITION BY event_id 
      ORDER BY event_timestamp DESC
    ) AS row_num
  FROM bronze_pos_transactions
)
SELECT 
  event_id, device_id, amount, currency, event_timestamp
FROM ranked_events
WHERE row_num = 1;`,
    results: {
      columns: ['event_id', 'device_id', 'amount', 'currency', 'event_timestamp'],
      rows: [
        ['tx-98213', 'pos-ist-01', 420.50, 'TRY', '2026-10-01 10:45:12'],
        ['tx-98214', 'pos-ank-04', 1250.00, 'TRY', '2026-10-01 10:45:14'],
        ['tx-98215', 'pos-izm-09', 89.90, 'TRY', '2026-10-01 10:45:18'],
        ['tx-98216', 'pos-ist-02', 3100.00, 'TRY', '2026-10-01 10:45:21'],
      ],
      executionTimeMs: 24,
    },
  },
  {
    id: 'gold-mart',
    name: 'Gold Katmanı: Saatlik Satış ve Ülke Bazlı Ciro Agregasyonu',
    layer: 'Gold',
    description: 'İş zekası ve Power BI/Looker için optimize edilmiş boyutlu analitik metrikler.',
    sql: `-- BigQuery / Redshift / Snowflake: Saatlik Agregasyon
SELECT 
  DATE_TRUNC(event_timestamp, HOUR) AS transaction_hour,
  region,
  currency,
  COUNT(DISTINCT event_id) AS total_transactions,
  ROUND(SUM(amount), 2) AS total_revenue,
  ROUND(AVG(amount), 2) AS avg_ticket_size
FROM silver_pos_cleaned
GROUP BY 1, 2, 3
ORDER BY total_revenue DESC;`,
    results: {
      columns: ['transaction_hour', 'region', 'currency', 'total_transactions', 'total_revenue', 'avg_ticket_size'],
      rows: [
        ['2026-10-01 10:00:00', 'Marmara', 'TRY', 14200, 2489000.50, 175.28],
        ['2026-10-01 10:00:00', 'İç Anadolu', 'TRY', 9850, 1650400.00, 167.55],
        ['2026-10-01 10:00:00', 'Ege', 'TRY', 7600, 1280900.20, 168.53],
      ],
      executionTimeMs: 18,
    },
  },
  {
    id: 'iceberg-time-travel',
    name: 'Iceberg / Delta Lake: ACID Time-Travel Sorgusu',
    layer: 'CDC',
    description: 'Bir tablonun önceki snapshot veya timestamp anındaki durumunu sorgulama.',
    sql: `-- Apache Iceberg & Delta Lake Time-Travel
-- 2 saat önceki tablo durumunu sorgula:
SELECT 
  customer_id,
  account_tier,
  balance,
  _snapshot_id
FROM lakehouse.customer_balances
/* Delta Syntax: VERSION AS OF 14 */
/* Iceberg Syntax: FOR SYSTEM_TIME AS OF '2026-10-01 08:45:00' */
WHERE account_tier = 'ENTERPRISE'
LIMIT 5;`,
    results: {
      columns: ['customer_id', 'account_tier', 'balance', '_snapshot_id'],
      rows: [
        ['cust-001', 'ENTERPRISE', 1450000.00, 'snap_984102941'],
        ['cust-002', 'ENTERPRISE', 890000.50, 'snap_984102941'],
        ['cust-003', 'ENTERPRISE', 2410000.00, 'snap_984102941'],
      ],
      executionTimeMs: 12,
    },
  },
];

export const SqlWorkbench: React.FC = () => {
  const [activePreset, setActivePreset] = useState<QueryPreset>(queryPresets[0]);
  const [currentSql, setCurrentSql] = useState<string>(queryPresets[0].sql);
  const [executedResults, setExecutedResults] = useState(queryPresets[0].results);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectPreset = (preset: QueryPreset) => {
    setActivePreset(preset);
    setCurrentSql(preset.sql);
    setExecutedResults(preset.results);
  };

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setExecutedResults({
        ...activePreset.results,
        executionTimeMs: Math.floor(Math.random() * 20) + 10,
      });
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            💻 Data Engineering SQL & Lakehouse Workbench
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bronze, Silver, Gold katman dönüşümlerini, Deduplication ve Iceberg Time-Travel mantıklarını deneyimleyin
          </p>
        </div>

        {/* Presets Selector (Horizontally swipable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto">
          {queryPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                activePreset.id === preset.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>query.sql</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {activePreset.layer} Layer
            </span>
          </div>

          <button
            onClick={handleRunQuery}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Çalıştırılıyor...' : 'Sorguyu Çalıştır'}
          </button>
        </div>

        <textarea
          value={currentSql}
          onChange={(e) => setCurrentSql(e.target.value)}
          rows={7}
          className="w-full bg-slate-950 p-4 text-xs font-mono text-emerald-400 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Results Table */}
      <div className="flex-1 flex flex-col bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sorgu Başarıyla Çalıştı: <b className="text-slate-100">{executedResults.rows.length} Satır</b></span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            {executedResults.executionTimeMs} ms (In-Memory Engine) · <span className="text-emerald-400 font-sans">Tabloyu yana kaydırabilirsiniz →</span>
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold">
                {executedResults.columns.map((col) => (
                  <th key={col} className="px-4 py-2 font-mono text-[11px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {executedResults.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-900/40 text-slate-300">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-[11px] whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
