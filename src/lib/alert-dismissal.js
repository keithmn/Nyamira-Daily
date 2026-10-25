export function alertDismissalKey(alert) {
  return `${alert.id}:${new Date(alert.updatedAt).getTime()}`;
}
