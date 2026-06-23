export const queueConfig = {
  critical_approval: { priority: 100, maxConcurrency: 2 },
  security: { priority: 95, maxConcurrency: 2 },
  materials: { priority: 90, maxConcurrency: 2 },
  evaluation: { priority: 85, maxConcurrency: 3 },
  results: { priority: 80, maxConcurrency: 2 },
  certificates: { priority: 75, maxConcurrency: 3 },
  notifications: { priority: 70, maxConcurrency: 5 },
  exports: { priority: 65, maxConcurrency: 2 },
  sla: { priority: 60, maxConcurrency: 2 },
  default: { priority: 50, maxConcurrency: 3 },
  maintenance: { priority: 30, maxConcurrency: 1 }
} as const;
