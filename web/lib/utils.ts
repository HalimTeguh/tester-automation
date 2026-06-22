import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeAndValidateUrl(input: string): string | null {
  let url = input.trim()
  if (!url) return null

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    const hostname = parsed.hostname
    if (
      !hostname.includes(".") ||
      hostname === "localhost" ||
      /^127\.\d+\.\d+\.\d+$/.test(hostname)
    ) {
      return null
    }
    return url
  } catch {
    return null
  }
}
