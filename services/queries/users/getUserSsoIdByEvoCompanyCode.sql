declare @_companyCode as nvarchar(20) = '@companyCode'

select
    u.ID,
    u.PR_Integration_PK
from 
    dbo.HRnextUser u
join dbo.HRnextUserCompany uc on u.ID = uc.HRnextUserID 
join dbo.Company c on c.ID = uc.CompanyID
where
    PRIntegrationCompanyCode = @_companyCode and
    u.PR_Integration_PK is not null
