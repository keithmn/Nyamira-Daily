export function showStatusText(show) {
  if (show.status === 'planned') return 'The programme is planned; no broadcast time is confirmed.';
  if (show.status === 'scheduled') {
    return `A broadcast is scheduled for ${show.start}:00–${show.end}:00 EAT. A schedule does not confirm that it is live.`;
  }
  if (show.status === 'confirmed_live') {
    return show.confirmedAt && show.liveUrl
      ? `A live broadcast was confirmed at ${show.confirmedAt}. This static page cannot confirm that it is still live.`
      : 'Live status is not confirmed with a check time and stream link.';
  }
  if (show.status === 'recorded') {
    return show.recordingUrl
      ? 'A recording is available below.'
      : 'A recording is marked as available, but no recording link is configured.';
  }
  return 'Broadcast status is unknown.';
}
