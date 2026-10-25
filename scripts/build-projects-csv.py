"""Create the versioned project CSV with explicit amount-availability labels."""
import csv
from decimal import Decimal, InvalidOperation
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public' / 'files' / 'projects-v1.csv'
OUTPUT = ROOT / 'public' / 'files' / 'projects-v2.csv'


def amount_status(raw_amount):
    if raw_amount is None or not raw_amount.strip():
        return 'unavailable'
    try:
        amount = Decimal(raw_amount)
    except InvalidOperation as error:
        raise ValueError(f'invalid project amount: {raw_amount!r}') from error
    if not amount.is_finite() or amount < 0:
        raise ValueError(f'invalid project amount: {raw_amount!r}')
    return 'reported_zero' if amount == 0 else 'reported_amount'


def build(source=SOURCE, output=OUTPUT):
    with source.open(newline='', encoding='utf-8') as csv_input:
        reader = csv.DictReader(csv_input)
        if not reader.fieldnames or 'amount_ksh' not in reader.fieldnames:
            raise ValueError('project CSV must contain an amount_ksh column')
        if 'amount_status' in reader.fieldnames:
            raise ValueError('source CSV already contains amount_status')
        fields = [*reader.fieldnames, 'amount_status']
        with output.open('w', newline='', encoding='utf-8') as csv_output:
            writer = csv.DictWriter(csv_output, fieldnames=fields)
            writer.writeheader()
            for row in reader:
                row['amount_status'] = amount_status(row.get('amount_ksh'))
                writer.writerow(row)


if __name__ == '__main__':
    build()
