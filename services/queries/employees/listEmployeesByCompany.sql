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
    ee.ID,
    ee.CompanyID,
    EmployeeCode,
    FirstName,
    LastName,
    EmailAddress,
    s.IndicatesActiveEmployee as IsActive
from
    dbo.Employee ee left join dbo.StatusType s on ee.CurrentStatusTypeID = s.ID
where
    ee.CompanyID = @_companyId and
    concat(FirstName, LastName, EmployeeCode) like @_search
order by ID