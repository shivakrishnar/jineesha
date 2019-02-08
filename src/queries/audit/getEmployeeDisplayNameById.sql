select
    CurrentDisplayName,
    EmployeeCode
from
    dbo.Employee
where
    ID = @employeeId