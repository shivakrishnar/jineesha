declare @_email nvarchar(max) = '@email'
declare @_companyId int = @companyId
declare @_userId int = (select top 1 ID from dbo.HRnextUser where Username = @_email)
declare @_roleLevel nvarchar(max) = (
    select
        roleLevel = case
            when IsGA = 1 or IsSuperAdmin = 1 then 'GAOrSuperAdmin'
            when IsServiceBureauAdmin = 1 then 'SBAdmin'
            else 'Other'
        end
    from
        dbo.HRnextUser
    where
        ID = @_userId
)

if (@_roleLevel = 'GAOrSuperAdmin')
begin
    select
        ID,
        CompanyName,
        ESignatureProductTierId,
        EsignatureProductTierName = (select Name from dbo.EsignatureProductTier where ID = ESignatureProductTierId),
        CreateDate
    from
        dbo.Company
    where
        ID = @_companyId
end
else if (@_roleLevel = 'SBAdmin')
begin
    select
        ID,
        CompanyName,
        EsignatureProductTierID,
        EsignatureProductTierName = (select Name from dbo.EsignatureProductTier where ID = ESignatureProductTierId),
        CreateDate
    from
        dbo.Company
    where
        ID = @_companyId
        and ID not in (
            select
                CompanyID
            from
                dbo.HRnextUserCompanyExclude
            where
                HRnextUserID = @_userId
        )
end
else
begin
    select
        ID,
        CompanyName,
        EsignatureProductTierID,
        EsignatureProductTierName = (select Name from dbo.EsignatureProductTier where ID = ESignatureProductTierId),
        CreateDate
    from
        dbo.Company
    where
        ID = @_companyId
        and ID in (
            select
                CompanyID
            from
                dbo.HRnextUserCompany
            where HRnextUserID = @_userId
        )
end