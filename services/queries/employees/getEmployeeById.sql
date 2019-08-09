select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    dbo.Employee
where
    ID = @employeeId