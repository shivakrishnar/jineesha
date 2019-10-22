declare @_companyId as int = @companyId;
declare @_username as nvarchar(max) = '@username';
declare @_userId as int;
declare @_role as nvarchar(max);

set @_userId = (select ID from dbo.HRnextUser where Username = @_username);
set @_role = (
    select
        Role = case
            when IsGA = 1 or IsSuperAdmin = 1 then 'GlobalSuperAdmin'
            when IsServiceBureauAdmin = 1 then 'ServiceBureauAdmin'
            else 'Other'
        end
    from
        dbo.HRnextUser
    where
        Username = @_username
);

if (@_role = 'Other') begin
    with Roles as (
        select
            sr.CompanyID,
            srl.Level
        from
            dbo.SecRoleUser sru
        left join dbo.SecRole sr on sr.ID = sru.RoleID
        left join dbo.SecRoleLevel srl on srl.ID = sr.RoleLevelID
        where
            sru.UserID = @_userId
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
        r.CompanyID,
        r.Level
    from
        Roles r
    inner join AssignedCompanies ac on ac.CompanyID = r.CompanyID
    
end
else begin
    if (@_role = 'GlobalSuperAdmin') begin
        select
            ID
        from
            dbo.Company
        where
            ID = @_companyId
    end
    else begin
        select
            c.ID
        from
            dbo.Company c
        where
            c.ID = @_companyId and
            c.ID not in (
                select
                    CompanyID
                from
                    dbo.HRnextUserCompanyExclude
                where
                    HRnextUserID = @_userId
            )
    end    
end