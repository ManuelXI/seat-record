/** Bonarda managers for the demo sign-in. They own engagements via Engagement.engagementOwner. */
export interface Manager { id: string; name: string; title: string }

export const MANAGERS: Manager[] = [
  { id: "m1", name: "Ama Boateng", title: "Engagement manager" },
  { id: "m2", name: "Yaw Darko", title: "Engagement manager" },
];

export type Session = { role: "worker"; personId: string } | { role: "manager"; personId: string };
