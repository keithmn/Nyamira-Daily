export function isLiveAlert(alert) {
  return alert.status !== 'resolved';
}
