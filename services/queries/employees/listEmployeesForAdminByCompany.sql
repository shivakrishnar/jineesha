declare @_companyId as int = @companyId;
declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @_adminRoleLevel as int = 50;
declare @employeeList table (
    ID int,
    CompanyID int,
    EmployeeCode nvarchar(50),
    FirstName nvarchar(max),
    LastName nvarchar(max),
    IsActive bit
);
declare @_search as nvarchar(max) = '%' + @search + '%';

set @_userId = (select ID from dbo.HRnextUser where Username = @_username);

with Roles as (
    select
        sr.CompanyID,
        srl.Level
    from
        dbo.SecRoleUser sru
    left join dbo.SecRole sr on sr.ID = sru.RoleID
    left join dbo.SecRoleLevel srl on srl.ID = sr.RoleLevelID
    where
        sru.UserID = @_userId and
        srl.Level = @_adminRoleLevel
),
AssignedCompanies as
(
    select
        CompanyID
    from
        dbo.HRnextUserCompany
    where
        HRnextUserID = @_userId
),
EmployeeList as 
(
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
        ee.CompanyID = @_companyId
    and ee.CompanyID in (select CompanyID from AssignedCompanies)
    and ee.CompanyID in (select CompanyID from Roles)
    and concat(FirstName, LastName, EmployeeCode) like @_search
)
insert into @employeeList
select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName,
    IsActive
from
    EmployeeList

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