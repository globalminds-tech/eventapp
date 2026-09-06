/**
 * KYC & Business Onboarding Validation Rules and Helpers
 * Standardized across Organizer and Exhibitor registration and upgrade flows.
 */

// GSTIN Regex: 2 digits (State Code) + 10 chars (PAN) + 1 char (Entity) + 'Z' + 1 char (Check)
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Zz][0-9A-Z]{1}$/;

// PAN Regex: 5 letters + 4 digits + 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// IFSC Code: 4 letters + '0' + 6 alphanumeric branch characters
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Indian Pincode: 6 digits, first digit 1-9
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Indian Mobile: 10 digits starting with 6, 7, 8, or 9 (with optional +91 or 0 prefix)
export const MOBILE_REGEX = /^(?:\+91[\s-]?)?[6789]\d{9}$/;

// Email Regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bank Account Number: 9 to 18 digits
export const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;

/**
 * Validate GSTIN number
 * @param {string} gstin 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validateGSTIN(gstin) {
  const clean = String(gstin || "").trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: "GSTIN Number is required.", normalized: "" };
  }
  if (!GSTIN_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Invalid GSTIN Number",
      normalized: clean,
    };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Validate PAN number and optionally verify consistency with GSTIN
 * @param {string} pan 
 * @param {string} [gstin] 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validatePAN(pan, gstin = "") {
  const clean = String(pan || "").trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: "PAN Card Number is required.", normalized: "" };
  }
  if (!PAN_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Invalid PAN Number",
      normalized: clean,
    };
  }

  // Cross-validation: characters 3-12 of GSTIN is the entity PAN
  const cleanGstin = String(gstin || "").trim().toUpperCase();
  if (cleanGstin.length === 15 && GSTIN_REGEX.test(cleanGstin)) {
    const embeddedPan = cleanGstin.slice(2, 12);
    if (embeddedPan !== clean) {
      return {
        isValid: false,
        error: "PAN must match GSTIN",
        normalized: clean,
      };
    }
  }

  return { isValid: true, normalized: clean };
}

/**
 * Validate IFSC Code
 * @param {string} ifsc 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validateIFSC(ifsc) {
  const clean = String(ifsc || "").trim().toUpperCase();
  if (!clean) {
    return { isValid: false, error: "IFSC Code is required.", normalized: "" };
  }
  if (!IFSC_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Invalid IFSC Code",
      normalized: clean,
    };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Validate Bank Account Number
 * @param {string} accNum 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validateBankAccountNumber(accNum) {
  const clean = String(accNum || "").trim();
  if (!clean) {
    return { isValid: false, error: "Bank Account Number is required.", normalized: "" };
  }
  if (!BANK_ACCOUNT_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Invalid Bank Account Number",
      normalized: clean,
    };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Validate Mobile Number
 * @param {string} mobile 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validateMobile(mobile) {
  const clean = String(mobile || "").trim();
  if (!clean) {
    return { isValid: false, error: "Mobile Number is required.", normalized: "" };
  }
  // Strip +91, spaces, dashes
  const digits = clean.replace(/[\s-+]/g, "");
  const normalizedDigits = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

  if (normalizedDigits.length !== 10 || !/^[6789]\d{9}$/.test(normalizedDigits)) {
    return {
      isValid: false,
      error: "Invalid Mobile Number",
      normalized: clean,
    };
  }
  return { isValid: true, normalized: clean };
}

/**
 * Validate Indian Pincode
 * @param {string} pin 
 * @returns {{ isValid: boolean, error?: string, normalized: string }}
 */
export function validatePincode(pin) {
  const clean = String(pin || "").trim();
  if (!clean) {
    return { isValid: false, error: "Pincode is required.", normalized: "" };
  }
  if (!PINCODE_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Invalid Pincode",
      normalized: clean,
    };
  }
  return { isValid: true, normalized: clean };
}
