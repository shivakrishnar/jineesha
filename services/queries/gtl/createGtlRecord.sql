declare @_employeeId bigint = @employeeId;
declare @_flatCoverage bit = @flatCoverage;
declare @_flatAmount numeric(18,2) = @flatAmount;
declare @_earningsMultiplier numeric(18,2) = @earningsMultiplier;
declare @_workHours int = @workHours;

insert into dbo.GroupTermLife (
    EmployeeID,
    FlatCoverage,
    FlatAmount,
    EarningsMultiplier,
    WorkHours
) values (
    @_employeeId,
    @_flatCoverage,
    @_flatAmount,
    @_earningsMultiplier,
    @_workHours
)
