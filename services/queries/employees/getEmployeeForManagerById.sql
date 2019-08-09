declare @_employeeId as int = @employeeId;
declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @_managerRoleLevel as int = 25;

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
)

select 
    ee.ID,
    ee.CompanyID,
    ee.EmployeeCode,
    ee.FirstName,
    ee.LastName
from
    ManagerEmployee me,
    dbo.Employee ee
    inner join AssignedCompanies ac on ee.CompanyID = ac.CompanyID
    inner join Roles r on ee.CompanyID = r.CompanyID
where 
    me.EmployeeID in (ee.CurrentSupervisor1ID, ee.CurrentSupervisor2ID, ee.CurrentSupervisor3ID)
    and ee.ID = @_employeeId
