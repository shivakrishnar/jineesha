export function getValidFlatCoverageObject(): any {
  return {
    flatCoverage: true,
    flatAmount: 50.00,
  };
}

export function getValidEarningsMultiplierObject(): any {
  return {
    flatCoverage: false,
    earningsMultiplier: 1000,
  };
}

export function getValidWorkHoursObject(): any {
  return {
    flatCoverage: false,
    earningsMultiplier: 1000,
    workHours: 5,
  };
}