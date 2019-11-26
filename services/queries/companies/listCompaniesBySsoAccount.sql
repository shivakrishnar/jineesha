select
    companyId = c.ID,
    companyName = c.CompanyName,
    evoClientId = c.PRIntegration_ClientID,
    evoCompanyId = c.PR_Integration_PK,
    evoCompanyCode = c.PRIntegrationCompanyCode,
    hasLogo = IIF(cld.CompanyID IS NULL, 0, 1)
from
    dbo.HRnextUser u
inner join
    dbo.HRnextUserCompany uc on uc.HRnextUserID = u.ID
inner join
    dbo.Company c on c.ID = uc.CompanyID
left join
    dbo.CompanyLogoDocument cld on cld.CompanyID = c.ID
where
    u.PR_Integration_PK = '@ssoAccountId'
