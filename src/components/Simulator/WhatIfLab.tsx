import React, { useState } from 'react';
import { CloudProvider } from '../../types';
import { Sliders, AlertTriangle, TrendingUp, DollarSign, Database, Server, Cpu } from 'lucide-react';

export const WhatIfLab: React.FC = () => {
  const [eps, setEps] = useState<number>(25000);
  const [payloadSize, setPayloadSize] = useState<number>(2.0); // KB
  const [batchInterval, setBatchInterval] = useState<number>(60); // Seconds
  const [retentionDays, setRetentionDays] = useState<number>(90);

  // Computations
  const ingressMbPerSec = (eps * payloadSize) / 1024;
  const gbPerMonth = (ingressMbPerSec * 86400 * 30.5) / 1024;
  const tbPerMonth = gbPerMonth / 1024;

  // AWS Cost Model (Kinesis + Firehose + S3 + Athena)
  const awsShards = Math.ceil(ingressMbPerSec / 1);
  const awsKinesisCost = awsShards * 0.015 * 730 + (eps * 86400 * 30.5 * 0.014) / 1000000;
  const awsS3Cost = gbPerMonth * 0.023 * (retentionDays / 30.5) * 0.25; // with parquet snappy compression 0.25
  const awsFirehoseCost = gbPerMonth * 0.029;
  const awsTotalCost = Math.round(awsKinesisCost + awsS3Cost + awsFirehoseCost + 20);

  // GCP Cost Model (Pub/Sub + Dataflow + GCS + BigQuery)
  const gcpPubSubCost = tbPerMonth * 40;
  const gcpGcsCost = gbPerMonth * 0.020 * (retentionDays / 30.5) * 0.25;
  const gcpDataflowCost = (eps / 10000) * 45;
  const gcpTotalCost = Math.round(gcpPubSubCost + gcpGcsCost + gcpDataflowCost + 15);

  // Azure Cost Model (Event Hubs + Fabric + ADLS + Warehouse)
  const azureEventHubTus = Math.ceil(ingressMbPerSec / 1);
  const azureEventHubCost = azureEventHubTus * 0.03 * 730;
  const azureAdlsCost = gbPerMonth * 0.018 * (retentionDays / 30.5) * 0.25;
  const azureFabricCost = (eps / 10000) * 52;
  const azureTotalCost = Math.round(azureEventHubCost + azureAdlsCost + azureFabricCost + 25);

  // Open Source (3x Kafka VM + Flink VM + MinIO)
  const ossVmCost = 3 * 25 + 40; // 3 kafka nodes + 1 flink
  const ossStorageCost = gbPerMonth * 0.008 * (retentionDays / 30.5) * 0.25;
  const ossTotalCost = Math.round(ossVmCost + ossStorageCost);

  // Bottleneck detection
  const hasSmallFilesRisk = batchInterval < 10 && eps > 10000;
  const hasHighThroughput = eps > 50000;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 md:p-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            🎛️ "What-If" Kapasite & Maliyet Simülatörü
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            İş yükü parametrelerini değiştirin; bulutlar arası TCO (Total Cost of Ownership), kaynak ihtiyacı ve darboğazları anlık görün
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold whitespace-nowrap">
            Giriş Veri Hızı: {ingressMbPerSec.toFixed(2)} MB/s
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold whitespace-nowrap">
            Aylık Hacim: {tbPerMonth.toFixed(2)} TB
          </span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        
        {/* Slider 1: EPS */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Akış Hızı (EPS):</span>
            <span className="font-bold text-blue-400">{eps.toLocaleString('tr-TR')} eps</span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1k</span>
            <span>50k</span>
            <span>100k</span>
          </div>
        </div>

        {/* Slider 2: Payload Size */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Kayıt Boyutu (Payload):</span>
            <span className="font-bold text-indigo-400">{payloadSize.toFixed(1)} KB</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={payloadSize}
            onChange={(e) => setPayloadSize(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0.5 KB</span>
            <span>5.0 KB</span>
            <span>10.0 KB</span>
          </div>
        </div>

        {/* Slider 3: Batch Window */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Micro-batch Penceresi:</span>
            <span className="font-bold text-purple-400">{batchInterval} Saniye</span>
          </div>
          <input
            type="range"
            min="1"
            max="300"
            step="5"
            value={batchInterval}
            onChange={(e) => setBatchInterval(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>1 sn</span>
            <span>60 sn</span>
            <span>300 sn</span>
          </div>
        </div>

        {/* Slider 4: Retention */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Veri Saklama (Retention):</span>
            <span className="font-bold text-pink-400">{retentionDays} Gün</span>
          </div>
          <input
            type="range"
            min="7"
            max="365"
            step="7"
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>7 gün</span>
            <span>90 gün</span>
            <span>365 gün</span>
          </div>
        </div>

      </div>

      {/* Warnings / Bottlenecks Banner */}
      {(hasSmallFilesRisk || hasHighThroughput) && (
        <div className="mb-6 space-y-2">
          {hasSmallFilesRisk && (
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center gap-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <b>⚠️ Sınav Klasiği: "Small Files Problem" Riski!</b> Micro-batch penceresi {batchInterval} sn gibi çok düşük tutulduğunda göle saniyede binlerce ufak dosya yazılır. Bu durum S3 PUT API faturalarını katlar ve Athena sorgularını aşırı yavaşlatır. <i>Öneri: Firehose buffer en az 60 sn veya 64 MB yapılmalıdır.</i>
              </div>
            </div>
          )}

          {hasHighThroughput && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <b>⚡ Yüksek Verim Uyarısı:</b> {eps.toLocaleString('tr-TR')} eps üzerinde Kinesis On-Demand veya en az {awsShards} provisioned shard gerekir. Kafka tarafında ise en az {Math.ceil(eps / 3000)} partition açılmalıdır.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Cost Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        
        {/* AWS Card */}
        <div className="bg-slate-950/80 border-2 border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">AWS Toplam TCO</span>
              <span className="text-base">📦</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              ${awsTotalCost} <span className="text-xs font-normal text-slate-400">/ay</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>Kinesis ({awsShards} Shard):</span>
                <span className="text-slate-200">${Math.round(awsKinesisCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>S3 Parquet Depolama:</span>
                <span className="text-slate-200">${Math.round(awsS3Cost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Firehose Iceberg Sink:</span>
                <span className="text-slate-200">${Math.round(awsFirehoseCost)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-semibold">
            Serverless & Tam Yönetilen
          </div>
        </div>

        {/* GCP Card */}
        <div className="bg-slate-950/80 border-2 border-blue-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">GCP Toplam TCO</span>
              <span className="text-base">🌐</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              ${gcpTotalCost} <span className="text-xs font-normal text-slate-400">/ay</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>Pub/Sub Ingress ({tbPerMonth.toFixed(1)} TB):</span>
                <span className="text-slate-200">${Math.round(gcpPubSubCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Storage BigLake:</span>
                <span className="text-slate-200">${Math.round(gcpGcsCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dataflow Streaming vCPU:</span>
                <span className="text-slate-200">${Math.round(gcpDataflowCost)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-blue-400 font-semibold">
            Sıfır Partition Yönetimi
          </div>
        </div>

        {/* Azure Card */}
        <div className="bg-slate-950/80 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Azure Fabric TCO</span>
              <span className="text-base">🔷</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              ${azureTotalCost} <span className="text-xs font-normal text-slate-400">/ay</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>Event Hubs ({azureEventHubTus} TU):</span>
                <span className="text-slate-200">${Math.round(azureEventHubCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>OneLake Delta Depolama:</span>
                <span className="text-slate-200">${Math.round(azureAdlsCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fabric Kapasitesi (CU):</span>
                <span className="text-slate-200">${Math.round(azureFabricCost)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-semibold">
            OneLake Birleşik SaaS Gölü
          </div>
        </div>

        {/* Open Source Card */}
        <div className="bg-slate-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Açık Kaynak (Self-Host)</span>
              <span className="text-base">🐧</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              ${ossTotalCost} <span className="text-xs font-normal text-slate-400">/ay</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <div className="flex justify-between">
                <span>3x Kafka Broker VM:</span>
                <span className="text-slate-200">$75</span>
              </div>
              <div className="flex justify-between">
                <span>1x Flink Worker VM:</span>
                <span className="text-slate-200">$40</span>
              </div>
              <div className="flex justify-between">
                <span>MinIO Blok Disk:</span>
                <span className="text-slate-200">${Math.round(ossStorageCost)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
            *Yazılım Lisansı $0, DevOps Emeği Yüksek
          </div>
        </div>

      </div>

    </div>
  );
};
