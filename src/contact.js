import { readFile } from "node:fs/promises"

// HTML template location
const templateUrl = new URL(
    "../emailtemplates/erithAIoTemailTemplate.html",
    import.meta.url
)

// Maximum allowed field lengths
export const limits = {
    first_name: 100,
    last_name: 100,
    email: 254,
    phone: 25,
    subject: 200,
    message: 5000,
}

// Validate contact form
export function validate(input) {
    const errors = {}

    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return { form: "Invalid form submission." }
    }

    const fields = {}

    for (const [key, max] of Object.entries(limits)) {
        const value = input[key]

        if (typeof value !== "string" || !value.trim()) {
            errors[key] = `${key.replace("_", " ")} is required.`
            continue
        }

        fields[key] = value.trim()

        if ([...fields[key]].length > max) {
            errors[key] = `${key.replace("_", " ")} is too long.`
        }
    }

    if (
        fields.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
    ) {
        errors.email = "Invalid email address."
    }

    if (
        fields.phone &&
        !/^[+0-9()\- .]{6,25}$/.test(fields.phone)
    ) {
        errors.phone = "Invalid phone number."
    }

    return errors
}

// Prevent HTML injection
const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char])

// Generate email from external HTML template
export async function contactEmailHtml(f) {
    const html = await readFile(templateUrl, "utf8")

    const fields = {
        first_name: f.first_name,
        last_name: f.last_name,
        email: f.email,
        phone: f.phone,
        subject: f.subject,
        message: f.message,
    }

    return html.replace(
        /\{\{\s*(first_name|last_name|email|phone|subject|message)\s*\}\}/g,
        (_, key) => {
            const value = escapeHtml(fields[key])

            return key === "message"
                ? value.replace(/\r?\n/g, "<br>")
                : value
        }
    )
}