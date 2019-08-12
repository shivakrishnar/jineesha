declare @_employeeId as int = @employeeId;
declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @_adminRoleLevel as int = 50;

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
EmployeeCompanies as (
    select
        ee.CompanyID
    from
        dbo.Employee ee
    left join dbo.HRnextUserEmployee ue on ue.EmployeeID = ee.ID
    where
        ue.HRnextUserID = @_userId
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
    dbo.Employee ee
    inner join EmployeeCompanies ec on ee.CompanyID = ec.CompanyID
    inner join AssignedCompanies ac on ee.CompanyID = ac.CompanyID
    inner join Roles r on ee.CompanyID = r.CompanyID
where 
    ee.ID = @_employeeId
