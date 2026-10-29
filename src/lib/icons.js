// Nyamira Daily icon set (decision #55). One drawing language for every icon:
// a 24-unit grid, 1.9-unit rounded strokes in the text colour, and one filled "accent" shape in the
// section colour, echoing the dot inside the avocado-pin symbol. Icons are UI marks, never logos:
// the brand logos stay the unchanged files in public/brand/.
// Each icon is a list of [tag, attributes]. `ac: 1` marks the accent (filled); `acs: 1` an accent stroke.
export const icons = {
  money: [['rect', { x: 3, y: 6, width: 18, height: 12, rx: 2.5 }], ['path', { d: 'M6.5 9.5v5M17.5 9.5v5' }], ['circle', { cx: 12, cy: 12, r: 2.7, ac: 1 }]],
  health: [['rect', { x: 3.5, y: 3.5, width: 17, height: 17, rx: 4.5 }], ['path', { d: 'M10.3 7.5h3.4v2.8h2.8v3.4h-2.8v2.8h-3.4v-2.8H7.5v-3.4h2.8z', ac: 1 }]],
  education: [['path', { d: 'M2.5 9 12 4.8 21.5 9 12 13.2z' }], ['path', { d: 'M6.5 11v4.2c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3V11' }], ['path', { d: 'M21.5 9v4.5' }], ['circle', { cx: 21.5, cy: 15.4, r: 1.5, ac: 1 }]],
  farming: [['path', { d: 'M5 19.5C5 11.5 10.5 6 19 5.5c0 8.5-5.5 14-14 14z' }], ['path', { d: 'M5 19.5 13.5 11' }], ['circle', { cx: 15.6, cy: 9, r: 1.9, ac: 1 }]],
  people: [['circle', { cx: 9, cy: 8, r: 3.2 }], ['path', { d: 'M3 19.5c.7-3.4 3.1-5.4 6-5.4s5.3 2 6 5.4' }], ['circle', { cx: 16.8, cy: 8.8, r: 2.5, ac: 1 }], ['path', { d: 'M16 13.6c2.6.1 4.4 2 5 5' }]],
  data: [['ellipse', { cx: 12, cy: 6, rx: 7, ry: 2.6 }], ['path', { d: 'M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6' }], ['path', { d: 'M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6' }], ['ellipse', { cx: 12, cy: 6, rx: 3.4, ry: 1.1, ac: 1 }]],
  pin: [['path', { d: 'M12 21c-3.7-4.1-6.2-7.2-6.2-10.6a6.2 6.2 0 1 1 12.4 0c0 3.4-2.5 6.5-6.2 10.6z' }], ['circle', { cx: 12, cy: 10.4, r: 2.5, ac: 1 }]],
  ward: [['path', { d: 'M4 7.5 9 4l6.5 2.5L20 4.5v12L15 20l-6.5-2.5L4 19.5z' }], ['path', { d: 'M12 15.2c-1.8-2-3-3.5-3-5.1a3 3 0 0 1 6 0c0 1.6-1.2 3.1-3 5.1z', ac: 1 }]],
  government: [['path', { d: 'M3 9.5 12 4.2l9 5.3' }], ['path', { d: 'M5.5 11v7M10 11v7M14 11v7M18.5 11v7M3.5 20.5h17' }], ['circle', { cx: 12, cy: 7.6, r: 1.4, ac: 1 }]],
  alert: [['path', { d: 'M10.4 4.6a1.85 1.85 0 0 1 3.2 0l7.3 12.8a1.85 1.85 0 0 1-1.6 2.8H4.7a1.85 1.85 0 0 1-1.6-2.8z' }], ['path', { d: 'M12 9.5v4' }], ['circle', { cx: 12, cy: 16.6, r: 1.25, ac: 1 }]],
  water: [['path', { d: 'M12 3.5c3.7 4.5 6.1 7.7 6.1 10.8a6.1 6.1 0 0 1-12.2 0c0-3.1 2.4-6.3 6.1-10.8z' }], ['path', { d: 'M9.2 14.4a2.9 2.9 0 0 0 2.8 2.9', acs: 1 }]],
  road: [['path', { d: 'M7.5 20.5 10.4 3.5M16.5 20.5 13.6 3.5' }], ['path', { d: 'M12 6.5v2M12 11.5v2M12 16.5v2', acs: 1 }]],
  market: [['path', { d: 'M4 9.5 5.6 4.5h12.8L20 9.5' }], ['path', { d: 'M4 9.5c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5' }], ['path', { d: 'M5.5 12v8.5h13V12' }], ['rect', { x: 10, y: 15, width: 4, height: 5.5, rx: 1, ac: 1 }]],
  worship: [['path', { d: 'M4.5 20.5V10L12 4.5l7.5 5.5v10.5z' }], ['path', { d: 'M9.8 20.5v-3.6a2.2 2.2 0 0 1 4.4 0v3.6' }], ['circle', { cx: 12, cy: 10.6, r: 1.6, ac: 1 }]],
  office: [['rect', { x: 3.5, y: 7.5, width: 17, height: 12.5, rx: 2.5 }], ['path', { d: 'M9 7.5V6a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 6v1.5M3.5 12.5h17' }], ['rect', { x: 10.2, y: 11, width: 3.6, height: 3.4, rx: 0.9, ac: 1 }]],
  community: [['path', { d: 'M3.5 11 12 4.2l8.5 6.8v9.5h-17z' }], ['path', { d: 'M12 18.2l-2.7-2.6a1.75 1.75 0 0 1 2.7-2.2 1.75 1.75 0 0 1 2.7 2.2z', ac: 1 }]],
  agriculture: [['path', { d: 'M12 20.5v-7.5' }], ['path', { d: 'M12 13c0-3.6-2.4-5.8-6.3-5.8 0 3.6 2.4 5.8 6.3 5.8zM12 11.3c0-3.2 2.1-5.3 5.8-5.3 0 3.2-2.1 5.3-5.8 5.3z' }], ['path', { d: 'M5.5 20.5h13', acs: 1 }]],
  calendar: [['rect', { x: 3.5, y: 5.5, width: 17, height: 15, rx: 2.5 }], ['path', { d: 'M3.5 10h17M8 3.5v4M16 3.5v4' }], ['circle', { cx: 15.4, cy: 15.2, r: 2, ac: 1 }]],
  source: [['path', { d: 'M6.5 3.5h7.5l4 4v13h-11.5z' }], ['path', { d: 'M14 3.5v4h4M9.5 12.5h5.5M9.5 16h5.5' }], ['circle', { cx: 9.6, cy: 8.4, r: 1.3, ac: 1 }]],
  camera: [['path', { d: 'M3.5 8.5h3.4l1.7-2.6h6.8l1.7 2.6h3.4v11h-17z' }], ['circle', { cx: 12, cy: 13.6, r: 3.4, ac: 1 }]],
  question: [['path', { d: 'M4 5h16v11.2h-9.6L6 19.8v-3.6H4z' }], ['path', { d: 'M10.1 8.9a1.95 1.95 0 1 1 2.6 1.9c-.5.2-.7.6-.7 1.1v.3' }], ['circle', { cx: 12, cy: 14, r: 1.05, ac: 1 }]],
  takepart: [['path', { d: 'M4 10v4h3.2l7.3 4.2V5.8L7.2 10z' }], ['path', { d: 'M7.5 14.2 8.6 19' }], ['path', { d: 'M17.6 9.4a3.8 3.8 0 0 1 0 5.2M19.8 7.2a7 7 0 0 1 0 9.6', acs: 1 }]],
  learn: [['path', { d: 'M9.2 17.2h5.6M10.2 20.5h3.6' }], ['path', { d: 'M12 3.5a5.6 5.6 0 0 0-3.1 10.3v2.1h6.2v-2.1A5.6 5.6 0 0 0 12 3.5z' }], ['circle', { cx: 12, cy: 9.2, r: 1.7, ac: 1 }]],
  stories: [['path', { d: 'M3.5 5.8c3.2 0 6.2.8 8.5 2.6v12c-2.3-1.8-5.3-2.6-8.5-2.6z' }], ['path', { d: 'M20.5 5.8c-3.2 0-6.2.8-8.5 2.6v12c2.3-1.8 5.3-2.6 8.5-2.6z' }], ['circle', { cx: 16.6, cy: 11, r: 1.5, ac: 1 }]],
  map: [['path', { d: 'M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z' }], ['path', { d: 'M9 4.5v13M15 6.5v13' }], ['circle', { cx: 15, cy: 11.6, r: 1.9, ac: 1 }]],
  chart: [['path', { d: 'M3.5 20.5h17' }], ['path', { d: 'M6.5 17V12M11 17V7M15.5 17v-3.5' }], ['path', { d: 'M20 17V9.5', acs: 1 }]],
  today: [['circle', { cx: 12, cy: 12, r: 4, ac: 1 }], ['path', { d: 'M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6' }]],
  check: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M8.3 12.3l2.5 2.5 5-5.3', acs: 1 }]],
  phone: [['rect', { x: 6.5, y: 2.8, width: 11, height: 18.4, rx: 2.6 }], ['path', { d: 'M10.4 5.6h3.2' }], ['circle', { cx: 12, cy: 17.4, r: 1.3, ac: 1 }]],
  search: [['circle', { cx: 10.5, cy: 10.5, r: 6 }], ['path', { d: 'M15 15l5 5', acs: 1 }]],
};

// Facility categories (src/data/facilities.json) and Data sectors (src/data/topics.js) to icons.
export const categoryIcon = {
  Health: 'health', Education: 'education', Market: 'market', Water: 'water', 'Public office': 'office',
  'Community centre': 'community', Worship: 'worship', Agriculture: 'agriculture',
};
export const topicIcon = { money: 'money', health: 'health', education: 'education', farming: 'farming', people: 'people', 'open-data': 'data' };
export const sectionIcon = { Today: 'today', Wards: 'ward', Data: 'chart', 'Take part': 'takepart', Community: 'community', About: 'source', Government: 'government', Learn: 'learn' };
