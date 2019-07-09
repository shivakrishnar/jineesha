-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.Employee

select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    dbo.Employee
order by CompanyID