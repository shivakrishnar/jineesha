select
    CurrentDisplayName,
    EmployeeCode,
    EmailAddress
from
    dbo.Employee
where
    ID = @employeeId