import * as r4 from "fhir/r4";
import { Resources, DateTimeUtils } from "@plasmahealth/plasma-fhir-client";

export default class PatientUtils {
    // Get patient initials (for avatar)...
    public static getPatientInitials(patient: r4.Patient | null): string {
        const patientName = (patient) ? Resources.r4.Patient.getOfficialName(patient) : null;
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
        const patientName = (patient) ? Resources.r4.Patient.getOfficialName(patient) : null;
        if (!patientName) { return "Unknown"; }

        const sPatientName = Resources.r4.HumanName.toString(patientName);
        return sPatientName;
    }

    // Get a patient age...
    public static getPatientAgeDisplay(patient: r4.Patient | null): string {
        if (!patient) { return "Unknown"; }

        const dob = Resources.r4.Patient.getBirthDate(patient);
        if (!dob) { return "Unknown"; }

        const age = DateTimeUtils.getAgeFromDOB(dob);
        return age.toString() + " years";
    }
}