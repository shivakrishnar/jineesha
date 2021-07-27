select
    EmployeeID,
    FlatCoverage,
    FlatAmount,
    EarningsMultiplier,
    WorkHours
from
    dbo.GroupTermLife
where
    EmployeeID = @employeeId