#!/usr/bin/env python3
"""
ingest-pdf.py — Extract tables from county budget PDFs into candidate registry rows.

Usage:
    python3 scripts/ingest-pdf.py <pdf-path> [--template budget-table-18] [--pages 54-61] [--out candidate.json]

This is a scaffold: it establishes the pipeline shape (input → extract → map → review → commit)
so that when Tesseract and tabula-py are installed, the extraction slots in without restructuring.

Requirements (install when ready):
    pip install tabula-py pytesseract pdf2image Pillow

Templates define how columns in the source PDF map to registry figure fields.
A human reviews the candidate output before it enters the registry.
"""

import argparse
import json
import sys
from pathlib import Path

# Column mappings for known county document tables.
# Each template maps PDF table columns to registry fields.
TEMPLATES = {
    'budget-table-18': {
        'description': 'County PBB Table 18: ward projects (sub-county, ward, project, budget)',
        'columns': {
            0: 'subCounty',
            1: 'ward',
            2: 'project',
            3: 'budgetKsh',
        },
        'defaults': {
            'unit': 'KSh',
            'stage': 'estimates',
            'level': 'project',
            'money': 'county',
            'label': 'official',
            'grouping': 'ward-allocation',
        },
    },
    'cob-table-2.1': {
        'description': 'Controller of Budget Table 2.1: county budget vs actual (all counties)',
        'columns': {
            0: 'county',
            1: 'approvedBudget',
            2: 'actualExpenditure',
            3: 'absorptionRate',
        },
        'defaults': {
            'unit': 'KSh m',
            'stage': 'spent',
            'level': 'county',
            'money': 'county',
            'label': 'official',
            'grouping': 'county-total',
        },
    },
    'gazette-mca': {
        'description': 'IEBC gazette: elected MCAs (constituency, ward, name, party)',
        'columns': {
            0: 'constituency',
            1: 'ward',
            2: 'name',
            3: 'party',
        },
        'defaults': {},
    },
}


def extract_tables(pdf_path, pages=None):
    """
    Extract tables from a PDF using tabula-py.
    Returns a list of tables, each a list of rows (lists of strings).
    Falls back to a stub when tabula-py is not installed.
    """
    try:
        import tabula
        kwargs = {'pages': pages or 'all', 'multiple_tables': True, 'lattice': True}
        dfs = tabula.read_pdf(str(pdf_path), **kwargs)
        tables = []
        for df in dfs:
            rows = [list(df.columns)] + df.values.tolist()
            tables.append([[str(cell) if cell == cell else '' for cell in row] for row in rows])
        return tables
    except ImportError:
        print('tabula-py not installed. Run: pip install tabula-py', file=sys.stderr)
        print('Returning empty extraction — install dependencies to process real PDFs.', file=sys.stderr)
        return []


def apply_template(tables, template_name):
    """
    Map extracted table rows to candidate registry rows using a template.
    Returns candidate rows ready for human review.
    """
    if template_name not in TEMPLATES:
        print(f'Unknown template: {template_name}', file=sys.stderr)
        print(f'Available: {", ".join(TEMPLATES.keys())}', file=sys.stderr)
        sys.exit(1)

    tmpl = TEMPLATES[template_name]
    defaults = tmpl['defaults']
    col_map = tmpl['columns']
    candidates = []

    for table in tables:
        for i, row in enumerate(table):
            if i == 0:
                continue  # skip header
            if len(row) <= max(col_map.keys()):
                continue
            record = {**defaults}
            for col_idx, field_name in col_map.items():
                record[field_name] = row[col_idx].strip() if col_idx < len(row) else ''
            record['_row'] = i
            record['_review'] = 'pending'
            candidates.append(record)

    return candidates


def main():
    parser = argparse.ArgumentParser(description='Extract tables from county PDFs into candidate registry rows')
    parser.add_argument('pdf', help='Path to the PDF file')
    parser.add_argument('--template', '-t', default='budget-table-18', choices=list(TEMPLATES.keys()),
                        help='Column mapping template (default: budget-table-18)')
    parser.add_argument('--pages', '-p', default=None,
                        help='Page range to extract, e.g. "54-61" (default: all)')
    parser.add_argument('--out', '-o', default=None,
                        help='Output file (default: stdout)')
    parser.add_argument('--list-templates', action='store_true',
                        help='List available templates and exit')
    args = parser.parse_args()

    if args.list_templates:
        for name, tmpl in TEMPLATES.items():
            print(f'  {name}: {tmpl["description"]}')
        return

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f'File not found: {pdf_path}', file=sys.stderr)
        sys.exit(1)

    print(f'Extracting tables from {pdf_path} (template: {args.template})...', file=sys.stderr)
    tables = extract_tables(pdf_path, pages=args.pages)

    if not tables:
        print('No tables extracted. Check that tabula-py is installed and the PDF has table content.', file=sys.stderr)
        output = {'template': args.template, 'source': str(pdf_path), 'candidates': [], 'note': 'No tables extracted'}
    else:
        candidates = apply_template(tables, args.template)
        print(f'Extracted {len(candidates)} candidate rows from {len(tables)} table(s).', file=sys.stderr)
        output = {
            'template': args.template,
            'source': str(pdf_path),
            'pages': args.pages,
            'extracted': len(candidates),
            'candidates': candidates,
            'note': 'Review every row before importing. Set _review to "accepted" or "rejected".',
        }

    text = json.dumps(output, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(text)
        print(f'Written to {args.out}', file=sys.stderr)
    else:
        print(text)


if __name__ == '__main__':
    main()
