// Fixed saveLabReport function for BloodworkAI-v2.tsx
// Replace the saveLabReport function (around line 118) with this:

const saveLabReport = async () => {
  if (!extractedData) return;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert each marker as a separate row in lab_results
    const labResults = extractedData.markers.map(m => ({
      user_id: user.id,
      test_date: extractedData.test_date,
      test_type: 'bloodwork', // default type
      lab_name: extractedData.lab_name || null,
      biomarker_name: m.marker_name, // map marker_name to biomarker_name
      value: m.value,
      unit: m.unit,
      reference_range_min: m.reference_min, // map reference_min to reference_range_min
      reference_range_max: m.reference_max, // map reference_max to reference_range_max
      file_url: (extractedData as any).file_url || null,
    }));

    const { error: resultsError } = await supabase
      .from('lab_results')
      .insert(labResults);

    if (resultsError) throw resultsError;

    // Reload reports
    await loadReports();
    setShowReviewModal(false);
    setExtractedData(null);
  } catch (err: any) {
    setError(err.message || 'Failed to save report');
  }
};
