select
    ID,
    PRIntegration_ClientID,
    PRIntegrationCompanyCode,
    CompanyName
from
    dbo.Company
where
    ID = '@companyId'