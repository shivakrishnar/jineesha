select
    CurrentDisplayName,
    EmployeeCode,
    EmailAddress,
    FirstName,
    LastName
from
    dbo.Employee
where
    ID = @employeeId