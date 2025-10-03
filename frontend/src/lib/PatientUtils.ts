import * as r4 from "fhir/r4";

export default class PatientUtils {
    // Get patient initials (for avatar)...
    public static getPatientInitials(patient: r4.Patient | null): string {
        if (!patient || !patient.name || patient.name.length === 0) { return "UNK"; }
        
        const patientName = patient.name.find(n => n.use === 'official') || patient.name[0];
        if (!patientName) { return "UNK"; }

        // Get first name and last name initial...
        const firstInitial = patientName.given?.[0]?.[0] ?? "";
        const lastInitial = patientName.family?.[0] ?? "";
        if (!firstInitial && !lastInitial) { return "UNK"; }

        // Return initials...
        return firstInitial + lastInitial;
    }

    // Get a patient display name...
    public static getPatientDisplayName(patient: r4.Patient | null): string {
        if (!patient || !patient.name || patient.name.length === 0) { return "Unknown"; }
        
        const patientName = patient.name.find(n => n.use === 'official') || patient.name[0];
        if (!patientName) { return "Unknown"; }

        const given = patientName.given?.join(' ') || '';
        const family = patientName.family || '';
        return `${given} ${family}`.trim() || "Unknown";
    }

    // Get a patient age...
    public static getPatientAgeDisplay(patient: r4.Patient | null): string {
        if (!patient || !patient.birthDate) { return "Unknown"; }

        const dob = new Date(patient.birthDate);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        return age.toString() + " years";
    }
}