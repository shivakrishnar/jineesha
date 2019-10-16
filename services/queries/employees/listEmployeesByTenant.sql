declare @_search as nvarchar(max) = '%' + @search + '%';

-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.Employee
where
    concat(FirstName, LastName, EmployeeCode) like @_search

select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    dbo.Employee
where
    concat(FirstName, LastName, EmployeeCode) like @_search
order by CompanyID