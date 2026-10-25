"""Assign stable project IDs without rewriting existing identities.

New records use a deterministic ID from their ward and normalized name. A
reviewed alias can point a new name key to an existing project ID. Existing
IDs are authoritative and are never recomputed from a possibly changed name.
"""
import hashlib
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
DATA_PATH = os.path.join(ROOT, 'src', 'data', 'wardspend.json')
ALIASES_PATH = os.path.join(ROOT, 'data-src', 'project-id-overrides.json')
DROP = {
    'construction', 'completion', 'renovation', 'renovations',
    'rehabilitation', 'upgrading', 'equipping', 'purchase', 'repair',
    'repairs', 'fencing', 'of', 'and', 'the',
}
PROJECT_ID = re.compile(r'^P-[0-9a-f]{7}$')


def normalize(name):
    text = name.lower().replace('&', ' and ').replace('road routine maintenance:', ' ')
    text = ''.join(char if char.isalnum() or char.isspace() else ' ' for char in text)
    words = text.split()
    while words and words[0] in DROP:
        words.pop(0)
    return ' '.join(words)


def identity_key(project):
    if not isinstance(project.get('name'), str) or not project['name'].strip():
        raise ValueError('project record is missing a name')
    ward = project.get('ward') or 'county'
    if not isinstance(ward, str):
        raise ValueError(f"invalid ward for project {project['name']!r}")
    return f'{ward}|{normalize(project["name"])}'


def generated_id(key):
    return 'P-' + hashlib.sha1(key.encode()).hexdigest()[:7]


def validate_aliases(aliases):
    if not isinstance(aliases, dict):
        raise ValueError('"aliases" must be an object')
    for alias_key, entry in aliases.items():
        if not isinstance(alias_key, str) or '|' not in alias_key:
            raise ValueError(f'invalid alias key: {alias_key!r}')
        if not isinstance(entry, dict):
            raise ValueError(f'alias {alias_key!r} must include reviewed metadata')
        if not isinstance(entry.get('projectId'), str) or not PROJECT_ID.fullmatch(entry['projectId']):
            raise ValueError(f'alias {alias_key!r} has an invalid projectId')
        if not isinstance(entry.get('reason'), str) or not entry['reason'].strip():
            raise ValueError(f'alias {alias_key!r} is missing its review reason')
        if not isinstance(entry.get('source'), str) or not entry['source'].strip():
            raise ValueError(f'alias {alias_key!r} is missing its source reference')
    return aliases


def assign_project_ids(projects, aliases):
    validate_aliases(aliases)
    existing_by_key = {}
    existing_keys_by_id = {}
    for project in projects:
        project_id = project.get('projectId')
        if project_id is None:
            continue
        if not isinstance(project_id, str) or not PROJECT_ID.fullmatch(project_id):
            raise ValueError(f'invalid projectId {project_id!r}')
        key = identity_key(project)
        existing_by_key.setdefault(key, set()).add(project_id)
        existing_keys_by_id.setdefault(project_id, set()).add(key)

    for key, project_ids in existing_by_key.items():
        if len(project_ids) > 1:
            raise ValueError(
                f'identity key {key!r} has conflicting existing project IDs: '
                f'{", ".join(sorted(project_ids))}'
            )

    for alias_key, entry in aliases.items():
        existing_ids = existing_by_key.get(alias_key, set())
        if existing_ids and existing_ids != {entry['projectId']}:
            raise ValueError(
                f'alias {alias_key!r} conflicts with existing projectId(s): '
                f'{", ".join(sorted(existing_ids))}'
            )
        if entry['projectId'] not in existing_keys_by_id:
            raise ValueError(
                f"alias {alias_key!r} points to unknown projectId {entry['projectId']!r}"
            )

    generated_keys = {}
    for project in projects:
        if project.get('projectId') is not None:
            continue
        key = identity_key(project)
        existing_ids = existing_by_key.get(key, set())
        if len(existing_ids) > 1:
            raise ValueError(f'identity key {key!r} has conflicting existing project IDs')
        if existing_ids:
            project['projectId'] = next(iter(existing_ids))
        elif key in aliases:
            project['projectId'] = aliases[key]['projectId']
        else:
            project_id = generated_id(key)
            prior_key = generated_keys.get(project_id)
            if prior_key and prior_key != key:
                raise ValueError(f'ID collision: {key!r} and {prior_key!r}')
            existing_keys = existing_keys_by_id.get(project_id, set())
            if existing_keys and key not in existing_keys:
                raise ValueError(
                    f'ID collision: {key!r} hashes to existing projectId {project_id!r}'
                )
            generated_keys[project_id] = key
            project['projectId'] = project_id
    return projects


def main():
    with open(DATA_PATH, encoding='utf-8') as source:
        data = json.load(source)
    with open(ALIASES_PATH, encoding='utf-8') as source:
        alias_data = json.load(source)
    aliases = validate_aliases(alias_data.get('aliases'))

    if '--keys' in sys.argv:
        assign_project_ids(data['projects'], aliases)
        known_ids = {}
        for project in data['projects']:
            key = identity_key(project)
            if project.get('projectId'):
                known_ids.setdefault(key, set()).add(project['projectId'])
        for key in sorted({identity_key(project) for project in data['projects']} | set(aliases)):
            ids = sorted(known_ids.get(key, set()))
            print(f"{key}\t{','.join(ids)}")
        return

    assign_project_ids(data['projects'], aliases)
    with open(DATA_PATH, 'w', encoding='utf-8') as output:
        json.dump(data, output, indent=1, ensure_ascii=False)
        output.write('\n')
    projects_by_id = {}
    for project in data['projects']:
        projects_by_id.setdefault(project['projectId'], set()).add(project.get('fy'))
    multi_year = sum(len(years) > 1 for years in projects_by_id.values())
    print(f"{len(data['projects'])} records, {len(projects_by_id)} projects, {multi_year} found in more than one year")


if __name__ == '__main__':
    main()
