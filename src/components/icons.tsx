/** Small stroke icons for navigation. 20px grid, currentColor. */
const base = { width: 18, height: 18, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconLog = () => (<svg {...base}><path d="M5 4h10M5 8h10M5 12h6M5 16h4" /></svg>);
export const IconPen = () => (<svg {...base}><path d="M13.5 3.5l3 3L7 16H4v-3z" /><path d="M11.5 5.5l3 3" /></svg>);
export const IconUser = () => (<svg {...base}><circle cx="10" cy="7" r="3" /><path d="M4 17c1-3.2 3.3-4.5 6-4.5s5 1.3 6 4.5" /></svg>);
export const IconGrid = () => (<svg {...base}><rect x="3.5" y="3.5" width="5" height="5" rx="1" /><rect x="11.5" y="3.5" width="5" height="5" rx="1" /><rect x="3.5" y="11.5" width="5" height="5" rx="1" /><rect x="11.5" y="11.5" width="5" height="5" rx="1" /></svg>);
export const IconChart = () => (<svg {...base}><path d="M4 16V9M10 16V4M16 16v-5" /></svg>);
export const IconInfo = () => (<svg {...base}><circle cx="10" cy="10" r="7" /><path d="M10 9v5M10 6.5v.01" /></svg>);
export const IconMenu = () => (<svg {...base}><path d="M3.5 6h13M3.5 10h13M3.5 14h13" /></svg>);
export const IconClose = () => (<svg {...base}><path d="M5 5l10 10M15 5L5 15" /></svg>);
export const IconSwitch = () => (<svg {...base}><path d="M6 5l-3 3 3 3M3 8h11M14 15l3-3-3-3M17 12H6" /></svg>);
export const IconSignOut = () => (<svg {...base}><path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8M12 6.5 15.5 10 12 13.5M15.5 10H8" /></svg>);
export const IconReset = () => (<svg {...base}><path d="M4 10a6 6 0 1 0 2-4.5M4 4v3h3" /></svg>);
export const IconHelp = () => (<svg {...base}><circle cx="10" cy="10" r="7" /><path d="M8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14v.01" /></svg>);
export const IconShare = () => (<svg {...base}><circle cx="5.5" cy="10" r="2" /><circle cx="14.5" cy="5" r="2" /><circle cx="14.5" cy="15" r="2" /><path d="M7.3 9l5.4-3M7.3 11l5.4 3" /></svg>);
export const IconSearch = () => (<svg {...base}><circle cx="9" cy="9" r="5" /><path d="M13 13l3.5 3.5" /></svg>);
export const IconSun = () => (<svg {...base}><circle cx="10" cy="10" r="3.2" /><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3L6 14M14 6l1.3-1.3" /></svg>);
export const IconMoon = () => (<svg {...base}><path d="M15.5 12.2A6 6 0 0 1 7.8 4.5a6 6 0 1 0 7.7 7.7z" /></svg>);
export const IconMonitor = () => (<svg {...base}><rect x="2.5" y="3.5" width="15" height="10" rx="1.5" /><path d="M7 17h6M10 13.5V17" /></svg>);
