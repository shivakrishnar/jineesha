declare @_companyId as int = @companyId;
declare @_search as nvarchar(max) = '%' + @search + '%';

-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.Employee
where
    CompanyID = @_companyId and
    concat(FirstName, LastName, EmployeeCode) like @_search

select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName,
    EmailAddress
from
    dbo.Employee
where
    CompanyID = @_companyId and
    concat(FirstName, LastName, EmployeeCode) like @_search
order by ID