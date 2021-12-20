declare @userId as int, @_username as varchar(max) = '@username', @_companyId as int = '@companyId'
set @userId = (select top 1 ID from HRnextUser where Username = @_username)

declare @isSBAdmin as bit, @isSuperAdminOrAbove as bit

select
    @isSBAdmin = case
        when IsServiceBureauAdmin = 1 then 1
        else 0
    end,
    @isSuperAdminOrAbove = case
        when IsGA = 1 or IsSuperAdmin = 1 then 1
        else 0
    end
from
    dbo.HRnextUser
where ID = @userId
print @isSBAdmin

if (@isSuperAdminOrAbove = 1)
begin
    select UserExistsInCompany = 1
end
else if (@isSBAdmin = 1)
begin
    select
        UserExistsInCompany = (
            case
                when count(*) >= 1 then 0
                else 1
            end
        )
    from dbo.HRnextUserCompanyExclude
    where HRnextUserID = @userId
    and CompanyID = @_companyId
end
else
begin
    -- verifies that the user is attached to the company and has a role for that company
    ;with CompanyAssignment as (
        select u.*
        from dbo.HRnextUser u
        join dbo.HRnextUserCompany huc on huc.HRnextUserID = u.ID
        where u.ID = @userId and huc.CompanyID = @_companyId
    ),
    RoleAssignment as (
        select u.*
        from dbo.HRnextUser u
        join dbo.SecRoleUser sru on sru.UserID = u.ID
        join dbo.SecRole sr on sr.ID = sru.RoleID
        where u.ID = @userId and sr.CompanyID = @_companyId
    )
    select
        UserExistsInCompany = (
            case
                when (select count(*) from CompanyAssignment) >= 1 and (select count(*) from RoleAssignment) >= 1 then 1
                else 0
            end
        )
end