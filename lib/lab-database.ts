import { createClient } from "@/lib/supabase/client";

export type TestType = "bloodwork" | "hormone_panel" | "metabolic" | "custom";

export interface LabResult {
  id: string;
  userId: string;
  testDate: string;
  testType: TestType;
  labName?: string;
  biomarkerName: string;
  value: number;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  notes?: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BiomarkerCategory {
  id: string;
  categoryName: string;
  biomarkerName: string;
  standardUnit?: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  referenceNotes?: string;
  createdAt: Date;
}

export interface SaveLabResultParams {
  testDate: string;
  testType: TestType;
  labName?: string;
  biomarkerName: string;
  value: number;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  notes?: string;
  fileUrl?: string;
}

export interface BiomarkerTrend {
  testDate: string;
  value: number;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
}

export interface OutOfRangeBiomarker {
  biomarkerName: string;
  testDate: string;
  value: number;
  unit: string;
  referenceRangeMin?: number;
  referenceRangeMax?: number;
  status: "low" | "high" | "normal";
}

// =====================================================
// BIOMARKER CATEGORIES (Reference data)
// =====================================================

export async function loadBiomarkerCategories(): Promise<BiomarkerCategory[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("biomarker_categories")
    .select("*")
    .order("category_name", { ascending: true })
    .order("biomarker_name", { ascending: true });

  if (error) {
    console.error("Error loading biomarker categories:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    categoryName: row.category_name,
    biomarkerName: row.biomarker_name,
    standardUnit: row.standard_unit,
    referenceRangeMin: row.reference_range_min,
    referenceRangeMax: row.reference_range_max,
    referenceNotes: row.reference_notes,
    createdAt: new Date(row.created_at),
  }));
}

export async function getBiomarkersByCategory(): Promise<Record<string, BiomarkerCategory[]>> {
  const categories = await loadBiomarkerCategories();
  
  return categories.reduce((acc, biomarker) => {
    if (!acc[biomarker.categoryName]) {
      acc[biomarker.categoryName] = [];
    }
    acc[biomarker.categoryName].push(biomarker);
    return acc;
  }, {} as Record<string, BiomarkerCategory[]>);
}

// =====================================================
// LAB RESULTS CRUD
// =====================================================

export async function loadLabResults(limit?: number): Promise<LabResult[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("lab_results")
    .select("*")
    .eq("user_id", user.id)
    .order("test_date", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading lab results:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    testDate: row.test_date,
    testType: row.test_type as TestType,
    labName: row.lab_name,
    biomarkerName: row.biomarker_name,
    value: row.value,
    unit: row.unit,
    referenceRangeMin: row.reference_range_min,
    referenceRangeMax: row.reference_range_max,
    notes: row.notes,
    fileUrl: row.file_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function saveLabResult(params: SaveLabResultParams): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const { error } = await supabase
      .from("lab_results")
      .insert({
        user_id: user.id,
        test_date: params.testDate,
        test_type: params.testType,
        lab_name: params.labName,
        biomarker_name: params.biomarkerName,
        value: params.value,
        unit: params.unit,
        reference_range_min: params.referenceRangeMin,
        reference_range_max: params.referenceRangeMax,
        notes: params.notes,
        file_url: params.fileUrl,
      });

    if (error) {
      console.error("Error saving lab result:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in saveLabResult:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteLabResult(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("lab_results")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting lab result:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// ANALYTICS & TRENDS
// =====================================================

export async function getBiomarkerTrend(
  biomarkerName: string,
  monthsBack: number = 12
): Promise<BiomarkerTrend[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_biomarker_trend", {
    user_id_input: user.id,
    biomarker_name_input: biomarkerName,
    months_back: monthsBack,
  });

  if (error) {
    console.error("Error getting biomarker trend:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    testDate: row.test_date,
    value: row.value,
    unit: row.unit,
    referenceRangeMin: row.reference_range_min,
    referenceRangeMax: row.reference_range_max,
  }));
}

export async function getOutOfRangeBiomarkers(
  daysBack: number = 90
): Promise<OutOfRangeBiomarker[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_out_of_range_biomarkers", {
    user_id_input: user.id,
    days_back: daysBack,
  });

  if (error) {
    console.error("Error getting out-of-range biomarkers:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    biomarkerName: row.biomarker_name,
    testDate: row.test_date,
    value: row.value,
    unit: row.unit,
    referenceRangeMin: row.reference_range_min,
    referenceRangeMax: row.reference_range_max,
    status: row.status as "low" | "high" | "normal",
  }));
}

export async function getRecentLabsByBiomarker(): Promise<Record<string, LabResult>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("lab_results")
    .select("*")
    .eq("user_id", user.id)
    .order("test_date", { ascending: false });

  if (error) {
    console.error("Error getting recent labs:", error);
    return {};
  }

  // Get most recent result for each biomarker
  const latestByBiomarker: Record<string, LabResult> = {};
  
  (data || []).forEach((row) => {
    if (!latestByBiomarker[row.biomarker_name]) {
      latestByBiomarker[row.biomarker_name] = {
        id: row.id,
        userId: row.user_id,
        testDate: row.test_date,
        testType: row.test_type,
        labName: row.lab_name,
        biomarkerName: row.biomarker_name,
        value: row.value,
        unit: row.unit,
        referenceRangeMin: row.reference_range_min,
        referenceRangeMax: row.reference_range_max,
        notes: row.notes,
        fileUrl: row.file_url,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    }
  });

  return latestByBiomarker;
}

// =====================================================
// FILE UPLOAD HELPERS
// =====================================================

export async function uploadLabReport(
  file: File,
  testDate: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${testDate}_${Date.now()}.${fileExt}`;
    const filePath = `lab-reports/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lab-reports")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("lab-reports")
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("Error in uploadLabReport:", err);
    return { success: false, error: String(err) };
  }
}
