"use client";

import { useState } from "react";
import { Upload, FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Activity } from "lucide-react";

interface LabMarker {
  name: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  category: "hormone" | "metabolic" | "cardiovascular" | "inflammatory" | "general";
  date: string;
}

interface LabReport {
  id: string;
  date: string;
  markers: LabMarker[];
  notes?: string;
  activeCycles?: string[]; // Peptides active during this test
}

interface BloodworkAnalysis {
  marker: string;
  trend: "improving" | "declining" | "stable";
  changePercent: number;
  correlatedPeptides: string[];
  interpretation: string;
  recommendation: string;
}

export function BloodworkAI() {
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BloodworkAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Common lab markers with reference ranges
  const commonMarkers = {
    testosterone: { name: "Testosterone", unit: "ng/dL", range: { min: 300, max: 1000 }, category: "hormone" as const },
    estradiol: { name: "Estradiol", unit: "pg/mL", range: { min: 10, max: 40 }, category: "hormone" as const },
    igf1: { name: "IGF-1", unit: "ng/mL", range: { min: 115, max: 307 }, category: "hormone" as const },
    ghk: { name: "GHK", unit: "ng/mL", range: { min: 50, max: 200 }, category: "hormone" as const },
    glucose: { name: "Glucose", unit: "mg/dL", range: { min: 70, max: 100 }, category: "metabolic" as const },
    hba1c: { name: "HbA1c", unit: "%", range: { min: 4, max: 5.6 }, category: "metabolic" as const },
    cholesterol: { name: "Total Cholesterol", unit: "mg/dL", range: { min: 125, max: 200 }, category: "cardiovascular" as const },
    hdl: { name: "HDL", unit: "mg/dL", range: { min: 40, max: 60 }, category: "cardiovascular" as const },
    ldl: { name: "LDL", unit: "mg/dL", range: { min: 0, max: 100 }, category: "cardiovascular" as const },
    crp: { name: "C-Reactive Protein", unit: "mg/L", range: { min: 0, max: 3 }, category: "inflammatory" as const },
    il6: { name: "IL-6", unit: "pg/mL", range: { min: 0, max: 5 }, category: "inflammatory" as const },
  };

  const [newMarkers, setNewMarkers] = useState<Partial<LabMarker>[]>([
    { name: "Testosterone", unit: "ng/dL", category: "hormone" },
  ]);

  const addLabReport = () => {
    const report: LabReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      markers: newMarkers.filter((m) => m.value) as LabMarker[],
      activeCycles: [], // TODO: Pull from active cycles
    };

    setLabReports([report, ...labReports]);
    setNewMarkers([{ name: "Testosterone", unit: "ng/dL", category: "hormone" }]);
  };

  const analyzeResults = async () => {
    if (labReports.length < 2) return;

    setIsAnalyzing(true);

    // Simulate AI analysis (in production, call API)
    setTimeout(() => {
      const mockAnalysis: BloodworkAnalysis[] = [
        {
          marker: "Testosterone",
          trend: "improving",
          changePercent: 15,
          correlatedPeptides: ["HCG", "Enclomiphene"],
          interpretation:
            "Testosterone levels increased by 15% since starting HCG protocol. Within optimal range.",
          recommendation: "Continue current protocol. Consider maintenance phase after 12 weeks.",
        },
        {
          marker: "IGF-1",
          trend: "stable",
          changePercent: 2,
          correlatedPeptides: ["CJC-1295", "Ipamorelin"],
          interpretation:
            "IGF-1 levels remain stable and within healthy range. Growth hormone secretagogue protocol maintaining baseline.",
          recommendation:
            "Monitor for another 4 weeks. May need dosage adjustment if no increase.",
        },
      ];

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getMarkerStatus = (marker: LabMarker) => {
    const { value, referenceRange } = marker;
    if (value < referenceRange.min) return "low";
    if (value > referenceRange.max) return "high";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-blue-500";
      case "high":
        return "text-red-500";
      case "normal":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">BloodworkAI</h2>
          <p className="text-sm text-muted-foreground">
            Analyze lab results and correlate with peptide cycles
          </p>
        </div>
        <button
          onClick={analyzeResults}
          disabled={labReports.length < 2 || isAnalyzing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze Trends"}
        </button>
      </div>

      {/* Upload Lab Results */}
      <div className="border-2 border-dashed rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold">Add Lab Results</h3>
            <p className="text-sm text-muted-foreground">
              Enter bloodwork markers manually or upload lab report
            </p>
          </div>
        </div>

        {/* Marker Input */}
        <div className="space-y-4">
          {newMarkers.map((marker, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3">
              <select
                value={marker.name}
                onChange={(e) => {
                  const selected = commonMarkers[e.target.value as keyof typeof commonMarkers];
                  const updated = [...newMarkers];
                  updated[idx] = {
                    name: selected.name,
                    unit: selected.unit,
                    category: selected.category,
                    referenceRange: selected.range,
                    date: new Date().toISOString().split("T")[0],
                  };
                  setNewMarkers(updated);
                }}
                className="px-3 py-2 border rounded-lg col-span-2"
              >
                {Object.entries(commonMarkers).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Value"
                value={marker.value || ""}
                onChange={(e) => {
                  const updated = [...newMarkers];
                  updated[idx].value = parseFloat(e.target.value);
                  setNewMarkers(updated);
                }}
                className="px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                value={marker.unit}
                disabled
                className="px-3 py-2 border rounded-lg bg-muted"
              />

              <button
                onClick={() => {
                  if (idx === newMarkers.length - 1 && marker.value) {
                    setNewMarkers([
                      ...newMarkers,
                      { name: "Testosterone", unit: "ng/dL", category: "hormone" },
                    ]);
                  } else {
                    setNewMarkers(newMarkers.filter((_, i) => i !== idx));
                  }
                }}
                className="px-3 py-2 border rounded-lg hover:bg-accent"
              >
                {idx === newMarkers.length - 1 && marker.value ? "+" : "−"}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addLabReport}
          disabled={newMarkers.filter((m) => m.value).length === 0}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          Save Lab Report
        </button>
      </div>

      {/* Lab Reports History */}
      {labReports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lab History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labReports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {report.markers.length} markers
                  </span>
                </div>

                <div className="space-y-2">
                  {report.markers.slice(0, 3).map((marker) => {
                    const status = getMarkerStatus(marker);
                    return (
                      <div key={marker.name} className="flex items-center justify-between text-sm">
                        <span>{marker.name}</span>
                        <span className={getStatusColor(status)}>
                          {marker.value} {marker.unit}
                        </span>
                      </div>
                    );
                  })}
                  {report.markers.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{report.markers.length - 3} more markers
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            AI Analysis & Correlations
          </h3>
          <div className="space-y-4">
            {analysis.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{item.marker}</h4>
                    {getTrendIcon(item.trend)}
                    <span
                      className={`text-sm font-medium ${
                        item.changePercent > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.changePercent > 0 ? "+" : ""}
                      {item.changePercent}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {item.correlatedPeptides.map((peptide) => (
                      <span
                        key={peptide}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                      >
                        {peptide}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <p className="text-sm">{item.interpretation}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {labReports.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No lab reports yet. Add your first bloodwork results above.</p>
        </div>
      )}
    </div>
  );
}
