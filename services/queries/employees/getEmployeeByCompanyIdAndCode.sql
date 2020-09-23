select
    EmployeeCode,
    EmailAddress,
    FirstName,
    LastName
from
    dbo.Employee
where
    CompanyID = @companyId and
    EmployeeCode in (@employeeCodes)