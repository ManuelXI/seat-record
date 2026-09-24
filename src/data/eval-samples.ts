/** Labelled samples for the screen evaluation. All client details are fictional (client c1 term list). */
export interface ScreenSample { text: string; planted: string | null; kind: string }

export const SCREEN_SAMPLES: ScreenSample[] = [
  { text: "Migrated the Aurora feed onto Kafka", planted: "Aurora", kind: "Protected system name" },
  { text: "Fixed alerting for the Sentinel dashboards", planted: "Sentinel", kind: "Protected product name" },
  { text: "Worked with Priya on the release plan", planted: "Priya", kind: "Client staff, on list" },
  { text: "Paired with Daniel from the platform team", planted: "Daniel", kind: "Client staff, not on list" },
  { text: "Cut batch runtime from 340 minutes", planted: "340", kind: "Figure" },
  { text: "Handled a £2m trade break over a weekend", planted: "£2m", kind: "Money" },
  { text: "Closed tickets such as RISK-2041 in the sprint", planted: "RISK-2041", kind: "Ticket identifier" },
  { text: "Deployed to riskapi.internal every Friday", planted: "riskapi.internal", kind: "Hostname" },
  { text: "Built the PNLX reconciliation job", planted: "PNLX", kind: "Internal acronym" },
  { text: "Improved the overnight VaR run", planted: "VaR", kind: "Domain metric, mixed case" },
  { text: "Supported the desk that trades emerging market credit", planted: "emerging market credit", kind: "Identifying description" },
  { text: "Built React components with Jest tests", planted: null, kind: "Benign, should pass" },
  { text: "Wrote Kafka consumers in Java and Spring Boot", planted: null, kind: "Benign, should pass" },
];

export const PROTECTED_C1 = ["Harrow", "Vale", "HVB", "Aurora", "Sentinel", "RiskHub", "Priya", "Whitfield"];

export interface GroundingSample { source: string; line: string; shouldFlag: boolean }

export const GROUNDING_SAMPLES: GroundingSample[] = [
  { source: "rebuilt the batch so it stopped failing", line: "Eliminated all failures in the overnight batch", shouldFlag: true },
  { source: "set up contract tests for the three upstream teams", line: "Set up contract tests with three upstream teams", shouldFlag: false },
  { source: "made the job run a bit faster", line: "Halved the job's runtime", shouldFlag: true },
  { source: "worked with two teams on the release", line: "Coordinated five teams on the release", shouldFlag: true },
  { source: "led the migration to Kubernetes", line: "Led the migration to Kubernetes", shouldFlag: false },
  { source: "built dashboards for the risk team", line: "Built the first real-time dashboards for risk", shouldFlag: true },
];
