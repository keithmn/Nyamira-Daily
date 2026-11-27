import { entries } from './content.js';

export async function storyItems() {
  return (await entries('stories')).sort((a, b) => b.data.date - a.data.date);
}
export async function peopleItems() {
  return (await entries('people')).sort((a, b) => a.data.name.localeCompare(b.data.name));
}
export async function heritageItems() {
  return (await entries('heritage')).sort((a, b) => a.data.title.localeCompare(b.data.title));
}
