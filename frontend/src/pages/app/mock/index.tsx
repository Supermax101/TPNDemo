import { useEffect, useContext, useState, useRef } from "react";
import { AppContext } from "@/hooks/AppContext/AppContext";
import EHRDataClientMock from "@/lib/client/EHRDataClientMock";
import { useRouter } from "next/router";
import { Center, Text, Loader } from "@mantine/core";

export default function MockApp() {
  const appContext = useContext(AppContext);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current || isInitialized) {
      return;
    }

    if (!appContext) {
      console.error("No AppContext available");
      setError("Application context not available");
      return;
    }

    initializationAttempted.current = true;

    // Instantly set up mock data and redirect to main app
    const initializeMockData = async () => {
      try {
        // Initialize mock client with hardcoded data
        const mockClient = new EHRDataClientMock();
        const testPatientId = "mock-patient-demo";
        
        // Set mock client and patient ID
        appContext.setEhrDataClient(mockClient);
        appContext.setPatientId(testPatientId);
        
        // Load basic patient data (like HAPI does)
        const appData = await mockClient.getPatientDetails(testPatientId);
        
        // 🎯 ALSO ADD HARDCODED PREDICTIONS for immediate Step 2 access
        const mockPredictions = {
          "Amino Acid": { 
            unit: "g/kg/day", 
            stepsize: 0.1,
            vals: { start: 2.5, center: 3.0, end: 3.5, min: 2.0, max: 4.0, lower: 2.5, upper: 3.5, target: 3.0 }
          },
          "Dextrose": { 
            unit: "mg/kg/min", 
            stepsize: 0.1,
            vals: { start: 9.5, center: 10.7, end: 12.0, min: 8.0, max: 15.0, lower: 9.5, upper: 12.0, target: 10.7 }
          },
          "Fat": { 
            unit: "g/kg/day", 
            stepsize: 0.1,
            vals: { start: 2.8, center: 3.2, end: 3.6, min: 2.0, max: 4.0, lower: 2.8, upper: 3.6, target: 3.2 }
          },
          "Sodium": { 
            unit: "mEq/kg/day", 
            stepsize: 0.1,
            vals: { start: 3.0, center: 3.5, end: 4.0, min: 2.0, max: 5.0, lower: 3.0, upper: 4.0, target: 3.5 }
          },
          "Potassium": { 
            unit: "mEq/kg/day", 
            stepsize: 0.1,
            vals: { start: 2.8, center: 3.2, end: 3.6, min: 2.0, max: 4.0, lower: 2.8, upper: 3.6, target: 3.2 }
          },
          "Calcium": { 
            unit: "mg/kg/day", 
            stepsize: 1,
            vals: { start: 40, center: 45, end: 50, min: 30, max: 60, lower: 40, upper: 50, target: 45 }
          },
          "Phosphate": { 
            unit: "mmol/kg/day", 
            stepsize: 0.1,
            vals: { start: 1.2, center: 1.5, end: 1.8, min: 1.0, max: 2.0, lower: 1.2, upper: 1.8, target: 1.5 }
          },
          "Magnesium": { 
            unit: "mEq/kg/day", 
            stepsize: 0.1,
            vals: { start: 0.3, center: 0.4, end: 0.5, min: 0.2, max: 0.6, lower: 0.3, upper: 0.5, target: 0.4 }
          },
          "Acetate": { 
            unit: "mEq/kg/day", 
            stepsize: 0.1,
            vals: { start: 2.0, center: 2.3, end: 2.6, min: 1.5, max: 3.0, lower: 2.0, upper: 2.6, target: 2.3 }
          },
          "Chloride": { 
            unit: "mEq/kg/day", 
            stepsize: 0.1,
            vals: { start: 1.5, center: 1.8, end: 2.1, min: 1.0, max: 2.5, lower: 1.5, upper: 2.1, target: 1.8 }
          },
          "MVI": { 
            unit: "mL/kg/day", 
            stepsize: 0.1,
            vals: { start: 1.0, center: 1.2, end: 1.4, min: 0.8, max: 1.6, lower: 1.0, upper: 1.4, target: 1.2 }
          },
          "Copper": { 
            unit: "mcg/kg/day", 
            stepsize: 1,
            vals: { start: 15, center: 20, end: 25, min: 10, max: 30, lower: 15, upper: 25, target: 20 }
          },
          "Zinc": { 
            unit: "mcg/kg/day", 
            stepsize: 10,
            vals: { start: 250, center: 300, end: 350, min: 200, max: 400, lower: 250, upper: 350, target: 300 }
          },
          "Selenium": { 
            unit: "mcg/kg/day", 
            stepsize: 0.1,
            vals: { start: 2.0, center: 2.5, end: 3.0, min: 1.5, max: 3.5, lower: 2.0, upper: 3.0, target: 2.5 }
          },
          "Heparin": { 
            unit: "units/kg/hr", 
            stepsize: 0.1,
            vals: { start: 0.3, center: 0.5, end: 0.7, min: 0.1, max: 1.0, lower: 0.3, upper: 0.7, target: 0.5 }
          }
        };

        // Store predictions in appData for Step 2 sliders
        appData.predictions = mockPredictions;
        
        appContext.setAppData(appData);
        appContext.setPatient(appData.patient);
        
        setIsInitialized(true);
        
        // Redirect immediately
        router.replace("/app/main");

      } catch (err: any) {
        console.error("🎯 [MOCK] Failed to initialize mock data:", err);
        setError(`Failed to initialize mock data: ${err.message}`);
        
        // Fallback to launch page after 3 seconds
        setTimeout(() => {
          router.push("/launch");
        }, 3000);
      }
    };

    initializeMockData();
  }, [appContext, isInitialized, router]); // Dependencies for appContext, isInitialized, router

  // Show loading or error state
  if (error) {
    return (
      <Center h="100vh">
        <div style={{ textAlign: 'center' }}>
          <Text color="red" size="lg" fw={500}>Mock Data Error</Text>
          <Text size="sm" mt="sm">{error}</Text>
          <Text size="xs" mt="md">Redirecting to launch page...</Text>
        </div>
      </Center>
    );
  }

  return (
    <Center h="100vh">
      <div style={{ textAlign: 'center' }}>
        <Loader size="lg" />
        <Text size="lg" mt="md">Loading Mock Patient Data...</Text>
        <Text size="sm" c="dimmed" mt="sm">Setting up hardcoded patient and lab data</Text>
      </div>
    </Center>
  );
} 