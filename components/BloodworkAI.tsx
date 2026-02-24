"use client";

import { useState } from "react";
import { Upload, FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Activity, Trash2, Eye, Download, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LabReport {
  id: string;
  test_date: string;
  lab_name?: string;
  file_url?: string;
  markers: LabMarker[];
  notes?: string;
}

interface LabMarker {
  marker_name: string;
  value: number;
  unit: string;
  reference_min?: number;
  reference_max?: number;
  category: string;
  is_flagged: boolean;
}

interface ExtractedData {
  markers: LabMarker[];
  test_date: string;
  lab_name?: string;
}

export function BloodworkAI() {
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeCategory = (category: string | null): string => {
    if (!category) return 'general';
    const normalized = category.toLowerCase().trim();
    const validCategories = ['hormone', 'metabolic', 'cardiovascular', 'inflammatory', 'liver', 'kidney', 'thyroid', 'vitamin', 'general'];
    if (validCategories.includes(normalized)) return normalized;
    if (normalized.includes('hormone') || normalized.includes('endocrine')) return 'hormone';
    if (normalized.includes('metabol')) return 'metabolic';
    if (normalized.includes('cardio') || normalized.includes('heart')) return 'cardiovascular';
    if (normalized.includes('inflam')) return 'inflammatory';
    if (normalized.includes('hepat') || normalized.includes('liver')) return 'liver';
    if (normalized.includes('renal') || normalized.includes('kidney')) return 'kidney';
    if (normalized.includes('thyroid')) return 'thyroid';
    if (normalized.includes('vitamin') || normalized.includes('nutrient')) return 'vitamin';
    return 'general';
  };

  // Load reports on mount
  const loadReports = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: reports } = await supabase
      .from('lab_reports')
      .select(`
        *,
        lab_markers (*)
      `)
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    if (reports) {
      setLabReports(reports.map(r => ({
        ...r,
        markers: r.lab_markers || []
      })));
    }
  };

  // Handle PDF upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload PDF to Supabase Storage
      const filename = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('lab-reports')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('lab-reports')
        .getPublicUrl(filename);

      // Send to API for extraction
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-lab-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract data');

      const extracted: ExtractedData = await response.json();
      
      // Store file URL with extracted data
      setExtractedData({ ...extracted, file_url: publicUrl } as any);
      setShowReviewModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Save reviewed data
  const saveLabReport = async () => {
    if (!extractedData) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert lab report
      const { data: report, error: reportError } = await supabase
        .from('lab_reports')
        .insert({
          user_id: user.id,
          test_date: extractedData.test_date,
          lab_name: extractedData.lab_name || null,
          file_url: (extractedData as any).file_url || null,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Insert markers
      const markers = extractedData.markers.map(m => ({
        report_id: report.id,
        ...m,
        category: normalizeCategory(m.category ?? null),
        unit: m.unit || '',
      }));

      const { error: markersError } = await supabase
        .from('lab_markers')
        .insert(markers);

      if (markersError) throw markersError;

      // Snapshot active cycles
      const { data: activeCycles } = await supabase
        .from('cycles')
        .select('id, peptide_name, dose_amount, frequency_type')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (activeCycles && activeCycles.length > 0) {
        const snapshots = activeCycles.map(cycle => ({
          report_id: report.id,
          cycle_id: cycle.id,
          peptide_name: cycle.peptide_name,
          dosage: parseFloat(cycle.dose_amount) || 0,
          dosage_unit: 'mg',
          frequency: cycle.frequency_type,
        }));

        await supabase.from('lab_active_cycles').insert(snapshots);
      }

      // Reload reports
      await loadReports();
      setShowReviewModal(false);
      setExtractedData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    }
  };

  // Analyze trends
  const analyzeTrends = async () => {
    if (labReports.length < 2) {
      setError('Need at least 2 lab reports to analyze trends');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // TODO: Call AI analysis API
      // For now, just show placeholder
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (isF: boolean) => isF ? "text-red-500" : "text-green-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">BloodworkAI</h2>
          <p className="text-sm text-muted-foreground">
            Upload lab PDFs • AI extracts markers • Analyze trends
          </p>
        </div>
        <button
          onClick={analyzeTrends}
          disabled={labReports.length < 2 || isAnalyzing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          {isAnalyzing ? "Analyzing..." : "Analyze Trends"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}

      {/* PDF Upload */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">
          {isUploading ? "Processing..." : "Upload Lab Report PDF"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Drag & drop or click to upload • AI will extract all markers automatically
        </p>
      </div>

      {/* Lab Reports Archive */}
      {labReports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lab History ({labReports.length} reports)
          </h3>
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
                    <span className="font-medium">
                      {new Date(report.test_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.file_url && (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-accent rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {report.markers.length} markers
                    </span>
                  </div>
                </div>

                {report.lab_name && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {report.lab_name}
                  </p>
                )}

                <div className="space-y-2">
                  {report.markers.slice(0, 3).map((marker) => (
                    <div key={marker.marker_name} className="flex items-center justify-between text-sm">
                      <span>{marker.marker_name}</span>
                      <span className={getStatusColor(marker.is_flagged)}>
                        {marker.value} {marker.unit}
                      </span>
                    </div>
                  ))}
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

      {/* Review Modal */}
      {showReviewModal && extractedData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Review Extracted Data</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setExtractedData(null);
                }}
                className="p-2 hover:bg-accent rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Test Date</label>
                  <input
                    type="date"
                    value={extractedData.test_date}
                    onChange={(e) => setExtractedData({ ...extractedData, test_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Lab Name (optional)</label>
                  <input
                    type="text"
                    value={extractedData.lab_name || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, lab_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-100"
                    placeholder="e.g., Quest Diagnostics"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Extracted Markers ({extractedData.markers.length})</h4>
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {extractedData.markers.map((marker, idx) => (
                    <div key={idx} className="border rounded-lg p-2 bg-muted/50 text-sm">
                      <span className="text-xs text-muted-foreground block">Marker</span>
                      <p className="font-medium truncate" title={marker.marker_name}>{marker.marker_name}</p>
                      <span className="text-xs text-muted-foreground block mt-1">Value</span>
                      <p className="font-medium">{marker.value} {marker.unit}</p>
                      <span className="text-xs text-muted-foreground block mt-1">Ref</span>
                      <p className="text-xs">
                        {marker.reference_min}-{marker.reference_max} {marker.unit}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${getStatusColor(marker.is_flagged)}`}>
                        {marker.is_flagged ? "Flagged" : "Normal"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setExtractedData(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLabReport}
                  className="flex-1 px-4 py-2 bg-green-500 text-black font-bold rounded-lg hover:bg-green-600"
                >
                  Save Lab Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {labReports.length === 0 && !isUploading && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No lab reports yet. Upload your first PDF above!</p>
        </div>
      )}
    </div>
  );
}
