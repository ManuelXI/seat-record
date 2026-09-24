// DEMO SIGNING KEY. Generated for the hackathon prototype only.
// In production the private key lives in a secrets manager and never in the repo.
export const DEMO_KEY_ID = "bonarda-demo-2026";
export const DEMO_PUBLIC_KEY_PEM = "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAMVjmwe+5f1MRhEzJRjL51jHB41sSA3dvBSQ+VFjXNXA=\n-----END PUBLIC KEY-----\n";
export const DEMO_PRIVATE_KEY_PEM = process.env.SIGNING_PRIVATE_KEY_PEM ?? "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIFbsDokArn3THVfBpUzBk4IJepHUk1CHzM/q83NOhXCn\n-----END PRIVATE KEY-----\n";
