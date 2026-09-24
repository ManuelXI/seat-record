/** Technology terms that are safe to say. Used by the screen allowlist and by request matching. */
export const TECH_TERMS = [
  "Java", "Kotlin", "Scala", "Spring", "Spring Boot", "Kafka", "Airflow", "Snowflake", "Spark", "Flink",
  "Python", "Django", "FastAPI", "Flask", "Pandas", "NumPy", "Go", "Rust", "C#", ".NET", "C++",
  "JavaScript", "TypeScript", "React", "Next.js", "Angular", "Vue", "Node", "Node.js", "Redux", "Three.js",
  "PostgreSQL", "Postgres", "MySQL", "MongoDB", "Redis", "Elasticsearch", "GraphQL", "REST", "gRPC",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub", "GitLab", "Jira",
  "Linux", "Bash", "SQL", "NoSQL", "CI", "CD", "API", "APIs", "UI", "UX", "QA", "HTML", "CSS", "SCSS",
  "JSON", "XML", "HTTP", "HTTPS", "OAuth", "SSO", "JWT", "WebSocket", "WebSockets", "Jest", "Vitest",
  "Playwright", "Cypress", "JUnit", "Mockito", "Gradle", "Maven", "Lighthouse", "Figma", "Tailwind",
  "Agile", "Scrum", "Kanban", "TDD", "BDD", "SLA", "SLAs", "ETL", "ML", "AI", "LLM", "iOS", "Android",
];

/** Capitalised words that are not names. Sentence-initial words are skipped separately. */
export const COMMON_CAPITALISED = [
  "I", "I'm", "I've", "I'd", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December", "English", "Europe", "European", "Africa", "African", "Ghana", "London",
  "Bonarda", "Turntabl", "Q1", "Q2", "Q3", "Q4",
];

/** Words in a drafted line that assert an outcome and must appear in the worker's own entry. */
export const CLAIM_WORDS = [
  "all", "every", "entire", "entirely", "always", "never", "zero", "eliminated", "eliminate", "eliminating",
  "doubled", "tripled", "halved", "slashed", "saved", "increased", "decreased", "reduced", "improved",
  "fastest", "best", "first", "only", "single-handedly", "sole", "led", "owned", "architected",
  "percent", "million", "thousand", "hundred", "revenue", "profit",
];

export const NUMBER_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "twenty", "thirty", "forty", "fifty", "hundred", "thousand", "million", "dozen",
];
