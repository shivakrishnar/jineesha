declare @_companyId as int = @companyId;
declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @_managerRoleLevel as int = 25;
declare @employeeList table (
    ID int,
    CompanyID int,
    EmployeeCode nvarchar(50),
    FirstName nvarchar(max),
    LastName nvarchar(max)
);

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
        srl.Level = @_managerRoleLevel
),
ManagerEmployee as (
    select
        EmployeeID
    from
        dbo.HRnextUserEmployee
    where
        HRnextUserID = @_userId
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
ManagedEmployees as 
(
	select 
		ee.ID,
		ee.CompanyID,
        ee.EmployeeCode,
		ee.FirstName,
        ee.LastName
	from
		dbo.Employee ee,
		ManagerEmployee me
	where 
		me.EmployeeID in (ee.CurrentSupervisor1ID, ee.CurrentSupervisor2ID, ee.CurrentSupervisor3ID)
    and ee.CompanyID in (select CompanyID from AssignedCompanies)
    and ee.CompanyID in (select CompanyID from Roles)
    and ee.CompanyID = @_companyId
)
insert into @employeeList
select
    ID,
    CompanyID,
    EmployeeCode,
    FirstName,
    LastName
from
    ManagedEmployees

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