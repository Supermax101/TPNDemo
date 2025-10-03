export default class DateUtils {

    public static isToday(date: Date | undefined): boolean {
        if (!date) { return false; }
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    public static formatDate(date: Date | undefined): string {
        if (!date) { return "Unknown"; }

        // If today, return "Today"...
        if (DateUtils.isToday(date)) { return "Today"; }

        // Otherwise, format as MM-DD-YYYY...
        return date.toLocaleDateString();
    }

    /**
     * Returns a date formatted for a table header.
     * If date is today, will return in format like: "Today, Sat 30"
     * If not today, will return in a format like: "May 25"
     */
    public static formatDateForTableHeader(date: Date | undefined): string {
        if (!date) { return "Unknown"; }

        // If today, return "Today, Sat 30"...
        if (DateUtils.isToday(date)) {
            return `Today, ${date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}`;
        }

        // Otherwise, format as "May 25, yyyy"...
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    /**
     * Compute age in days, accounting for leap years...
     * @param dob Date of birth
     * @returns Age in days
     */
    public static getAgeInDays(dob: Date): number {
        const now = new Date();
        const diff = now.getTime() - dob.getTime();
        const ageInDays = diff / (1000 * 60 * 60 * 24);
        return ageInDays;
    }

    /**
     * Convert date to YYYY-MM-DD format
     * @param date Date to convert
     * @returns String in YYYY-MM-DD format
     */
    public static toYYYYMMDDWithDashes(date: Date | string | undefined): string {
        if (!date) { return ""; }
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}