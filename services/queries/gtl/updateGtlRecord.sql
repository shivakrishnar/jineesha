declare @_employeeId bigint = @employeeId;
declare @_flatCoverage bit = @flatCoverage;
declare @_flatAmount numeric(18,2) = @flatAmount;
declare @_earningsMultiplier numeric(18,2) = @earningsMultiplier;
declare @_workHours int = @workHours;

update
    dbo.GroupTermLife
set
    FlatCoverage = @_flatCoverage,
    FlatAmount = @_flatAmount,
    EarningsMultiplier = @_earningsMultiplier,
    WorkHours = @_workHours
where
    EmployeeID = @_employeeId