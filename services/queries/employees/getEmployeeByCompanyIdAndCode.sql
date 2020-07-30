select
    EmployeeCode
from
    dbo.Employee
where
    CompanyID = @companyId and
    EmployeeCode in (@employeeCodes)