declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @employeeList table (
    ID int,
    CompanyID int,
    FirstName nvarchar(max),
    LastName nvarchar(max),
    EmployeeCode nvarchar(max)
)
declare @_search as nvarchar(max) = '%' + @search + '%';

set @_userId = (select ID from dbo.HRnextUser where Username = @_username);

;with ExcludedUserCompanies as
(
    select
        CompanyID
    from
        dbo.HRnextUserCompanyExclude
    where
        HRnextUserID = @_userId
),
CompanyList as
(
    select
        ID
    from
        dbo.Company
    where
        ID not in (select CompanyID from ExcludedUserCompanies)
)

insert into @employeeList
select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    dbo.Employee
where
    CompanyID in (select ID from CompanyList) and
    concat(FirstName, LastName, EmployeeCode) like @_search

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
    LastName
from
    @employeeList
order by CompanyID
