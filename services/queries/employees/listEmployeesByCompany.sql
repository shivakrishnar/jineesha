declare @_companyId as int = @companyId;

-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.Employee
where
    CompanyID = @_companyId

select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    dbo.Employee
where
    CompanyID = @_companyId
order by ID