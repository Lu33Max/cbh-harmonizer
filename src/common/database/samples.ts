import { z } from "zod";

export const SampleSchema = z.object({
    id:                             z.string(),
    CBH_Donor_ID:                   z.string().nullable(),
    CBH_Master_ID:                  z.string().nullable(),
    CBH_Sample_ID:                  z.string().nullable(),
    Price:                          z.number().nullable(),
    Quantity:                       z.number().nullable(),
    Unit:                           z.string().nullable(),
    Matrix:                         z.string().nullable(),
    Storage_Temperature:            z.string().nullable(),
    Freeze_Thaw_Cycles:             z.number().nullable(),
    Sample_Condition:               z.string().nullable(),
    Infectious_Disease_Test_Result: z.string().nullable(),
    Gender:                         z.string().nullable(),
    Age:                            z.number().nullable(),
    Ethnicity:                      z.string().nullable(),
    BMI:                            z.number().nullable(),
    Lab_Parameter:                  z.string().nullable(),
    Result_Interpretation:          z.string().nullable(),
    Result_Raw:                     z.string().nullable(),
    Result_Numerical:               z.number().nullable(),
    Result_Unit:                    z.string().nullable(),
    Cut_Off_Raw:                    z.string().nullable(),
    Cut_Off_Numerical:              z.number().nullable(),
    Test_Method:                    z.string().nullable(),
    Test_System:                    z.string().nullable(),
    Test_System_Manufacturer:       z.string().nullable(),
    Result_Obtained_From:           z.string().nullable(),
    Diagnosis:                      z.string().nullable(),
    Diagnosis_Remarks:              z.string().nullable(),
    ICD_Code:                       z.string().nullable(),
    Pregnancy_Week:                 z.number().nullable(),
    Pregnancy_Trimester:            z.string().nullable(),
    Medication:                     z.string().nullable(),
    Therapy:                        z.string().nullable(),
    Histological_Diagnosis:         z.string().nullable(),
    Organ:                          z.string().nullable(),
    Disease_Presentation:           z.string().nullable(),
    TNM_Class_T:                    z.string().nullable(),
    TNM_Class_N:                    z.string().nullable(),
    TNM_Class_M:                    z.string().nullable(),
    Tumour_Grade:                   z.string().nullable(),
    Tumour_Stage:                   z.string().nullable(),
    Viable_Cells__per_:             z.string().nullable(),
    Necrotic_Cells__per_:           z.string().nullable(),
    Tumour_Cells__per_:             z.string().nullable(),
    Proliferation_Rate__Ki67_per_:  z.string().nullable(),
    Estrogen_Receptor:              z.string().nullable(),
    Progesteron_Receptor:           z.string().nullable(),
    HER_2_Receptor:                 z.string().nullable(),
    Other_Gene_Mutations:           z.string().nullable(),
    Country_of_Collection:          z.string().nullable(),
    Date_of_Collection:             z.date().nullable(),
    Procurement_Type:               z.string().nullable(),
    Informed_Consent:               z.string().nullable(),
})

export type ISample = z.infer<typeof SampleSchema>

export const ExampleSample: ISample = {
    id: "string",
    CBH_Donor_ID:                   "string",
    CBH_Master_ID:                  "string",
    CBH_Sample_ID:                  "string",
    Price:                          0,
    Quantity:                       0,
    Unit:                           "string",
    Matrix:                         "string",
    Storage_Temperature:            "string",
    Freeze_Thaw_Cycles:             0,
    Sample_Condition:               "string",
    Infectious_Disease_Test_Result: "string",
    Gender:                         "string",
    Age:                            0,
    Ethnicity:                      "string",
    BMI:                            0,
    Lab_Parameter:                  "string",
    Result_Interpretation:          "string",
    Result_Raw:                     "string",
    Result_Numerical:               0,
    Result_Unit:                    "string",
    Cut_Off_Raw:                    "string",
    Cut_Off_Numerical:              0,
    Test_Method:                    "string",
    Test_System:                    "string",
    Test_System_Manufacturer:       "string",
    Result_Obtained_From:           "string",
    Diagnosis:                      "string",
    Diagnosis_Remarks:              "string",
    ICD_Code:                       "string",
    Pregnancy_Week:                 0,
    Pregnancy_Trimester:            "string",
    Medication:                     "string",
    Therapy:                        "string",
    Histological_Diagnosis:         "string",
    Organ:                          "string",
    Disease_Presentation:           "string",
    TNM_Class_T:                    "string",
    TNM_Class_N:                    "string",
    TNM_Class_M:                    "string",
    Tumour_Grade:                   "string",
    Tumour_Stage:                   "string",
    Viable_Cells__per_:             "string",
    Necrotic_Cells__per_:           "string",
    Tumour_Cells__per_:             "string",
    Proliferation_Rate__Ki67_per_:  "string",
    Estrogen_Receptor:              "string",
    Progesteron_Receptor:           "string",
    HER_2_Receptor:                 "string",
    Other_Gene_Mutations:           "string",
    Country_of_Collection:          "string",
    Date_of_Collection:             new Date(),
    Procurement_Type:               "string",
    Informed_Consent:               "string",
}