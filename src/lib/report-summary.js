export function summariseClinicChecks(reports) {
  const by = new Map();
  for (const report of reports) {
    const key = `${report.ward}|${report.place.trim().toLowerCase()}`;
    (by.get(key) ?? by.set(key, []).get(key)).push(report);
  }
  return [...by.values()].map((list) => {
    const count = (field, value) => list.filter((report) => report.clinic?.[field] === value).length;
    const unknown = (field, values) => list.filter((report) => !values.includes(report.clinic?.[field])).length;
    return {
      place: list[0].place,
      ward: list[0].ward,
      n: list.length,
      latest: list.map((report) => report.reportedOn).sort().pop(),
      medicines: {
        yes: count('medicines', 'yes'),
        some: count('medicines', 'some missing'),
        none: count('medicines', 'none'),
        unknown: unknown('medicines', ['yes', 'some missing', 'none']),
      },
      staff: { yes: count('staff', 'yes'), no: count('staff', 'no'), unknown: unknown('staff', ['yes', 'no']) },
      openHours: { yes: count('openHours', 'yes'), no: count('openHours', 'no'), unknown: unknown('openHours', ['yes', 'no']) },
      waiting: {
        under30: count('waiting', 'under 30 min'),
        thirtyToSixty: count('waiting', '30 to 60 min'),
        oneToTwoHours: count('waiting', '1 to 2 hours'),
        overTwoHours: count('waiting', 'over 2 hours'),
        unknown: unknown('waiting', ['under 30 min', '30 to 60 min', '1 to 2 hours', 'over 2 hours']),
      },
    };
  });
}
