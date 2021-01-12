declare @_companyId as int = @companyId;
declare @_username as nvarchar(max) = '@username';
declare @employeeList table (
    ID int,
    CompanyID int,
    EmployeeCode nvarchar(50),
    FirstName nvarchar(max),
    LastName nvarchar(max),
    IsActive bit
)
declare @_search as nvarchar(max) = '%' + @search + '%';

declare @_userId as int = (select ID from dbo.HRnextUser where Username = @_username);
declare @_excludedCompanyId as int = (
    select 
        CompanyID
    from
        dbo.HRnextUserCompanyExclude
    where
        HRnextUserID = @_userId
    and CompanyID = @_companyId
);

insert into @employeeList
select
    ee.ID,
    ee.CompanyID,
    ee.EmployeeCode,
    ee.FirstName,
    ee.LastName,
    s.IndicatesActiveEmployee as IsActive
from
    dbo.Employee ee left join dbo.StatusType s on ee.CurrentStatusTypeID = s.ID
where
    ee.CompanyID = @_companyId and
    concat(FirstName, LastName, EmployeeCode) like @_search

if @_companyId = @_excludedCompanyId 
    delete from @employeeList

-- Get total count for pagination
select
    count(*) as totalCount
from
    @employeeList

select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName,
    IsActive
from
    @employeeList
order by CompanyID


