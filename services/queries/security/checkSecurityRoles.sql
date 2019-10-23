/*==============================================================
  UserSecurityRole.sql
 
  Description:
  -----------
  Retrieves the security roles of an HR SSO user in addition to
  special permissions the assigned roles confers to the user
  in place of the 'normal' access privilege reserved for that
  resource.
   
  NB: This query is intentionally restricted to 'top level'
      resources - pages -  eg: EmployeeDeductionList.aspx.
      Reference the AccessibleResource CTE   
==============================================================*/
 
-- SSO user
declare @_username varchar(256) = '@userEmail'
declare @_employeeId int = '@employeeId'
 
;with SecurityRole as
(
    select
            sru.UserID
        ,   SecurityRoleID =  sr.ID
        ,   ApplicationRoleName = sr.Name
        ,   sr.CompanyID
        ,   ApplicationRoleLevel = srl.Level
     
    from
        dbo.SecRoleUser sru
        left join dbo.SecRole sr on sru.RoleID = sr.ID
        left join dbo.SecRoleLevel srl on srl.ID = sr.RoleLevelID
),
 
AccessibleResource as
(
    select
            sr.ID
        ,   sr.Name
    from
        dbo.SecResource sr
        inner join dbo.SecResourceType srt on sr.ResourceTypeID = srt.ID
    where
        srt.Name in ('Form')  -- options: MenuItem, Control
)
 
select distinct
    -- SSO information
        hrUser.ID
    ,	hrEmp.EmployeeID
    ,   hrUser.FirstName
    ,   hrUser.LastName
    ,   IsSsoGlobalAdmin = hrUser.IsGA
    ,   IsSsoSuperAdmin = hrUser.IsSuperAdmin
    ,   IsSsoServiceBureauAdmin = hrUser.IsServiceBureauAdmin
    ,   IsSsoPayrollMaintainer = hrUser.IsPayrollRightsGranted_EVO
    ,   IsSsoPayrollCompanyMaintainer = hrUser.IsCompanyRightsGranted_EVO
    ,   IsSsoPayrollEmployeeMaintainer = hrUser.IsEmployeeRightsGranted_EVO
 
    -- Internal Application role
    ,   sr.UserID
    ,   sr.ApplicationRoleName
    ,   sr.CompanyID
    ,   sr.ApplicationRoleLevel
 
    -- Permissions
    ,   ResourceName = rsx.Name
    ,   IsAccessible = sp.IsVisible
    ,   CanRead = sp.IsRead
    ,   CanCreate = sp.IsCreate
    ,   CanUpdate = sp.IsUpdate
    ,   CanDelete = sp.IsDelete
 
from
    dbo.HRnextUser hrUser
    inner join dbo.HRnextUserEmployee hrEmp on hrUser.ID = hrEmp.HRnextUserID
    left join SecurityRole sr on hrUser.ID = sr.UserID
    left join dbo.SecPermissionRole spr  on sr.SecurityRoleID = spr.RoleID
    left join dbo.SecPermission sp on spr.PermissionID = sp.ID
    left join AccessibleResource rsx on sp.ResourceID = rsx.ID
    inner join dbo.Employee ee on hrEmp.EmployeeID = ee.ID
     
where
    Username = @_username
    and ee.ID = @_employeeId
 
order by
    ApplicationRoleLevel , ResourceName 