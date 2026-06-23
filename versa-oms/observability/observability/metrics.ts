type MetricLabels = Record<string, string | number | boolean>;

export function incrementMetric(name: string, labels: MetricLabels = {}) {
  // Replace with metrics provider.
  void name;
  void labels;
}

export function observeDuration(name: string, valueMs: number, labels: MetricLabels = {}) {
  // Replace with metrics provider.
  void name;
  void valueMs;
  void labels;
}

export function setGauge(name: string, value: number, labels: MetricLabels = {}) {
  // Replace with metrics provider.
  void name;
  void value;
  void labels;
}
