import { z } from "zod";

export type TableSamples = {
    id:                                      string,
    CBH_Donor_ID?:                           string,
    CBH_Master_ID?:                          string,
    CBH_Sample_ID?:                          string,
    Price?:                                  number,
    Quantity?:                               number,
    Unit?:                                   string,
    Matrix?:                                 string,
    Storage_Temperature?:                    string,
    Freeze_Thaw_Cycles?:                     number,
    Sample_Condition?:                       string,
    Infectious_Disease_Test_Result?:         string,
    Gender?:                                 string,
    Age?:                                    number,
    Ethnicity?:                              string,
    BMI?:                                    number,
    Lab_Parameter?:                          string[],
    Result_Interpretation?:                  string[],
    Result_Raw?:                             string[],
    Result_Numerical?:                       number[],
    Result_Unit?:                            string[],
    Cut_Off_Raw?:                            string[],
    Cut_Off_Numerical?:                      number[],
    Test_Method?:                            string[],
    Test_System?:                            string[],
    Test_System_Manufacturer?:               string[],
    Result_Obtained_From?:                   string[],
    Diagnosis?:                              string[],
    Diagnosis_Remarks?:                      string[],
    ICD_Code?:                               string[],
    Pregnancy_Week?:                         number,
    Pregnancy_Trimester?:                    string,
    Medication?:                             string[],
    Therapy?:                                string[],
    Histological_Diagnosis?:                 string[],
    Organ?:                                  string,
    Disease_Presentation?:                   string,
    TNM_Class_T?:                            string,
    TNM_Class_N?:                            string,
    TNM_Class_M?:                            string,
    Tumour_Grade?:                           string,
    Tumour_Stage?:                           string,
    Viable_Cells__per_?:                     string,
    Necrotic_Cells__per_?:                   string,
    Tumour_Cells__per_ ?:                    string,
    Proliferation_Rate__Ki67_per_?:          string,
    Estrogen_Receptor?:                      string,
    Progesteron_Receptor?:                   string,
    HER_2_Receptor?:                         string,
    Other_Gene_Mutations?:                   string[],
    Country_of_Collection?:                  string,
    Date_of_Collection?:                     Date,
    Procurement_Type?:                       string,
    Informed_Consent?:                       string,
  }

export const MappingsSchema = z.object({
    
    CBH_Donor_ID:                           z.string(),
    CBH_Master_ID:                          z.string(),
    CBH_Sample_ID:                          z.string(),
    Price:                                  z.number(),
    Quantity:                               z.number(),
    Unit:                                   z.string(),
    Matrix:                                 z.string(),
    Storage_Temperature:                    z.string(),
    Freeze_Thaw_Cycles:                     z.number(),
    Sample_Condition:                       z.string(),
    Infectious_Disease_Test_Result:         z.string(),
    Gender:                                 z.string(),
    Age:                                    z.number(),
    Ethnicity:                              z.string(),
    BMI:                                    z.number(),
    Lab_Parameter:                          z.string().array(),
    Result_Interpretation:                  z.string().array(),
    Result_Raw:                             z.string().array(),
    Result_Numerical:                       z.number().array(),
    Result_Unit:                            z.string().array(),
    Cut_Off_Raw:                            z.string().array(),
    Cut_Off_Numerical:                      z.number().array(),
    Test_Method:                            z.string().array(),
    Test_System:                            z.string().array(),
    Test_System_Manufacturer:               z.string().array(),
    Result_Obtained_From:                   z.string().array(),
    Diagnosis:                              z.string().array(),
    Diagnosis_Remarks:                      z.string().array(),
    ICD_Code:                               z.string().array(),
    Pregnancy_Week:                         z.number(),
    Pregnancy_Trimester:                    z.string(),
    Medication:                             z.string().array(),
    Therapy:                                z.string().array(),
    Histological_Diagnosis:                 z.string().array(),
    Organ:                                  z.string(),
    Disease_Presentation:                   z.string(),
    TNM_Class_T:                            z.string(),
    TNM_Class_N:                            z.string(),
    TNM_Class_M:                            z.string(),
    Tumour_Grade:                           z.string(),
    Tumour_Stage:                           z.string(),
    Viable_Cells__per_:                     z.string(),
    Necrotic_Cells__per_:                   z.string(),
    Tumour_Cells__per_ :                    z.string(),
    Proliferation_Rate__Ki67_per_:          z.string(),
    Estrogen_Receptor:                      z.string(),
    Progesteron_Receptor:                   z.string(),
    HER_2_Receptor:                         z.string(),
    Other_Gene_Mutations:                   z.string().array(),
    Country_of_Collection:                  z.string(),
    Date_of_Collection:                     z.date(),
    Procurement_Type:                       z.string(),
    Informed_Consent:                       z.string(),
})

export type IMappings = z.infer<typeof MappingsSchema>
